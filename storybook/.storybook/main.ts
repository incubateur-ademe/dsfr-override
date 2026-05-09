import type { StorybookConfig } from '@storybook/html-vite';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as parseYaml } from 'js-yaml';
import type { Mapping } from '../../builder/types.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(HERE, '../..');

/**
 * Snapshot des champs de `mapping.yml` qui pilotent le branding du Storybook.
 * Sert à générer un theme "DSFR override" qui suit la palette / la fonte
 * configurées plutôt que d'embarquer les couleurs officielles État en dur.
 */
interface AdemeBranding {
  fontBase: string;
  primaryHex: string;
  primaryHexDark: string;
  secondaryHex: string;
  brandTitle: string;
}

function readAdemeBranding(): AdemeBranding {
  const fallback: AdemeBranding = {
    fontBase: '"Marianne", sans-serif',
    primaryHex: '#000091',
    primaryHexDark: '#8585f6',
    secondaryHex: '#3a3a3a',
    brandTitle: 'DSFR override'
  };
  const mappingPath = resolve(PROJECT_ROOT, 'mapping.yml');
  if (!existsSync(mappingPath)) return fallback;
  let mapping: Mapping | null = null;
  try {
    mapping = parseYaml(readFileSync(mappingPath, 'utf8')) as Mapping | null;
  } catch {
    return fallback;
  }
  if (!mapping) return fallback;
  const cssName = mapping.typography?.primary?.['css-name'];
  const fontBase = cssName ? `"${cssName}", sans-serif` : fallback.fontBase;
  const colorEntries = Object.entries(mapping.colors ?? {});
  const primaryAnchor = colorEntries[0]?.[1]?.anchor?.hex ?? fallback.primaryHex;
  const secondaryAnchor = colorEntries[1]?.[1]?.anchor?.hex ?? fallback.secondaryHex;
  return {
    fontBase,
    primaryHex: primaryAnchor,
    // En dark mode, Storybook a besoin d'une variante plus claire que l'anchor.
    // Le tone-up `+33% L*` reste lisible pour la grande majorité des hex saisis.
    primaryHexDark: lightenHex(primaryAnchor, 0.33),
    secondaryHex: secondaryAnchor,
    brandTitle: fallback.brandTitle
  };
}

/**
 * Variante allégée d'un hex : convertit RGB → HSL, ajoute `delta` à la
 * luminance (clamp 0..1), reconvertit. Utilisé pour dériver une variante
 * dark mode à partir de l'anchor primary du mapping.
 */
function lightenHex(hex: string, delta: number): string {
  const m = /^#?([0-9a-f]{6})$/i.test(hex) ? /^#?([0-9a-f]{6})$/i.exec(hex) : null;
  if (!m || !m[1]) return hex;
  const n = parseInt(m[1], 16);
  let r = ((n >> 16) & 0xff) / 255;
  let g = ((n >> 8) & 0xff) / 255;
  let b = (n & 0xff) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  const l0 = (max + min) / 2;
  const s = max === min ? 0 : (l0 > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min));
  if (max !== min) {
    if (max === r) h = ((g - b) / (max - min) + (g < b ? 6 : 0));
    else if (max === g) h = (b - r) / (max - min) + 2;
    else h = (r - g) / (max - min) + 4;
    h /= 6;
  }
  const l = Math.max(0, Math.min(1, l0 + delta));
  if (s === 0) {
    const v = Math.round(l * 255);
    return `#${v.toString(16).padStart(2, '0').repeat(3)}`;
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t0: number): number => {
    let t = t0;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  r = hue2rgb(h + 1 / 3);
  g = hue2rgb(h);
  b = hue2rgb(h - 1 / 3);
  const toHex = (v: number): string => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Réutilise toutes les stories / mdx que DSFR ship dans le submodule. Nos
// overrides atteignent ces stories via le CSS qu'on sert depuis
// `<projectRoot>/dist/` (monté sous `/dist/` via `staticDirs`) — les stories
// elles-mêmes restent pristines.
const config: StorybookConfig = {
  stories: [
    '../../dsfr/dsfr-sb/*.mdx',
    // `src/dsfr/**/*.mdx` est exclu : DSFR ne ship pas de `.mdx` par composant,
    // uniquement des `.stories.js`. L'inclure produirait juste un warning
    // no-match.
    '../../dsfr/src/dsfr/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],

  addons: [
    '@storybook/theming',
    '@storybook/addon-themes',
    '@whitespace/storybook-addon-html',
    '@storybook/addon-mdx-gfm',
    {
      name: '@storybook/addon-essentials',
      options: {
        backgrounds: false,
        actions: false,
        outline: false,
        grid: false,
        viewport: true
      }
    }
  ],

  framework: {
    name: '@storybook/html-vite',
    options: {}
  },

  // Le renderer autodocs pull `@mdx-js/react` + `react/jsx-runtime` lazily.
  // Sans pré-bundling explicite, vite reload l'iframe en plein render et les
  // pages docs restent blanches. Lister ces deps dans `optimizeDeps` les force
  // à être prêtes avant le moindre render docs.
  viteFinal: (config) => {
    config.optimizeDeps = {
      ...config.optimizeDeps,
      include: [
        ...(config.optimizeDeps?.include ?? []),
        '@mdx-js/react',
        'react/jsx-runtime'
      ]
    };
    // Injecte les couleurs / la fonte de `mapping.yml` en globals au build.
    // `dsfr-theme.ts` (côté navigateur) les lit via `declare const ...` pour
    // construire un theme Storybook qui colle à la config courante.
    const branding = readAdemeBranding();
    config.define = {
      ...config.define,
      __ADEME_FONT_BASE__: JSON.stringify(branding.fontBase),
      __ADEME_PRIMARY_HEX__: JSON.stringify(branding.primaryHex),
      __ADEME_PRIMARY_HEX_DARK__: JSON.stringify(branding.primaryHexDark),
      __ADEME_SECONDARY_HEX__: JSON.stringify(branding.secondaryHex),
      __ADEME_BRAND_TITLE__: JSON.stringify(branding.brandTitle)
    };
    return config;
  },

  // Storybook 8.6 a son propre middleware de validation d'host devant Vite —
  // setter `server.allowedHosts` de Vite n'a aucun effet. Le flag vit sur
  // `core.allowedHosts`. `true` accepte n'importe quel header Host, ce qui
  // convient à un outil de dev local reachable via tailscale / reverse proxy.
  core: {
    allowedHosts: true
  },

  docs: {
    autodocs: 'tag'
  },

  staticDirs: [
    './static',
    // `dist/` héberge aussi `dist/icons/` (copié + overlay Lucide par le
    // builder), donc plus besoin d'un mount séparé pour les icônes.
    { from: '../../dist', to: 'dist' },
    { from: '../../dsfr/tool/example/img', to: 'img' },
    // Les pictogrammes restent servis depuis le submodule — on ne les curate
    // (ni override) pas encore.
    { from: '../../dsfr/src/dsfr/core/asset/artwork', to: 'dist/artwork' },
    // Le JS DSFR vanilla vient du package npm — le submodule lui-même ne ship
    // pas de `dist/`. Les stories en ont besoin pour les composants interactifs.
    { from: '../node_modules/@gouvfr/dsfr/dist/dsfr', to: 'vendor' }
  ]
};

export default config;
