import { parse, stringify } from 'yaml';
import { computeFamilyPalette } from 'ademe-palette';
import { contrastRatio, hexToLch, lchToHex } from 'ademe-lch';
import hljs from 'hljs/core';
import yamlLang from 'hljs/yaml';
import type {
  Mapping,
  ColorFamily,
  IconAddEntry,
  PaletteEntry
} from '../builder/types.js';

// hljs/yaml is typed as `() => unknown` upstream stub; registerLanguage wants
// `() => HljsLanguage`. The browser CDN guarantees compatibility at runtime.
hljs.registerLanguage('yaml', yamlLang as Parameters<typeof hljs.registerLanguage>[1]);

// All DSFR color families (from dsfr/src/module/color/variable/_options.scss).
// Used by the "+ Add family" dropdown and validated in the family-key select.
const DSFR_FAMILIES: readonly string[] = [
  'blue-france', 'red-marianne',
  'info', 'success', 'warning', 'error',
  'beige-gris-galet', 'blue-cumulus', 'blue-ecume',
  'brown-cafe-creme', 'brown-caramel', 'brown-opera',
  'green-archipel', 'green-bourgeon', 'green-emeraude',
  'green-menthe', 'green-tilleul-verveine',
  'orange-terre-battue', 'pink-macaron', 'pink-tuile',
  'purple-glycine', 'yellow-moutarde', 'yellow-tournesol'
  // Skipped: 'grey' (always overridden by DSFR _decisions, not anchor-driven).
];

type UtilityName = 'error' | 'warning' | 'success' | 'info';
interface HueRange { min: number; max: number }

// Hue ranges (LCh, h° in degrees) for utility colors. Anchors outside their
// range are blocked in the UI to prevent semantic mismatch (a green error
// or a red success). Ranges are deliberately wide.
const UTILITY_HUE_RANGES: Record<UtilityName, HueRange> = {
  error:   { min: 340, max: 40 },   // wraps 0°
  warning: { min: 20,  max: 80 },
  success: { min: 90,  max: 180 },
  info:    { min: 180, max: 280 }
};
const UTILITY_NAMES: readonly UtilityName[] = ['info', 'success', 'warning', 'error'];
const isUtilityName = (s: string): s is UtilityName => (UTILITY_NAMES as readonly string[]).includes(s);

// Returns true when h (in degrees) lies in [min, max], handling wrap-around
// (e.g. error spans 340..40 across 0°).
function hueInRange(h: number | null | undefined, { min, max }: HueRange): boolean {
  if (h == null || Number.isNaN(h)) return false;
  return min <= max ? (h >= min && h <= max) : (h >= min || h <= max);
}

type UtilityCheck =
  | { ok: true; lch: { L: number; C: number; h: number } }
  | { ok: false; reason: string };

// Validates an anchor candidate for a utility slot. Reasons:
//   - hue out of range → semantic mismatch
//   - L* < 35 → too dark, won't satisfy WCAG against a light fill
//   - hex round-trips poorly → out-of-gamut chroma after clamp
function checkUtilityAnchor(hex: string, utility: string): UtilityCheck {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return { ok: false, reason: 'hex invalide' };
  const range = isUtilityName(utility) ? UTILITY_HUE_RANGES[utility] : undefined;
  let L: number, C: number, h: number;
  try { [L, C, h] = hexToLch(hex); } catch { return { ok: false, reason: 'hex non parsable' }; }
  if (range && !hueInRange(h, range)) {
    return { ok: false, reason: `teinte h°=${h.toFixed(0)} hors zone ${utility} (${range.min}–${range.max}°)` };
  }
  if (L < 35) return { ok: false, reason: `L*=${L.toFixed(1)} trop sombre (< 35) pour un grade main d'utility` };
  // Out-of-gamut sanity: round-trip through lchToHex; if it shifts more than
  // ~12 bytes total (3 channels), the chroma was clamped significantly.
  const back = lchToHex(L, C, h);
  const dist = [0, 1, 2].reduce((s, i) => {
    const a = parseInt(hex.slice(1 + 2*i, 3 + 2*i), 16);
    const b = parseInt(back.slice(1 + 2*i, 3 + 2*i), 16);
    return s + Math.abs(a - b);
  }, 0);
  if (dist > 12) return { ok: false, reason: `couleur hors gamut sRGB (saturation excessive)` };
  return { ok: true, lch: { L, C, h } };
}

// =============================================================================
// State : single source of truth, mirrors mapping.yml schema
// =============================================================================

const DEFAULT_STATE: Mapping = {
  version: 1,
  dsfr: '1.14.4',
  typography: {
    primary: {
      'css-name': 'Marianne',
      'files-source': './assets/fonts/',
      weights: {
        '300': { normal: 'PublicSans-Light',   italic: 'PublicSans-LightItalic' },
        '400': { normal: 'PublicSans-Regular', italic: 'PublicSans-Italic' },
        '500': { normal: 'PublicSans-Medium',  italic: 'PublicSans-MediumItalic' },
        '700': { normal: 'PublicSans-Bold',    italic: 'PublicSans-BoldItalic' }
      }
    },
    alt: 'keep'
  },
  colors: {
    'blue-france': {
      rename: 'blue-ate',
      anchor: { hex: '#4950FB' },
      generation: 'lch-remap',
      'recalibrate-grade': { 'main-525': 'main-444', 'sun-113': 'sun-157' }
    },
    'red-marianne': {
      rename: 'red-laura',
      anchor: { hex: '#FF3333' },
      generation: 'lch-remap',
      'add-grades': { 'sun-157': { L: 15.7, 'c-factor': 1.10 } },
      'recalibrate-grade': { 'main-472': 'main-560' },
      'semantic-remap': { 'red-marianne-425': 'red-marianne-sun-157' }
    }
  },
  elevation: {
    'shadow-color': { light: 'rgba(0, 0, 0, 0.16)', dark: 'rgba(0, 0, 0, 0.32)' }
  },
  'border-radius': {
    base: '0.75rem',
    targets: [
      { selector: '.fr-input',           value: '0.75rem' },
      { selector: '.fr-select',          value: '0.75rem' },
      { selector: '.fr-btn',             value: '0.75rem' },
      { selector: '.fr-badge',           value: '0.75rem' },
      { selector: '.fr-card',            value: '0.75rem', overflow: true },
      { selector: '.fr-alert',           value: '0.75rem', overflow: true },
      { selector: '.fr-callout',         value: '0.75rem', overflow: true },
      { selector: '.fr-notice',          value: '0.75rem' },
      { selector: '.fr-consent-banner',  value: '0.75rem' },
      { selector: '.fr-pagination__link', value: '0.75rem' },
      { selector: '.fr-stepper__steps',  value: '0.75rem', overflow: true }
    ]
  },
  components: { remove: ['header', 'footer'] },
  'manual-overrides': ['./overrides/_card-fix.scss', './overrides/_alert-fix.scss'],
  icons: {
    overrides: {
      'fr--success-fill': 'circle-check',
      'fr--success-line': 'circle-check',
      'fr--warning-fill': 'triangle-alert',
      'fr--warning-line': 'triangle-alert',
      'fr--error-fill':   'circle-x',
      'fr--error-line':   'circle-x',
      'fr--info-fill':    'info',
      'fr--info-line':    'info',
      'fr--accessibility-fill': 'accessibility',
      'fr--accessibility-line': 'accessibility'
    },
    add: ['flame', 'leaf', { token: 'ademe-pin', name: 'map-pin' }]
  },
  'post-process': { rename: { enabled: true, 'safety-check': true } },
  'post-css': { enabled: true, banner: true }
};

let state: Mapping = structuredClone(DEFAULT_STATE);

// Helper: state.colors[name] with non-null assertion. Callsites guarantee the
// family exists at runtime, but `noUncheckedIndexedAccess` widens to undefined.
function fam(name: string): ColorFamily {
  return (state.colors as Record<string, ColorFamily>)[name] as ColorFamily;
}

// =============================================================================
// HTML escape — every value coming from state (which can include parsed YAML
// from a user-loaded file) is funneled through esc() before being interpolated
// into a template literal.
// =============================================================================

