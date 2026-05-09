import type { StorybookConfig } from '@storybook/html-vite';

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