const esc = (v: unknown): string => String(v ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

// =============================================================================
// Section renderers
// =============================================================================

interface SectionOpts { cliOnly?: boolean; help?: string }

function $section(title: string, body: string, opts: SectionOpts = {}): string {
  const badge = opts.cliOnly ? ' <span class="badge" title="Modification non visible dans la preview, appliquée au build CLI uniquement">build CLI</span>' : '';
  const help = opts.help ? ` <button type="button" class="help" data-help="${esc(opts.help)}" aria-label="Aide : ${esc(title)}" tabindex="0">?</button>` : '';
  return `<section class="section"><h2>${esc(title)}${badge}${help}</h2>${body}</section>`;
}
// fieldId() returns a stable id derived from a path so labels can `for=id`
// the inputs and assistive tech / form autofill work correctly.
const slug = (s: string): string => String(s).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
function fieldId(path: string): string { return 'f-' + slug(path); }

// $field(label, input, id, hint, help) :
//   hint = light inline grey text after the label
//   help = rich multi-line tooltip behind a `?` chip, can include newlines
function $field(label: string, input: string, id?: string | null, hint?: string | null, help?: string | null): string {
  const hintHtml = hint ? ` <small style="color:#888;font-size:10px">${esc(hint)}</small>` : '';
  const helpHtml = help ? ` <button type="button" class="help" data-help="${esc(help)}" aria-label="Aide : ${esc(label)}" tabindex="0">?</button>` : '';
  const labelOpen = id ? `<label for="${esc(id)}">` : `<label>`;
  return `<div class="field">${labelOpen}${esc(label)}${hintHtml}${helpHtml}</label>${input}</div>`;
}
interface InputOpts {
  id: string;
  path: string;
  value?: unknown;
  type?: string;
  placeholder?: string;
  step?: string | number;
  min?: string | number;
  max?: string | number;
  list?: string;
}
function $input(opts: InputOpts): string {
  const { id, path, value, type = 'text', placeholder = '', step, min, max, list } = opts;
  const attrs = [
    `type="${esc(type)}"`,
    `id="${esc(id)}"`,
    `name="${esc(id)}"`,
    `data-path="${esc(path)}"`,
    value != null ? `value="${esc(value)}"` : '',
    placeholder ? `placeholder="${esc(placeholder)}"` : '',
    step != null ? `step="${esc(step)}"` : '',
    min != null ? `min="${esc(min)}"` : '',
    max != null ? `max="${esc(max)}"` : '',
    list ? `list="${esc(list)}"` : ''
  ].filter(Boolean).join(' ');
  return `<input ${attrs}>`;
}

function renderMeta(): string {
  const idV = fieldId('version'), idD = fieldId('dsfr');
  return $section('Méta', `
    ${$field('version (du mapping)', $input({ id: idV, path: 'version', value: state.version, type: 'number', step: 1, min: 1 }), idV, null,
      'Version du schéma de `mapping.yml`. Permet au builder de refuser un fichier trop ancien si le schéma évolue.')}
    ${$field('dsfr (version du submodule)', $input({ id: idD, path: 'dsfr', value: state.dsfr, placeholder: '1.14.4' }), idD, 'doit matcher `dsfr/` HEAD',
      'Version DSFR cible. Doit matcher exactement le tag du submodule git checkouté dans `dsfr/`.\nUtilisé pour le banner et pour le check de drift upstream.')}
  `);
}

function renderTypo(): string {
  const p = state.typography?.primary ?? {};
  const idCss = fieldId('typo-css-name');
  const idSrc = fieldId('typo-files-source');
  const idAlt = fieldId('typo-alt');
  const weights = Object.entries(p.weights ?? {})
    .map(([w, v], i) => {
      const idN = fieldId(`typo-weight-${i}-normal`);
      const idI = fieldId(`typo-weight-${i}-italic`);
      const idW = fieldId(`typo-weight-${i}-weight`);
      return `<div class="list-row" data-weight="${esc(w)}">
        <input type="number" id="${esc(idW)}" name="${esc(idW)}" value="${esc(w)}" data-key="weight" min="100" max="900" step="100" style="max-width: 70px" title="Poids CSS (100, 200, … 900)">
        <input type="text" id="${esc(idN)}" name="${esc(idN)}" value="${esc(v?.normal)}" data-key="normal" placeholder="PublicSans-Regular" list="list-font-files" title="Fichier normal (autocomplete depuis assets/fonts/)">
        <input type="text" id="${esc(idI)}" name="${esc(idI)}" value="${esc(v?.italic)}" data-key="italic" placeholder="PublicSans-Italic" list="list-font-files" title="Fichier italic (autocomplete depuis assets/fonts/)">
        <button class="icon-btn" data-action="rm-weight" title="Supprimer">×</button>
      </div>`;
    }).join('');
  return $section('Typographie', `
    <h3>Primary</h3>
    ${$field('css-name', $input({ id: idCss, path: 'typography.primary.css-name', value: p['css-name'], placeholder: 'Marianne' }), idCss, 'nom CSS de la fonte',
      'Nom utilisé dans la propriété `font-family` du CSS. Garder `Marianne` permet de neutraliser la fonte officielle sans casser `var(--font-family-primary)` dans le DSFR.\nSi ce nom est changé, tous les composants DSFR qui pointent vers `Marianne` cesseront de matcher.')}
    ${$field('files-source', $input({ id: idSrc, path: 'typography.primary.files-source', value: p['files-source'], placeholder: './assets/fonts/' }), idSrc, 'chemin vers les fichiers font',
      'Dossier où le builder cherche les fichiers `.woff` / `.woff2` référencés ci-dessous. Relatif à la racine du projet.')}
    <div class="note">Poids → fichier normal / fichier italic (sans extension)</div>
    ${weights}
    <h3>Alt</h3>
    ${$field('alt', `<select id="${esc(idAlt)}" name="${esc(idAlt)}" data-path="typography.alt"><option value="keep" ${state.typography?.alt === 'keep' ? 'selected' : ''}>keep (Spectral)</option></select>`, idAlt, null,
      'Fonte alternative (utilisée par `fr-text--alt`). `keep` = la fonte du DSFR (Spectral) est conservée.\nLe builder copie automatiquement les fichiers Spectral du submodule vers `dist/fonts/`.')}
  `);
}

function renderColors(): string {
  const families = Object.entries(state.colors ?? {}) as Array<[string, ColorFamily]>;
  const used = new Set(families.map(([k]) => k));
  const blocks = families.map(([family, cfg], famIdx) => {
    const anchorHex = cfg.anchor?.hex ?? '#000000';
    const idKey = fieldId(`color-${family}-key`);
    const idRen = fieldId(`color-${family}-rename`);
    const idCol = fieldId(`color-${family}-color`);
    const idHex = fieldId(`color-${family}-hex`);
    const recal = Object.entries(cfg['recalibrate-grade'] ?? {})
      .map(([from, to], i) => {
        const idF = fieldId(`color-${family}-recal-${i}-from`);
        const idT = fieldId(`color-${family}-recal-${i}-to`);
        return `<div class="list-row" data-recal-from="${esc(from)}">
          <input type="text" id="${esc(idF)}" name="${esc(idF)}" value="${esc(from)}" data-key="from" placeholder="main-525" title="Grade DSFR original">
          <span aria-hidden="true">→</span>
          <input type="text" id="${esc(idT)}" name="${esc(idT)}" value="${esc(to)}" data-key="to" placeholder="main-444" title="Nouveau nom de grade">
          <button class="icon-btn" data-action="rm-recal" title="Supprimer">×</button>
        </div>`;
      }).join('');
    // family-key is a select bound to DSFR_FAMILIES (+ the current value if it
    // somehow drifts). Switching it renames the key in state.colors.
    const famOptions = [family, ...DSFR_FAMILIES.filter(f => f !== family && !used.has(f))]
      .map(f => `<option value="${esc(f)}" ${f === family ? 'selected' : ''}>${esc(f)}</option>`).join('');
    const isUtility = isUtilityName(family);
    const isPrimary = famIdx < 2 && !isUtility;
    const utilityWarning = isUtility ? checkUtilityAnchor(anchorHex, family) : null;
    const utilityBadge = utilityWarning && !utilityWarning.ok
      ? `<div class="utility-warning" role="alert">⚠ ${esc(utilityWarning.reason)}</div>`
      : '';
    // Utility preset dropdown: secondary (if compatible) + curated list.
    // Selecting a preset just rewrites anchor.hex — no schema change.
    let presetSelect = '';
    if (isUtility) {
      const sec = getSecondaryAnchor(family);
      const secOk = sec && checkUtilityAnchor(sec.hex, family).ok;
      const opts: string[] = [];
      opts.push(`<option value="">— Choisir un preset —</option>`);
      if (sec) {
        if (secOk) {
          opts.push(`<option value="${esc(sec.hex)}">secondary (${esc(sec.family)} — ${esc(sec.hex)})</option>`);
        } else {
          opts.push(`<option disabled>secondary (${esc(sec.family)}) hors zone</option>`);
        }
      }
      for (const [hex, label] of UTILITY_PRESETS[family] ?? []) {
        opts.push(`<option value="${esc(hex)}">${esc(label)} — ${esc(hex)}</option>`);
      }
      presetSelect = `<div class="field field--preset">
        <label for="${esc(fieldId(`color-${family}-preset`))}">Preset <button type="button" class="help" data-help="Raccourcis pour caler l&#39;anchor sur une teinte connue compatible avec l&#39;utility.&#10;&#10;&#96;secondary&#96; : reprend l&#39;anchor de la 2ᵉ famille primaire si sa teinte tombe dans la zone autorisée (ex : &#96;red-laura&#96; → OK pour &#96;error&#96;).&#10;&#96;DSFR &lt;utility&gt;&#96; : valeur historique du DSFR pour cet utility, conservée pour la migration douce.&#10;Autres : couleurs d&#39;inspiration courantes (Tailwind / web standards) pré-validées." aria-label="Aide preset utility" tabindex="0">?</button></label>
        <select id="${esc(fieldId(`color-${family}-preset`))}" data-action="apply-preset">${opts.join('')}</select>
      </div>`;
    }
    return `<div data-family="${esc(family)}" class="family${isUtility ? ' family--utility' : ''}${isPrimary ? ' family--primary' : ''}">
      <div class="family__head">
        <h3>${isUtility ? 'Utilitaire' : 'Famille'} <button type="button" class="help" data-help="Une famille = un anchor + un mapping de grades (75, 100, …, 975, sun, main).&#10;Le builder calcule chacun des 11 grades par remapping LCh autour de l&#39;anchor : la teinte (h°) et la chroma (C*) viennent de l&#39;anchor, la luminance (L*) suit le profil DSFR." aria-label="Aide famille" tabindex="0">?</button></h3>
        <button class="icon-btn" data-action="rm-family" title="Retirer cette famille du mapping">×</button>
      </div>
      ${$field('Nom DSFR (clé)', `<select id="${esc(idKey)}" name="${esc(idKey)}" data-key="family-key">${famOptions}</select>`, idKey, 'identifiant dans le mapping',
        'Nom de la famille DSFR à overrider. Liste fermée : les 24 familles connues de `dsfr/src/module/color/variable/_options.scss`. Changer la clé renomme l\'entrée dans `state.colors`.')}
      ${$field('Rename (libre)', `<input type="text" id="${esc(idRen)}" name="${esc(idRen)}" value="${esc(cfg.rename)}" data-key="rename" placeholder="blue-ate">`, idRen, 'nouveau nom dans le CSS final',
        'Texte avec lequel le post-process sed remplace `blue-france` (ou la clé d’origine) dans `dist/*.css|js`.\nValeur libre — toute chaîne sans espaces marche. Sert à neutraliser les références État du CSS final.\nExemples : `blue-ate`, `vert-ademe`, `theme-2026`.')}
      ${presetSelect}
      <div class="field field--color">
        <label for="${esc(idHex)}">Anchor <button type="button" class="help" data-help="Couleur de référence (un seul hex). Tous les grades de la famille sont recalculés par déplacement de luminance autour de cet anchor — la teinte et la chroma sont conservées.&#10;&#10;C&#39;est la couleur que &#96;main-XXX&#96; portera. Le numéro du grade &#96;main&#96; est dérivé de la luminance LCh : &#96;main-444&#96; pour L*=44.4, &#96;main-560&#96; pour L*=56.0." aria-label="Aide anchor" tabindex="0">?</button></label>
        <input type="color" id="${esc(idCol)}" name="${esc(idCol)}" value="${esc(anchorHex.toLowerCase())}" data-key="anchor-color">
        <input type="text" id="${esc(idHex)}" name="${esc(idHex)}" class="hex" value="${esc(anchorHex)}" data-key="anchor-hex" placeholder="#4950FB" pattern="^#?[0-9a-fA-F]{6}$">
        <span class="wcag-mini">
          ${wcagMiniBadges(anchorHex)}
        </span>
        <button type="button" class="help" data-help="Ratios de contraste WCAG du grade main (= anchor lui-même) :&#10;- 1ʳᵉ valeur : sur fond blanc (&#96;#ffffff&#96;)&#10;- 2ᵉ valeur : sur fond sombre (&#96;#1e1e1e&#96;, ≈ DSFR text-default-grey)&#10;&#10;Code couleur :&#10;- vert (AAA) : ratio ≥ 7 (WCAG niveau AAA texte)&#10;- jaune (AA) : ratio ≥ 4.5 (WCAG niveau AA texte)&#10;- rouge (fail) : sous 4.5, RGAA AA non garanti pour usage texte&#10;&#10;Note : le grade main est rarement utilisé pour du texte (cf. fonctions DSFR &#96;text-action-high-XXX&#96;), un fail ici n&#39;est donc pas bloquant. La vue Palette LCh affiche un check plus complet sur &#96;sun-157&#96;, &#96;main&#96;, &#96;625&#96;." aria-label="Aide WCAG" tabindex="0">?</button>
      </div>
      <h3>Recalibrate-grade <button type="button" class="help" data-help="Émet des alias de grades pour ne casser ni les références internes DSFR ni le nouveau naming.&#10;&#10;Exemple : &#96;main-525: main-444&#96; veut dire « le grade DSFR original &#96;main-525&#96; n&#39;existe plus — il s&#39;appelle maintenant &#96;main-444&#96; ». Le builder émet alors &#96;--blue-france-main-525&#96; ET &#96;--blue-france-main-444&#96; avec la même valeur, donc :&#10;1. Les composants DSFR qui pointent vers &#96;main-525&#96; continuent à fonctionner&#10;2. Le nouveau nom &#96;main-444&#96; (cohérent avec L*×10) est dispo&#10;&#10;Le builder gère les &#96;main-&#96; (changement après calcul de L*×10) automatiquement, mais pour &#96;sun-XXX → sun-YYY&#96; il faut le déclarer explicitement." aria-label="Aide recalibrate" tabindex="0">?</button></h3>
      ${recal}
      <button class="add-btn" data-action="add-recal">+ recalibrate</button>
      ${utilityBadge}
      <hr style="border: 0; border-top: 1px solid #eee; margin: 0.75rem 0">
    </div>`;
  }).join('');
  // "+ Add family" footer: dropdown of unused DSFR families + Utility shortcuts.
  const unused = DSFR_FAMILIES.filter(f => !used.has(f));
  const utilityShortcuts = UTILITY_NAMES.filter(u => !used.has(u))
    .map(u => `<button class="add-btn add-btn--utility" data-action="add-utility" data-utility="${esc(u)}">+ ${esc(u)}</button>`).join(' ');
  const addFamilyRow = unused.length
    ? `<div class="add-family">
         <select id="add-family-select" aria-label="Famille à ajouter">
           ${unused.map(f => `<option value="${esc(f)}">${esc(f)}</option>`).join('')}
         </select>
         <button class="add-btn" data-action="add-family">+ Ajouter cette famille</button>
         ${utilityShortcuts ? `<span style="opacity: 0.6; font-size: 11px">ou raccourcis utilitaires :</span> ${utilityShortcuts}` : ''}
       </div>`
    : '<p style="opacity: 0.6">Toutes les familles DSFR sont déjà mappées.</p>';
  return $section('Couleurs', blocks + addFamilyRow, { help:
'Pour chaque famille DSFR (`blue-france`, `red-marianne`…), définit un anchor de couleur. Le builder calcule automatiquement les 11 grades (`75` → `975`, `sun`, `main`) via remapping LCh autour de cet anchor.\n\n• `Nom DSFR (clé)` : identifiant dans `dsfr/_options.scss`.\n• `Rename` : nom libre utilisé par le post-process sed pour neutraliser le préfixe État dans le CSS final.\n• `Anchor` : couleur de référence. Sert à dériver tous les autres grades.\n• `Recalibrate` : émet un alias entre 2 noms de grade (l\'ancien ET le nouveau pointent sur la même valeur).' });
}

// border-radius values in the mapping are stored as full CSS strings
// ("0.75rem"). The UI shows just the rem number; conversion happens in the
// input handler (we always wrap the user-typed number with "rem" before
// storing).
const remOf = (v: string | null | undefined): string => {
  if (v == null) return '';
  const m = String(v).trim().match(/^(-?\d+(?:\.\d+)?)\s*rem$/i);
  return m ? m[1]! : '';
};

function renderRadius(): string {
  const idBase = fieldId('radius-base');
  const targets = (state['border-radius']?.targets ?? []).map((t, i) => {
    const idSel = fieldId(`radius-target-${i}-selector`);
    const idVal = fieldId(`radius-target-${i}-value`);
    const idOvf = fieldId(`radius-target-${i}-overflow`);
    return `
    <div class="list-row" data-target-idx="${i}">
      <input type="text" id="${esc(idSel)}" name="${esc(idSel)}" value="${esc(t.selector)}" data-key="selector" placeholder=".fr-card" title="Sélecteur CSS">
      <input type="number" id="${esc(idVal)}" name="${esc(idVal)}" value="${esc(remOf(t.value))}" data-key="value" placeholder="0.75" step="0.125" min="0" max="4" style="max-width: 80px" title="Valeur en rem">
      <label class="toggle" style="margin: 0; flex: 0 0 auto" for="${esc(idOvf)}">
        <input type="checkbox" id="${esc(idOvf)}" name="${esc(idOvf)}" data-key="overflow" ${t.overflow ? 'checked' : ''}>
        <span>overflow</span>
      </label>
      <button class="icon-btn" data-action="rm-target" title="Supprimer">×</button>
    </div>`;
  }).join('');
  return $section('Border-radius', `
    ${$field('Base', `<input type="number" id="${esc(idBase)}" name="${esc(idBase)}" value="${esc(remOf(state['border-radius']?.base))}" data-path="border-radius.base" data-rem placeholder="0.75" step="0.125" min="0" max="4">`, idBase, 'en rem',
      'Valeur de référence (mémo). Pas utilisée directement par le builder pour le moment, sert de source de vérité pour les valeurs émises sur les targets.')}
    <h3>Targets <small style="font-weight: 400; color: #888">(values en rem)</small> <button type="button" class="help" data-help="Chaque target = un sélecteur CSS + un radius à appliquer dans &#96;dist/dsfr-ademe.css&#96;.&#10;&#10;&#96;overflow&#96; : ajoute &#96;overflow: hidden&#96; à la règle.&#10;Indispensable pour les composants dont la décoration (bordure simulée, barre colorée, image) déborde du radius — sans ça, les coins arrondis ne clippent pas le contenu.&#10;Exemples : &#96;.fr-card&#96; (image qui déborde), &#96;.fr-alert&#96; (gradient barre 40px à gauche)." aria-label="Aide overflow" tabindex="0">?</button></h3>
    ${targets}
    <button class="add-btn" data-action="add-target">+ target</button>
  `, { help:
'Border-radius par sélecteur CSS. Le builder émet une règle simple `.fr-card { border-radius: 0.75rem }` en fin de cascade, donc bat naturellement les radii DSFR par défaut.\n\nL\'option `overflow` ajoute `overflow: hidden` — utile quand la décoration du composant (barres colorées en background, gradients, etc.) ne respecte pas le `border-radius` (cas `.fr-card` et `.fr-alert`).' });
}

function renderShadows(): string {
  const sc = state.elevation?.['shadow-color'] ?? {};
  const idL = fieldId('shadow-light'), idD = fieldId('shadow-dark');
  return $section('Elevation (shadows)', `
    ${$field('Light shadow-color', $input({ id: idL, path: 'elevation.shadow-color.light', value: sc.light, placeholder: 'rgba(0, 0, 0, 0.16)' }), idL, 'CSS color',
      'Override de `--shadow-color` en mode light. DSFR utilise `rgba(0, 0, 18, 0.16)` par défaut (teinte bleu marine héritée de Marianne). Mettre `rgba(0, 0, 0, 0.16)` neutralise.')}
    ${$field('Dark shadow-color',  $input({ id: idD, path: 'elevation.shadow-color.dark',  value: sc.dark,  placeholder: 'rgba(0, 0, 0, 0.32)' }), idD, 'mode dark',
      'Override de `--shadow-color` émis sous `:root[data-fr-theme=dark]`. DSFR par défaut : `rgba(0, 0, 18, 0.32)`.')}
  `, { help:
'Couleur de l\'ombre portée. DSFR la lit via `--shadow-color` (utilisée par `.fr-card--shadow` et autres élévations).' });
}

function renderComponents(): string {
  const removed = new Set(state.components?.remove ?? []);
  const known = ['header', 'footer', 'consent', 'breadcrumb', 'navigation', 'translate'];
  const all = Array.from(new Set([...known, ...removed]));
  const items = all.map(c => {
    const id = fieldId(`comp-${c}`);
    return `<label class="toggle" for="${esc(id)}">
      <input type="checkbox" id="${esc(id)}" name="${esc(id)}" data-component="${esc(c)}" ${removed.has(c) ? 'checked' : ''}>
      <span>${esc(c)}</span>
    </label>`;
  }).join('');
  return $section('Composants à exclure', `<div class="checkboxes">${items}</div>`, { cliOnly: true, help:
'Liste de composants DSFR à retirer du build (`header`, `footer`, etc.).\n\nLe builder strip les `@import` correspondants dans `component/{main,legacy,print}.scss` du workspace, donc le composant n\'apparaît plus dans `dsfr-ademe.css` du tout.\n\nAucun effet sur la preview live (qui charge le CSS déjà buildé). Le changement n\'est visible qu\'après `pnpm build`.' });
}

function renderPostProcess(): string {
  const pp = state['post-process']?.rename ?? {};
  const pc = state['post-css'] ?? {};
  const t = (id: string, path: string, checked: boolean | undefined, label: string): string => {
    return `<label class="toggle" for="${esc(id)}"><input type="checkbox" id="${esc(id)}" name="${esc(id)}" data-path="${esc(path)}" ${checked ? 'checked' : ''}> <span>${esc(label)}</span></label>`;
  };
  return $section('Post-process', `
    <h3>Rename CSS final (sed) <button type="button" class="help" data-help="Remplace &#96;blue-france&#96; par la valeur de &#96;Rename&#96; (et &#96;red-marianne&#96; par la sienne) dans le CSS final.&#10;&#10;C&#39;est un sed sur &#96;dist/*.css|js&#96; après le build. Le &#96;safety-check&#96; refuse de renommer si le mot apparaît dans un contexte ambigu (commentaire, prose), pour éviter des renommages parasites." aria-label="Aide rename" tabindex="0">?</button></h3>
    ${t(fieldId('pp-rename-enabled'), 'post-process.rename.enabled', pp.enabled, 'enabled')}
    ${t(fieldId('pp-rename-safety'),  'post-process.rename.safety-check', pp['safety-check'], 'safety-check (refuse les renames ambigus)')}
    <h3>PostCSS <button type="button" class="help" data-help="&#96;enabled&#96; : applique &#96;mqpacker&#96; (regroupe les &#96;@media&#96;), &#96;combine-duplicated-selectors&#96; et &#96;discard-duplicates&#96; sur &#96;dist/*.css&#96;. Réduit la taille d&#39;environ 24% et produit une sortie byte-identique au CSS DSFR officiel.&#10;&#10;&#96;banner&#96; : insère un commentaire en tête du fichier (&#96;ADEME Design System — based on DSFR &lt;version&gt; (MIT)…&#96;)." aria-label="Aide postcss" tabindex="0">?</button></h3>
    ${t(fieldId('pc-enabled'), 'post-css.enabled', pc.enabled !== false, 'enabled (mqpacker + dedup)')}
    ${t(fieldId('pc-banner'),  'post-css.banner',  pc.banner !== false,  'banner ADEME en tête du fichier')}
    ${$field('Banner-text', `<textarea id="${esc(fieldId('pc-banner-text'))}" name="${esc(fieldId('pc-banner-text'))}" data-path="post-css.banner-text" data-strip-empty rows="3" placeholder="(vide → 'ADEME Design System — based on DSFR <version> (MIT)…')">${esc(pc['banner-text'] ?? '')}</textarea>`, fieldId('pc-banner-text'), 'vide → texte par défaut',
      'Texte du commentaire inséré en tête du CSS final (uniquement si `banner` est activé). Multi-lignes possible — PostCSS l\'enrobe automatiquement dans `/* … */`. Aucune variable interpolée : le texte est utilisé tel quel. Pour citer la version DSFR, l\'écrire en dur dans le champ ; le laisser vide reprend le banner par défaut généré.')}
  `, { cliOnly: true, help:
'Étapes appliquées après la compilation sass, sur le CSS final dans `dist/`.\n\nChaque sous-étape est opt-out via son toggle. Aucun effet sur la preview live.' });
}

interface NormalizedIconAdd { token: string; name: string }

function renderIcons(): string {
  const ic = state.icons ?? {};
  const overrides = Object.entries(ic.overrides ?? {});
  const add: NormalizedIconAdd[] = (ic.add ?? []).map((e: IconAddEntry): NormalizedIconAdd => {
    if (typeof e === 'string') return { token: e, name: e };
    // The shape `{ name; token? }` in IconAddEntry: token defaults to name.
    return { token: e.token ?? e.name, name: e.name };
  });
  // <img> previews resolved via /__api/icons/<source>/svg/<name>.svg. The
  // server 404s on unknown names, the onerror swap to a neutral placeholder
  // keeps the layout stable while typing.
  const dsfrPreview = (name: string): string => `<img class="icon-preview" alt="" src="../__api/icons/dsfr/${esc(name)}.svg" onerror="this.style.opacity=0.15;this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22/>'">`;
  const lucidePreview = (name: string): string => `<img class="icon-preview" alt="" src="../__api/icons/lucide/${esc(name)}.svg" onerror="this.style.opacity=0.15;this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22/>'">`;

  const ovRows = overrides.map(([from, to], i) => {
    const idF = fieldId(`icon-ov-${i}-from`);
    const idT = fieldId(`icon-ov-${i}-to`);
    return `<div class="list-row list-row--icons" data-icon-ov-from="${esc(from)}">
      ${dsfrPreview(from)}
      <input type="text" id="${esc(idF)}" name="${esc(idF)}" value="${esc(from)}" data-key="from" list="list-dsfr-icons" placeholder="fr--success-fill" title="Nom DSFR (préfixe fr-- inclus)">
      <span aria-hidden="true">→</span>
      <input type="text" id="${esc(idT)}" name="${esc(idT)}" value="${esc(to)}" data-key="to" list="list-lucide-icons" placeholder="circle-check" title="Nom Lucide">
      ${lucidePreview(to)}
      <button class="icon-btn" data-action="rm-icon-ov" title="Supprimer">×</button>
    </div>`;
  }).join('');
  const addRows = add.map((entry, i) => {
    const idTok = fieldId(`icon-add-${i}-token`);
    const idNm  = fieldId(`icon-add-${i}-name`);
    return `<div class="list-row list-row--icons" data-icon-add-idx="${i}">
      <input type="text" id="${esc(idTok)}" name="${esc(idTok)}" value="${esc(entry.token)}" data-key="token" placeholder="flame" title="Token court → .fr-icon-<token>">
      <span aria-hidden="true">=</span>
      <input type="text" id="${esc(idNm)}" name="${esc(idNm)}" value="${esc(entry.name)}" data-key="name" list="list-lucide-icons" placeholder="flame" title="Nom Lucide source (= token si alias non nécessaire)">
      ${lucidePreview(entry.name)}
      <button class="icon-btn" data-action="rm-icon-add" title="Supprimer">×</button>
    </div>`;
  }).join('');
  return $section('Icônes', `
    <h3>Overrides <button type="button" class="help" data-help="Remplace le SVG d&#39;une icône DSFR (clé = nom DSFR avec préfixe &#96;fr--&#96;) par son équivalent Lucide. Le nom de classe CSS (&#96;.fr-icon-success-fill&#96;) reste, donc les composants DSFR continuent de marcher — seul le contenu du fichier change. Lucide étant stroke-based, le rendu en mask-image donne une silhouette en lignes (pas en aplat plein comme les Remix DSFR)." aria-label="Aide overrides icônes" tabindex="0">?</button></h3>
    ${ovRows}
    <button class="add-btn" data-action="add-icon-ov">+ override</button>
    <h3>Add (nouvelles classes utilitaires) <button type="button" class="help" data-help="Ajoute des icônes Lucide accessibles via &#96;.fr-icon-&lt;token&gt;&#96;. Le token = nom de la classe générée. Le name = nom Lucide source (mis à token si alias non nécessaire). Exemple : &#96;{ token: ademe-pin, name: map-pin }&#96; → &#96;.fr-icon-ademe-pin&#96; sourcé sur lucide &#96;map-pin&#96;." aria-label="Aide add icônes" tabindex="0">?</button></h3>
    ${addRows}
    <button class="add-btn" data-action="add-icon-add">+ icône à ajouter</button>
  `, { cliOnly: true, help:
'Pipeline d\'icônes :\n• `overrides` : remplace 1-1 les `fr--*` (préfixe DSFR) par des `lucide-static`.\n• `add` : ajoute des classes utilitaires `.fr-icon-<token>` puisées dans Lucide.\n\nLe builder copie les SVG depuis `node_modules/lucide-static/icons/<name>.svg`. Aucun effet sur la preview live (les SVG sont copiés au build).' });
}

function renderManualOverrides(): string {
  const items = (state['manual-overrides'] ?? []);
  const rows = items.map((p, i) => {
    const idP = fieldId(`mo-${i}`);
    return `<div class="list-row" data-mo-idx="${i}">
      <input type="text" id="${esc(idP)}" name="${esc(idP)}" value="${esc(p)}" data-key="path" placeholder="./overrides/_card-fix.scss" title="Chemin relatif au projet">
      <button class="icon-btn" data-action="rm-mo" title="Supprimer">×</button>
    </div>`;
  }).join('');
  return $section('Manual overrides', `
    ${rows}
    <button class="add-btn" data-action="add-mo">+ override SCSS</button>
  `, { cliOnly: true, help:
'Liste de fichiers SCSS user-curated (trackés dans `overrides/`, non-générés) à `@import` en fin de cascade.\n\nUtile quand un override demande une logique impossible à exprimer côté `mapping.yml` (ex : `_card-fix.scss` redessine la bordure card avec `box-shadow: inset` parce que les gradients DSFR ignorent le `border-radius`).' });
}

function renderAll(): void {
  const html = [renderMeta(), renderTypo(), renderColors(), renderRadius(), renderShadows(), renderComponents(), renderIcons(), renderManualOverrides(), renderPostProcess()].join('');
  // All interpolated values went through esc() — safe to use innerHTML here.
  document.querySelector('.settings')!.innerHTML = html;
  attachHandlers();
}

// =============================================================================
// Path-based state mutation
// =============================================================================

function setPath(obj: unknown, path: string, value: unknown): void {
  const keys = path.split('.');
  let cur = obj as Record<string, unknown>;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]!;
    const next = cur[k];
    if (next == null || typeof next !== 'object') cur[k] = {};
    cur = cur[k] as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]!] = value;
}

// Sensible starter anchor for a freshly-added family. Utility families pick a
// hex squarely in their hue range; primaries fall back to a neutral mid-grey
// so the user immediately sees the family appearing and tweaks the anchor.
function defaultAnchorFor(family: string): string {
  const fallback = '#888888';
  const map: Record<string, string> = {
    error:   '#FF3333',  // red, h°≈30
    warning: '#FF8C1A',  // orange, h°≈55
    success: '#1FA85B',  // green, h°≈140
    info:    '#3B82F6'   // blue, h°≈250
  };
  return map[family] || fallback;
}

// Hand-picked presets per utility, all anchored squarely in their hue range
// so users get a quick "in-range" choice without dropping into the full picker.
// First entry = current DSFR default for that utility (visual continuity).
const UTILITY_PRESETS: Record<UtilityName, ReadonlyArray<readonly [string, string]>> = {
  error:   [['#CE0500', 'DSFR error'], ['#DC2626', 'Crimson'],   ['#FF4D4D', 'Coral']],
  warning: [['#B34000', 'DSFR warning'], ['#F59E0B', 'Amber'],     ['#FF7700', 'Orange']],
  success: [['#18753C', 'DSFR success'], ['#10B981', 'Emerald'],   ['#228B22', 'Forest']],
  info:    [['#0063CB', 'DSFR info'],    ['#0EA5E9', 'Sky'],       ['#4F46E5', 'Indigo']]
};

interface SecondaryAnchor { family: string; hex: string }

// "Secondary" by DSFR convention = the 2nd primary family (blue-france is 1st,
// red-marianne is 2nd — secondary). We return the 2nd non-utility entry of
// state.colors so a renamed mapping still works. Null if fewer than 2 primaries.
function getSecondaryAnchor(currentFamily: string): SecondaryAnchor | null {
  const primaries = (Object.entries(state.colors ?? {}) as Array<[string, ColorFamily]>)
    .filter(([k]) => !isUtilityName(k) && k !== currentFamily);
  if (primaries.length < 2) return null;
  const second = primaries[1]!;
  const [name, cfg] = second;
  if (!cfg.anchor?.hex) return null;
  return { family: cfg.rename || name, hex: cfg.anchor.hex };
}

function deletePath(obj: unknown, path: string): void {
  const keys = path.split('.');
  let cur = obj as Record<string, unknown>;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]!;
    const next = cur[k];
    if (next == null || typeof next !== 'object') return;
    cur = next as Record<string, unknown>;
  }
  delete cur[keys[keys.length - 1]!];
}

function attachHandlers(): void {
  for (const el of document.querySelectorAll<HTMLInputElement>('[data-path]')) {
    const path = el.dataset['path']!;
    el.addEventListener('input', () => {
      let v: string | boolean = el.type === 'checkbox' ? el.checked : el.value;
      // data-rem: wrap a numeric input value into "<n>rem" before storing.
      if (el.dataset['rem'] != null && typeof v === 'string' && v !== '') v = `${v}rem`;
      // data-strip-empty: empty string → unset the key, so YAML and the CLI
      // consumer fall back on their default (the `??` chain in builder/index.js
      // only treats null/undefined as "absent", not "").
      if (el.dataset['stripEmpty'] != null && v === '') {
        deletePath(state, path);
      } else {
        setPath(state, path, v);
      }
      onStateChanged();
    });
  }

  for (const famEl of document.querySelectorAll<HTMLElement>('.family')) {
    const family = famEl.dataset['family']!;
    const colorInput = famEl.querySelector<HTMLInputElement>('[data-key="anchor-color"]')!;
    const hexInput = famEl.querySelector<HTMLInputElement>('[data-key="anchor-hex"]')!;
    const renameInput = famEl.querySelector<HTMLInputElement>('[data-key="rename"]')!;
    // Live-update the utility warning + WCAG mini badges without a full
    // renderAll, so dragging the colour picker stays smooth.
    const refreshUtilityBadge = (): void => {
      const cur = state.colors?.[family]?.anchor?.hex ?? '#000000';
      const wcagSpan = famEl.querySelector('.wcag-mini');
      if (wcagSpan) wcagSpan.innerHTML = wcagMiniBadges(cur);
      if (!isUtilityName(family)) return;
      const check = checkUtilityAnchor(cur, family);
      let badge = famEl.querySelector<HTMLDivElement>('.utility-warning');
      if (check.ok) {
        badge?.remove();
      } else {
        if (!badge) {
          badge = document.createElement('div');
          badge.className = 'utility-warning';
          badge.setAttribute('role', 'alert');
          const sep = famEl.querySelector('hr');
          if (sep) famEl.insertBefore(badge, sep);
          else famEl.appendChild(badge);
        }
        badge.textContent = '⚠ ' + check.reason;
      }
    };
    colorInput.addEventListener('input', () => {
      hexInput.value = colorInput.value.toUpperCase();
      fam(family).anchor = { hex: colorInput.value.toUpperCase() };
      refreshUtilityBadge();
      onStateChanged();
    });
    hexInput.addEventListener('input', () => {
      const v = hexInput.value.trim();
      if (/^#?[0-9a-f]{6}$/i.test(v)) {
        const hex = v.startsWith('#') ? v : '#' + v;
        colorInput.value = hex.toLowerCase();
        fam(family).anchor = { hex: hex.toUpperCase() };
        refreshUtilityBadge();
        onStateChanged();
      }
    });
    renameInput.addEventListener('input', () => {
      fam(family).rename = renameInput.value;
      onStateChanged();
    });
    famEl.querySelectorAll<HTMLElement>('[data-recal-from]').forEach(row => {
      const from = row.dataset['recalFrom']!;
      row.querySelector<HTMLInputElement>('[data-key="to"]')!.addEventListener('input', e => {
        const target = e.target as HTMLInputElement;
        const cf = fam(family);
        cf['recalibrate-grade'] ??= {};
        cf['recalibrate-grade'][from] = target.value;
        onStateChanged();
      });
      row.querySelector<HTMLButtonElement>('[data-action="rm-recal"]')!.addEventListener('click', () => {
        delete fam(family)['recalibrate-grade']![from];
        renderAll(); applyAll();
      });
    });
    famEl.querySelector<HTMLButtonElement>('[data-action="add-recal"]')!.addEventListener('click', () => {
      const cf = fam(family);
      cf['recalibrate-grade'] ??= {};
      cf['recalibrate-grade'][`grade-${Date.now()}`] = '';
      renderAll(); applyAll();
    });
    // family-key change → rename the entry in state.colors, preserving order.
    const keySelect = famEl.querySelector<HTMLSelectElement>('[data-key="family-key"]');
    if (keySelect) {
      keySelect.addEventListener('change', () => {
        const newKey = keySelect.value;
        const colors = state.colors as Record<string, ColorFamily>;
        if (!newKey || newKey === family || colors[newKey]) return;
        const next: Record<string, ColorFamily> = {};
        for (const [k, v] of Object.entries(colors)) {
          next[k === family ? newKey : k] = v;
        }
        state.colors = next;
        renderAll(); applyAll();
      });
    }
    famEl.querySelector<HTMLButtonElement>('[data-action="rm-family"]')!.addEventListener('click', () => {
      delete (state.colors as Record<string, ColorFamily>)[family];
      renderAll(); applyAll();
    });
    const presetSel = famEl.querySelector<HTMLSelectElement>('[data-action="apply-preset"]');
    if (presetSel) {
      presetSel.addEventListener('change', () => {
        const hex = presetSel.value;
        if (!hex) return;
        fam(family).anchor = { hex: hex.toUpperCase() };
        renderAll(); applyAll();
      });
    }
  }
  // "+ Add family" footer wiring.
  const addFamilyBtn = document.querySelector<HTMLButtonElement>('[data-action="add-family"]');
  if (addFamilyBtn) addFamilyBtn.addEventListener('click', () => {
    const sel = document.getElementById('add-family-select') as HTMLSelectElement | null;
    const name = sel?.value;
    if (!name || state.colors?.[name]) return;
    state.colors ??= {};
    // Default anchor: a sane DSFR-flavoured value per family bucket. For
    // utilities we pick a hue squarely inside the validated range so the
    // newly-added entry isn't immediately flagged.
    state.colors[name] = { generation: 'lch-remap', anchor: { hex: defaultAnchorFor(name) } };
    renderAll(); applyAll();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-action="add-utility"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset['utility'];
      if (!name || state.colors?.[name]) return;
      state.colors ??= {};
      state.colors[name] = { generation: 'lch-remap', anchor: { hex: defaultAnchorFor(name) } };
      renderAll(); applyAll();
    });
  });

  document.querySelectorAll<HTMLElement>('[data-target-idx]').forEach(row => {
    const idx = Number(row.dataset['targetIdx']);
    row.querySelector<HTMLInputElement>('[data-key="selector"]')!.addEventListener('input', e => {
      const t = e.target as HTMLInputElement;
      state['border-radius']!.targets![idx]!.selector = t.value; onStateChanged();
    });
    row.querySelector<HTMLInputElement>('[data-key="value"]')!.addEventListener('input', e => {
      const t = e.target as HTMLInputElement;
      const v = t.value;
      state['border-radius']!.targets![idx]!.value = v === '' ? '' : `${v}rem`;
      onStateChanged();
    });
    row.querySelector<HTMLInputElement>('[data-key="overflow"]')!.addEventListener('change', e => {
      const t = e.target as HTMLInputElement;
      if (t.checked) state['border-radius']!.targets![idx]!.overflow = true;
      else delete state['border-radius']!.targets![idx]!.overflow;
      onStateChanged();
    });
    row.querySelector<HTMLButtonElement>('[data-action="rm-target"]')!.addEventListener('click', () => {
      state['border-radius']!.targets!.splice(idx, 1); renderAll(); applyAll();
    });
  });
  const addTargetBtn = document.querySelector<HTMLButtonElement>('[data-action="add-target"]');
  if (addTargetBtn) addTargetBtn.addEventListener('click', () => {
    state['border-radius']!.targets!.push({ selector: '.fr-', value: '0.75rem' });
    renderAll(); applyAll();
  });

  // Live preview swap: rebind the <img> next to an input as the user types,
  // without renderAll. Falls back to the empty-svg onerror handler when the
  // name doesn't resolve.
  const updatePreview = (input: HTMLInputElement, base: string): void => {
    const prev = input.previousElementSibling;
    const nextEl = input.nextElementSibling;
    const img: HTMLImageElement | null =
      prev instanceof HTMLImageElement && prev.matches('img.icon-preview') ? prev :
      nextEl instanceof HTMLImageElement && nextEl.matches('img.icon-preview') ? nextEl :
      null;
    if (!img) return;
    const name = input.value.trim();
    if (!name) { img.removeAttribute('src'); return; }
    img.style.opacity = '';
    img.src = `${base}/${encodeURIComponent(name)}.svg`;
  };
  // Icons.overrides — pairs { from: dsfrName, to: lucideName }.
  document.querySelectorAll<HTMLElement>('[data-icon-ov-from]').forEach(row => {
    const from = row.dataset['iconOvFrom']!;
    const fromInput = row.querySelector<HTMLInputElement>('[data-key="from"]')!;
    const toInput = row.querySelector<HTMLInputElement>('[data-key="to"]')!;
    fromInput.addEventListener('input', e => {
      updatePreview(fromInput, '../__api/icons/dsfr');
      const target = e.target as HTMLInputElement;
      const newFrom = target.value;
      if (!newFrom || newFrom === from || state.icons?.overrides?.[newFrom]) return;
      const next: Record<string, string> = {};
      const cur = state.icons!.overrides as Record<string, string>;
      for (const [k, v] of Object.entries(cur)) {
        next[k === from ? newFrom : k] = v;
      }
      state.icons!.overrides = next;
      renderAll(); applyAll();
    });
    toInput.addEventListener('input', e => {
      updatePreview(toInput, '../__api/icons/lucide');
      state.icons ??= {}; state.icons.overrides ??= {};
      const target = e.target as HTMLInputElement;
      state.icons.overrides[from] = target.value;
      onStateChanged();
    });
    row.querySelector<HTMLButtonElement>('[data-action="rm-icon-ov"]')!.addEventListener('click', () => {
      delete state.icons?.overrides?.[from];
      renderAll(); applyAll();
    });
  });
  const addIconOvBtn = document.querySelector<HTMLButtonElement>('[data-action="add-icon-ov"]');
  if (addIconOvBtn) addIconOvBtn.addEventListener('click', () => {
    state.icons ??= {}; state.icons.overrides ??= {};
    state.icons.overrides[`fr--new-${Date.now()}`] = '';
    renderAll(); applyAll();
  });
  // Icons.add — array of strings or { token, name } objects.
  document.querySelectorAll<HTMLElement>('[data-icon-add-idx]').forEach(row => {
    const idx = Number(row.dataset['iconAddIdx']);
    const tokenInput = row.querySelector<HTMLInputElement>('[data-key="token"]')!;
    const nameInput = row.querySelector<HTMLInputElement>('[data-key="name"]')!;
    const setEntry = (): void => {
      const token = tokenInput.value.trim();
      const name = nameInput.value.trim();
      // Compact form (string) when token === name and token is non-empty.
      state.icons ??= {}; state.icons.add ??= [];
      state.icons.add[idx] = (token && token === name) ? token : { token, name };
      onStateChanged();
    };
    tokenInput.addEventListener('input', setEntry);
    nameInput.addEventListener('input', () => {
      updatePreview(nameInput, '../__api/icons/lucide');
      setEntry();
    });
    row.querySelector<HTMLButtonElement>('[data-action="rm-icon-add"]')!.addEventListener('click', () => {
      state.icons!.add!.splice(idx, 1);
      renderAll(); applyAll();
    });
  });
  const addIconAddBtn = document.querySelector<HTMLButtonElement>('[data-action="add-icon-add"]');
  if (addIconAddBtn) addIconAddBtn.addEventListener('click', () => {
    state.icons ??= {}; state.icons.add ??= [];
    state.icons.add.push('');
    renderAll(); applyAll();
  });
  // Manual overrides — flat array of relative paths.
  document.querySelectorAll<HTMLElement>('[data-mo-idx]').forEach(row => {
    const idx = Number(row.dataset['moIdx']);
    row.querySelector<HTMLInputElement>('[data-key="path"]')!.addEventListener('input', e => {
      const t = e.target as HTMLInputElement;
      state['manual-overrides']![idx] = t.value;
      onStateChanged();
    });
    row.querySelector<HTMLButtonElement>('[data-action="rm-mo"]')!.addEventListener('click', () => {
      state['manual-overrides']!.splice(idx, 1);
      renderAll(); applyAll();
    });
  });
  const addMoBtn = document.querySelector<HTMLButtonElement>('[data-action="add-mo"]');
  if (addMoBtn) addMoBtn.addEventListener('click', () => {
    state['manual-overrides'] ??= [];
    state['manual-overrides'].push('./overrides/_new-fix.scss');
    renderAll(); applyAll();
  });

  document.querySelectorAll<HTMLInputElement>('[data-component]').forEach(cb => {
    cb.addEventListener('change', () => {
      const name = cb.dataset['component'];
      if (!name) return;
      state.components ??= { remove: [] };
      state.components.remove ??= [];
      const list = state.components.remove;
      const i = list.indexOf(name);
      if (cb.checked && i < 0) list.push(name);
      else if (!cb.checked && i >= 0) list.splice(i, 1);
      onStateChanged();
    });
  });
}

// =============================================================================
// State change → YAML + preview
// =============================================================================

function onStateChanged(): void {
  setYamlText(stringify(state, { lineWidth: 0 }));
  setYamlStatus('ok', 'à jour');
  applyPreview();
  if (previewMode === 'palette') renderPaletteView();
}

function setYamlStatus(kind: 'ok' | 'error', msg: string): void {
  const el = document.getElementById('yaml-status')!;
  // textContent — no HTML interpretation, safe for arbitrary error strings.
  el.textContent = msg;
  el.className = 'yaml__status ' + kind;
}

// Setting the textarea value also re-renders the syntax-highlight overlay
// behind it. highlight.js produces escaped HTML, so injection-safe.
function setYamlText(text: string): void {
  const ed = document.getElementById('yaml-editor') as HTMLTextAreaElement;
  const hl = document.getElementById('yaml-hl');
  ed.value = text;
  if (hl) {
    const html = hljs.highlight(text, { language: 'yaml', ignoreIllegals: true }).value;
    // Trailing newline keeps the overlay's last line aligned with the textarea.
    hl.innerHTML = html + '\n';
  }
}

// =============================================================================
// Live preview : inject CSS vars + rules into the iframe
// =============================================================================

function applyPreview(): void {
  const iframe = document.getElementById('preview-frame') as HTMLIFrameElement | null;
  const doc = iframe?.contentDocument;
  if (!doc) return;

  const css = buildPreviewCss();
  let styleEl = doc.getElementById('ademe-builder-overrides');
  if (!styleEl) {
    styleEl = doc.createElement('style');
    styleEl.id = 'ademe-builder-overrides';
    doc.head.appendChild(styleEl);
  }
  // textContent — same content goes through the CSSOM parser, no HTML.
  styleEl.textContent = css;
  pushPreviewState();
}

interface PalettePreview {
  family: string;
  renamed: string;
  anchorHex: string;
  grades: Array<{ name: string; hex: string }>;
}

type PreviewMessage =
  | { type: 'ademe-state'; theme: PreviewTheme; fontCssName: string; palettes: PalettePreview[] }
  | { type: 'ademe-theme'; value: PreviewTheme }
  | { type: 'ademe-ready' };

// Send the live state snapshot to the example iframe. The iframe regenerates
// its palette section titles / swatches and the font diagnostic from this
// payload, so renaming a family or changing the css-name in the typo section
// reflects in the témoin without a full reload.
function pushPreviewState(): void {
  if (previewMode !== 'example') return;
  const iframe = document.getElementById('preview-frame') as HTMLIFrameElement | null;
  const win = iframe?.contentWindow;
  if (!win) return;
  const palettes: PalettePreview[] = [];
  for (const [family, cfg] of Object.entries(state.colors ?? {}) as Array<[string, ColorFamily]>) {
    if (cfg.generation !== 'lch-remap' || !cfg.anchor?.hex) continue;
    let pal: PaletteEntry[];
    try {
      pal = computeFamilyPalette({
        anchor: cfg.anchor.hex,
        recalibrate: cfg['recalibrate-grade'] ?? {},
        addGrades: cfg['add-grades'] ?? {},
        semanticRemap: deriveSemanticRemap(family, cfg)
      });
    } catch { continue; }
    palettes.push({
      family,
      renamed: cfg.rename || family,
      anchorHex: cfg.anchor.hex,
      grades: pal.map(({ name, values }) => ({ name, hex: values[0]! }))
    });
  }
  const msg: PreviewMessage = {
    type: 'ademe-state',
    theme: previewTheme,
    fontCssName: state.typography?.primary?.['css-name'] ?? 'Marianne',
    palettes
  };
  win.postMessage(msg, '*');
}

// DSFR _sets.scss combos that emit --<family>-<lightGrade>-<darkGrade> CSS
// vars. Hardcoded for the 2 ADEME-tracked families; if the user adds another
// family the live preview won't reflect the combined vars (full build CLI
// will). Variant emitted: light-mode value only (most components use that).
// Per-family combo lists are loaded at boot from /__api/dsfr-shade-combos
// (parsed from dsfr/_sets.scss). Until that resolves, this hardcoded fallback
// covers blue-france / red-marianne so the live preview works on first paint.
interface ShadeCombo { name: string; light: string; dark: string }

const FALLBACK_PRIMARY_COMBOS: readonly ShadeCombo[] = [
  { name: 'sun-113-625', light: 'sun-113', dark: '625' },
  { name: '850-200',     light: '850',     dark: '200' },
  { name: '925-125',     light: '925',     dark: '125' },
  { name: '950-100',     light: '950',     dark: '100' },
  { name: '975-75',      light: '975',     dark: '75'  },
  { name: 'main-525',    light: 'main-525', dark: 'main-525' },
  { name: '975-sun-113', light: '975',     dark: 'sun-113' }
];
let DSFR_COMBOS_BY_FAMILY: Record<string, readonly ShadeCombo[]> = {
  'blue-france':   FALLBACK_PRIMARY_COMBOS,
  'red-marianne':  FALLBACK_PRIMARY_COMBOS
};
fetch('../__api/dsfr-shade-combos.json')
  .then(r => r.ok ? r.json() : null)
  .then((j: unknown) => {
    if (j && typeof j === 'object') {
      DSFR_COMBOS_BY_FAMILY = j as Record<string, readonly ShadeCombo[]>;
      applyPreview();
    }
  })
  .catch(() => { /* keep fallback */ });

interface FamilyPaletteEntry {
  family: string;
  renamed: string;
  palette: PaletteEntry[];
  byName: Record<string, string[]>;
}

function buildPreviewCss(): string {
  // The combined shade vars (e.g. --blue-ate-sun-113-625) carry DIFFERENT
  // values in light vs dark mode — the name encodes both grades:
  // "sun-113-625" = sun-113 grade in light, 625 grade in dark.
  // DSFR emits two blocks, light and dark; we mirror that exactly so the
  // primary button is dark in light theme and light in dark theme as
  // expected. We emit each block under all 3 selectors (:root, +light,
  // +dark) plus an @media (prefers-color-scheme) wrap around the dark
  // block, to beat both data-fr-theme switching and OS-default dark.
  const familiesPalette: FamilyPaletteEntry[] = [];
  for (const [family, cfg] of Object.entries(state.colors ?? {}) as Array<[string, ColorFamily]>) {
    if (cfg.generation !== 'lch-remap' || !cfg.anchor?.hex) continue;
    let palette: PaletteEntry[];
    try {
      palette = computeFamilyPalette({
        anchor: cfg.anchor.hex,
        recalibrate: cfg['recalibrate-grade'] ?? {},
        addGrades: cfg['add-grades'] ?? {},
        semanticRemap: deriveSemanticRemap(family, cfg)
      });
    } catch { continue; }
    const byName: Record<string, string[]> = Object.fromEntries(palette.map(e => [e.name, e.values]));
    // Alias each "main-XXX" grade requested by DSFR's own combos to whichever
    // main grade our LCh remap produced — palette.js does the same on the CLI
    // side via pushWithAlias. Without this, an utility like `error` (anchor
    // #FF3333 → main-560) would not emit `--error-main-525` even though
    // _sets.scss demands it.
    const mainEntry = palette.find(e => e.name.startsWith('main-'));
    if (mainEntry) {
      const combos = DSFR_COMBOS_BY_FAMILY[family] ?? FALLBACK_PRIMARY_COMBOS;
      for (const c of combos) {
        if (c.light.startsWith('main-') && !byName[c.light]) byName[c.light] = mainEntry.values;
        if (c.dark.startsWith('main-')  && !byName[c.dark])  byName[c.dark]  = mainEntry.values;
      }
    }
    familiesPalette.push({ family, renamed: cfg.rename || family, palette, byName });
  }

  // !important on every var so we beat DSFR's own @media (prefers-color-scheme:
  // dark) block — when the OS is dark and data-fr-theme is "light", their
  // media-query-scoped :root rule can still tie or out-specify ours via
  // cascade ordering. !important is the simplest reliable lever here.
  const IMP = ' !important';
  const emitBlock = (mode: 'light' | 'dark'): string[] => {
    const out: string[] = [];
    for (const { family, renamed, palette, byName } of familiesPalette) {
      if (mode === 'light') {
        for (const { name, values } of palette) {
          out.push(`  --${family}-${name}: ${values[0]}${IMP};`);
          if (renamed !== family) out.push(`  --${renamed}-${name}: ${values[0]}${IMP};`);
        }
      }
      const combos = DSFR_COMBOS_BY_FAMILY[family] ?? FALLBACK_PRIMARY_COMBOS;
      for (const combo of combos) {
        const grade = byName[mode === 'dark' ? combo.dark : combo.light];
        if (!grade) continue;
        const def = grade[0]!;
        const hover = grade[1] ?? def;
        const active = grade[2] ?? def;
        for (const f of (renamed !== family ? [family, renamed] : [family])) {
          out.push(`  --${f}-${combo.name}: ${def}${IMP};`);
          out.push(`  --${f}-${combo.name}-hover: ${hover}${IMP};`);
          out.push(`  --${f}-${combo.name}-active: ${active}${IMP};`);
        }
      }
    }
    return out;
  };

  const lightVars = emitBlock('light');
  const darkVars  = emitBlock('dark');

  const lines: string[] = [];
  // Light defaults.
  lines.push(':root, :root[data-fr-theme=light] {');
  lines.push(...lightVars);
  if (state.elevation?.['shadow-color']?.light) {
    lines.push(`  --shadow-color: ${state.elevation['shadow-color'].light}${IMP};`);
  }
  lines.push('}');

  // Dark explicit.
  lines.push(':root[data-fr-theme=dark] {');
  lines.push(...darkVars);
  if (state.elevation?.['shadow-color']?.dark) {
    lines.push(`  --shadow-color: ${state.elevation['shadow-color'].dark}${IMP};`);
  }
  lines.push('}');

  // Dark via OS preference, but only when data-fr-theme is NOT explicitly
  // set to light. Without that guard we'd force dark even when the user
  // forced light via the toolbar, which is the wrong answer.
  lines.push('@media (prefers-color-scheme: dark) {');
  lines.push('  :root:not([data-fr-theme=light]) {');
  lines.push(...darkVars.map(l => '  ' + l));
  if (state.elevation?.['shadow-color']?.dark) {
    lines.push(`    --shadow-color: ${state.elevation['shadow-color'].dark}${IMP};`);
  }
  lines.push('  }');
  lines.push('}');

  for (const t of state['border-radius']?.targets ?? []) {
    if (!t.selector || !t.value) continue;
    let rule = `${t.selector} { border-radius: ${t.value};`;
    if (t.overflow) rule += ' overflow: hidden;';
    rule += ' }';
    lines.push(rule);
  }

  return lines.join('\n');
}

function deriveSemanticRemap(family: string, cfg: ColorFamily): Record<string, string> {
  const out: Record<string, string> = {};
  const prefix = family + '-';
  for (const [oldFull, newFull] of Object.entries(cfg['semantic-remap'] ?? {})) {
    if (oldFull.startsWith(prefix) && newFull.startsWith(prefix)) {
      out[oldFull.slice(prefix.length)] = newFull.slice(prefix.length);
    }
  }
  return out;
}

function applyAll(): void {
  setYamlText(stringify(state, { lineWidth: 0 }));
  applyPreview();
}

// =============================================================================
// Preview mode toggle: example | gallery | palette
// =============================================================================

type PreviewMode = 'example' | 'gallery' | 'palette';
type PreviewTheme = 'auto' | 'light' | 'dark';

// Paths relatifs au document `builder-ui/index.html` : indispensable pour
// que le déploiement statique sur GitHub Pages (sous-chemin `/<repo>/`)
// résolve correctement, et neutre côté dev où le serveur sert depuis la racine.
const PREVIEW_SOURCES: Record<'example' | 'gallery', string> = {
  example: '../example/index.html',
  gallery: './gallery.html'
};
let previewMode: PreviewMode = 'example';

function setPreviewMode(mode: PreviewMode): void {
  previewMode = mode;
  const iframe = document.getElementById('preview-frame') as HTMLIFrameElement | null;
  const palette = document.getElementById('palette-view');
  // Scope the toggle to the [data-mode] segmented control only — early
  // versions used `.preview__bar button` which also matched the theme
  // segmented and stripped its .active state on every view switch.
  for (const btn of document.querySelectorAll<HTMLButtonElement>('.preview__bar [data-mode]')) {
    const active = btn.dataset['mode'] === mode;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  }
  if (mode === 'palette') {
    if (iframe) iframe.hidden = true;
    if (palette) palette.hidden = false;
    renderPaletteView();
    applyPreviewTheme(); // ensures the palette container reflects the current theme
  } else {
    if (iframe) iframe.hidden = false;
    if (palette) palette.hidden = true;
    const target = PREVIEW_SOURCES[mode];
    if (iframe && target && iframe.getAttribute('src') !== target) {
      iframe.setAttribute('src', target);
    } else {
      applyPreview();
      applyPreviewTheme();
    }
  }
}

function attachPreviewToggle(): void {
  for (const btn of document.querySelectorAll<HTMLButtonElement>('.preview__bar [data-mode]')) {
    btn.addEventListener('click', () => setPreviewMode(btn.dataset['mode'] as PreviewMode));
  }
  for (const btn of document.querySelectorAll<HTMLButtonElement>('.preview__bar [data-theme]')) {
    btn.addEventListener('click', () => setPreviewTheme(btn.dataset['theme'] as PreviewTheme));
  }
}

// Preview theme: 'auto' (no data-fr-theme attribute, lets prefers-color-scheme
// kick in), 'light', or 'dark'. Applied both to the iframe (for example /
// gallery modes) and to the palette-view container (so the palette section
// itself flips its swatches' visible context).
let previewTheme: PreviewTheme = 'auto';
function setPreviewTheme(theme: PreviewTheme): void {
  previewTheme = theme;
  for (const btn of document.querySelectorAll<HTMLButtonElement>('.preview__bar [data-theme]')) {
    const active = btn.dataset['theme'] === theme;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  }
  applyPreviewTheme();
}
function applyPreviewTheme(): void {
  const iframe = document.getElementById('preview-frame') as HTMLIFrameElement | null;
  const doc = iframe?.contentDocument;
  // For "auto" we don't simply removeAttribute: DSFR JS may have persisted
  // the user's last explicit choice somewhere (theme module reading from
  // localStorage / a previously-set attribute), so removing data-fr-theme
  // doesn't bring back prefers-color-scheme. Resolve "auto" to the OS
  // preference at click time and set the attribute explicitly. This makes
  // "auto" stable: subsequent clicks always pick the right value.
  const resolvedTheme: 'light' | 'dark' = previewTheme === 'auto'
    ? (iframe?.contentWindow?.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light')
    : previewTheme;

  if (doc) doc.documentElement.setAttribute('data-fr-theme', resolvedTheme);

  const view = document.getElementById('palette-view');
  if (view) view.setAttribute('data-fr-theme', resolvedTheme);
  // Re-push state so the iframe sees the new theme value (its segmented
  // selector mirrors the builder-ui's theme button).
  pushPreviewState();
}

// =============================================================================
// Palette LCh visual view — grid of swatches per family with WCAG ratios.
// Recomputes from state on every change. Pure DOM (no iframe).
// =============================================================================

// Compact 2-badge readout: contrast vs white + vs near-black, used inline
// next to a color picker. AA = 4.5:1 (text), AAA = 7:1, fail = below 4.5.
function wcagMiniBadges(hex: string): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return '';
  const cls = (r: number): string => r >= 7 ? 'aaa' : r >= 4.5 ? 'aa' : 'fail';
  const w = contrastRatio(hex, '#ffffff');
  const k = contrastRatio(hex, '#1e1e1e');
  return `<span class="${cls(w)}" title="Contraste sur blanc">${w.toFixed(1)}↕</span>` +
         `<span class="${cls(k)}" title="Contraste sur fond sombre">${k.toFixed(1)}↕</span>`;
}

function wcagBadge(hex: string, against: string, label: string): string {
  const r = contrastRatio(hex, against);
  let cls = 'fail';
  if (r >= 7) cls = 'aaa';
  else if (r >= 4.5) cls = 'aa';
  return `<span class="${cls}">${label} ${r.toFixed(2)}</span>`;
}

function renderPaletteView(): void {
  const view = document.getElementById('palette-view');
  if (!view || view.hidden) return;
  const blocks: string[] = [];
  for (const [family, cfg] of Object.entries(state.colors ?? {}) as Array<[string, ColorFamily]>) {
    if (cfg.generation !== 'lch-remap' || !cfg.anchor?.hex) continue;
    let palette: PaletteEntry[];
    try {
      palette = computeFamilyPalette({
        anchor: cfg.anchor.hex,
        recalibrate: cfg['recalibrate-grade'] ?? {},
        addGrades: cfg['add-grades'] ?? {},
        semanticRemap: deriveSemanticRemap(family, cfg)
      });
    } catch { continue; }

    // Show only the canonical 11 grades in expected visual order — skip the
    // alias entries pushed by recalibrate (e.g. main-525 alias of main-444).
    const order = ['75', '100', '125', '200', 'sun-157', 'main-', '625', '850', '925', '950', '975'];
    const byName: Record<string, PaletteEntry> = Object.fromEntries(palette.map(e => [e.name, e]));
    const canonical: PaletteEntry[] = [];
    for (const key of order) {
      if (key === 'main-') {
        const m = palette.find(e => e.name.startsWith('main-'));
        if (m) canonical.push(m);
      } else if (byName[key]) {
        canonical.push(byName[key]!);
      }
    }

    const cells = canonical.map(({ name, values }) => {
      const def = values[0]!;
      const luminance = (parseInt(def.slice(1, 3), 16) + parseInt(def.slice(3, 5), 16) + parseInt(def.slice(5, 7), 16)) / 3;
      const fg = luminance > 128 ? '#161616' : '#ffffff';
      return `<div class="pal-swatch" style="background:${esc(def)};color:${fg}">
        <div class="pal-swatch__grade">${esc(name)}</div>
        <div class="pal-swatch__hex">${esc(def)}</div>
      </div>`;
    }).join('');

    // WCAG check on the 3 critical grades for accessibility (sun, main, 625)
    const sun = palette.find(e => e.name.startsWith('sun-'));
    const main = palette.find(e => e.name.startsWith('main-'));
    const g625 = byName['625'];
    const wcagLines: string[] = [];
    if (sun)  wcagLines.push(`<div class="pal-wcag"><strong>${esc(sun.name)}</strong> ${esc(sun.values[0])} ${wcagBadge(sun.values[0]!, '#ffffff', 'sur blanc')}${wcagBadge(sun.values[0]!, '#1e1e1e', 'sur sombre')}</div>`);
    if (main) wcagLines.push(`<div class="pal-wcag"><strong>${esc(main.name)}</strong> ${esc(main.values[0])} ${wcagBadge(main.values[0]!, '#ffffff', 'sur blanc')}${wcagBadge(main.values[0]!, '#1e1e1e', 'sur sombre')}</div>`);
    if (g625) wcagLines.push(`<div class="pal-wcag"><strong>625</strong> ${esc(g625.values[0])} ${wcagBadge(g625.values[0]!, '#ffffff', 'sur blanc')}${wcagBadge(g625.values[0]!, '#1e1e1e', 'sur sombre')}</div>`);

    const renamed = cfg.rename || family;
    blocks.push(`<h3>${esc(family)}${renamed !== family ? ` → <code>${esc(renamed)}</code>` : ''} <span class="lch-meta">anchor ${esc(cfg.anchor.hex)}</span></h3>
      <div class="pal-grid">${cells}</div>
      ${wcagLines.join('')}`);
  }
  view.innerHTML = blocks.join('') || '<p style="color:#666">Aucune famille avec generation: lch-remap</p>';
}

// =============================================================================
// YAML pane → state (debounced, error display)
// =============================================================================

let yamlTimer: ReturnType<typeof setTimeout> | null = null;
function attachYamlHandler(): void {
  const ed = document.getElementById('yaml-editor') as HTMLTextAreaElement;
  const hl = document.getElementById('yaml-hl');
  const wrap = document.querySelector('.yaml__editor-wrap');

  // Re-highlight on every keystroke (sync with caret), debounce only the
  // expensive parse + state replacement.
  ed.addEventListener('input', () => {
    if (hl) {
      const html = hljs.highlight(ed.value, { language: 'yaml', ignoreIllegals: true }).value;
      hl.innerHTML = html + '\n';
    }
    if (yamlTimer != null) clearTimeout(yamlTimer);
    yamlTimer = setTimeout(() => {
      try {
        const parsed: unknown = parse(ed.value);
        if (typeof parsed !== 'object' || parsed == null) throw new Error('Le YAML doit être un objet');
        state = parsed as Mapping;
        wrap?.classList.remove('invalid');
        setYamlStatus('ok', 'parsé');
        renderAll();
        applyPreview();
      } catch (e) {
        wrap?.classList.add('invalid');
        const message = e instanceof Error ? e.message : String(e);
        setYamlStatus('error', 'erreur : ' + message.split('\n')[0]);
      }
    }, 600);
  });

  // Scroll sync: keep the highlighted overlay aligned with the textarea.
  ed.addEventListener('scroll', () => {
    if (hl) { hl.scrollTop = ed.scrollTop; hl.scrollLeft = ed.scrollLeft; }
  });
}

// =============================================================================
// Header actions
// =============================================================================

function attachTopbar(): void {
  document.getElementById('btn-export')!.addEventListener('click', () => {
    const blob = new Blob([stringify(state, { lineWidth: 0 })], { type: 'text/yaml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mapping.yml';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  const resetBtn = document.getElementById('btn-reset') as HTMLButtonElement;
  resetBtn.addEventListener('click', () => {
    if (resetBtn.dataset['confirm'] !== 'yes') {
      resetBtn.dataset['confirm'] = 'yes';
      const original = resetBtn.textContent;
      resetBtn.textContent = 'Confirmer ?';
      setTimeout(() => { resetBtn.dataset['confirm'] = ''; resetBtn.textContent = original; }, 2000);
      return;
    }
    state = structuredClone(DEFAULT_STATE);
    renderAll(); applyAll();
    resetBtn.dataset['confirm'] = '';
  });
  document.getElementById('btn-load')!.addEventListener('click', () => {
    (document.getElementById('file-input') as HTMLInputElement).click();
  });
  document.getElementById('file-input')!.addEventListener('change', async (e) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      state = parse(text) as Mapping;
      renderAll(); applyAll();
      setYamlStatus('ok', 'chargé ' + file.name);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setYamlStatus('error', 'chargement : ' + message);
    }
  });
}

// =============================================================================
// Boot
// =============================================================================

const bootIframe = document.getElementById('preview-frame') as HTMLIFrameElement;
bootIframe.addEventListener('load', () => {
  applyPreview();
  applyPreviewTheme();
});
window.addEventListener('message', (e: MessageEvent) => {
  const data = e.data as Partial<PreviewMessage> | undefined;
  if (data?.type === 'ademe-ready') pushPreviewState();
  if (data?.type === 'ademe-theme' && data.value) setPreviewTheme(data.value);
});

// Help popup: event delegation on the document so we don't have to re-bind
// after every renderAll(). The popup is a singleton positioned with
// getBoundingClientRect — escapes any overflow-clipping ancestor.
const helpPopup = document.getElementById('help-popup');
// Tiny markdown subset: backticks → <code>. Everything outside backticks is
// HTML-escaped. Safe to inject into innerHTML afterwards.
function helpToHtml(text: string): string {
  const parts = String(text).split(/(`[^`]+`)/);
  return parts.map(p => {
    if (p.startsWith('`') && p.endsWith('`') && p.length > 1) {
      return `<code>${esc(p.slice(1, -1))}</code>`;
    }
    return esc(p);
  }).join('');
}

function showHelp(btn: HTMLElement): void {
  const text = btn.dataset['help'];
  if (!text || !helpPopup) return;
  helpPopup.innerHTML = helpToHtml(text);
  helpPopup.hidden = false;
  // Place below the button by default; flip up if it would clip the viewport.
  const r = btn.getBoundingClientRect();
  helpPopup.style.left = `${Math.max(8, r.left)}px`;
  helpPopup.style.top  = `${r.bottom + 6}px`;
  // After it's visible we know its size — flip if needed.
  const pr = helpPopup.getBoundingClientRect();
  if (pr.right > window.innerWidth - 8) {
    helpPopup.style.left = `${Math.max(8, window.innerWidth - pr.width - 8)}px`;
  }
  if (pr.bottom > window.innerHeight - 8) {
    helpPopup.style.top = `${r.top - pr.height - 6}px`;
  }
}
function hideHelp(): void { if (helpPopup) helpPopup.hidden = true; }
document.addEventListener('mouseover', (e: MouseEvent) => {
  const target = e.target as Element | null;
  const btn = target?.closest?.('.help') as HTMLElement | null;
  if (btn) showHelp(btn);
});
document.addEventListener('mouseout', (e: MouseEvent) => {
  const target = e.target as Element | null;
  const btn = target?.closest?.('.help') as HTMLElement | null;
  const related = e.relatedTarget as Node | null;
  if (btn && (!related || !btn.contains(related))) hideHelp();
});
document.addEventListener('focusin',  (e: FocusEvent) => { const t = e.target as Element | null; const b = t?.closest?.('.help') as HTMLElement | null; if (b) showHelp(b); });
document.addEventListener('focusout', (e: FocusEvent) => { const t = e.target as Element | null; if (t?.closest?.('.help')) hideHelp(); });

renderAll();
attachYamlHandler();
attachTopbar();
attachPreviewToggle();
setYamlText(stringify(state, { lineWidth: 0 }));
setYamlStatus('ok', 'défaut chargé');

// Fonts autocomplete: fill #list-font-files once. Endpoint is plain JSON
// (array of stems without extension). 404 / network failure → empty list,
// no big deal.
// Helper: stuff a list of strings into a <datalist> via createDocumentFragment
// (cheap since browsers index datalists once).
function fillDatalist(id: string, values: string[]): void {
  const dl = document.getElementById(id) as HTMLDataListElement | null;
  if (!dl) return;
  const frag = document.createDocumentFragment();
  for (const v of values) {
    const opt = document.createElement('option');
    opt.value = v;
    frag.appendChild(opt);
  }
  dl.replaceChildren(frag);
}
fetch('../__api/icons/dsfr.json').then(r => r.ok ? r.json() : []).then((arr: Array<{ name: string }>) => {
  fillDatalist('list-dsfr-icons', arr.map(e => e.name));
}).catch(() => {});
fetch('../__api/icons/lucide.json').then(r => r.ok ? r.json() : []).then((names: string[]) => {
  fillDatalist('list-lucide-icons', names);
}).catch(() => {});

fetch('../__api/fonts.json').then(r => r.ok ? r.json() : []).then((stems: string[]) => {
  const dl = document.getElementById('list-font-files') as HTMLDataListElement | null;
  if (!dl) return;
  const frag = document.createDocumentFragment();
  for (const stem of stems) {
    const opt = document.createElement('option');
    opt.value = stem;
    frag.appendChild(opt);
  }
  dl.replaceChildren(frag);
}).catch(() => {});
