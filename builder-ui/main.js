import { parse, stringify } from 'yaml';
import { computeFamilyPalette } from 'ademe-palette';
import { contrastRatio } from 'ademe-lch';
import hljs from 'hljs/core';
import yamlLang from 'hljs/yaml';
hljs.registerLanguage('yaml', yamlLang);

// =============================================================================
// State : single source of truth, mirrors mapping.yml schema
// =============================================================================

const DEFAULT_STATE = {
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
  'post-process': { rename: { enabled: true, 'safety-check': true } },
  'post-css': { enabled: true, banner: true }
};

let state = structuredClone(DEFAULT_STATE);

// =============================================================================
// HTML escape — every value coming from state (which can include parsed YAML
// from a user-loaded file) is funneled through esc() before being interpolated
// into a template literal.
// =============================================================================

const esc = (v) => String(v ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

// =============================================================================
// Section renderers
// =============================================================================

function $section(title, body, opts = {}) {
  const badge = opts.cliOnly ? ' <span class="badge" title="Modification non visible dans la preview, appliquée au build CLI uniquement">build CLI</span>' : '';
  const help = opts.help ? ` <button type="button" class="help" data-help="${esc(opts.help)}" aria-label="Aide : ${esc(title)}" tabindex="0">?</button>` : '';
  return `<section class="section"><h2>${esc(title)}${badge}${help}</h2>${body}</section>`;
}
// fieldId() returns a stable id derived from a path so labels can `for=id`
// the inputs and assistive tech / form autofill work correctly.
const slug = (s) => String(s).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
function fieldId(path) { return 'f-' + slug(path); }

// $field(label, input, id, hint, help) :
//   hint = light inline grey text after the label
//   help = rich multi-line tooltip behind a `?` chip, can include newlines
function $field(label, input, id, hint, help) {
  const hintHtml = hint ? ` <small style="color:#888;font-size:10px">${esc(hint)}</small>` : '';
  const helpHtml = help ? ` <button type="button" class="help" data-help="${esc(help)}" aria-label="Aide : ${esc(label)}" tabindex="0">?</button>` : '';
  const labelOpen = id ? `<label for="${esc(id)}">` : `<label>`;
  return `<div class="field">${labelOpen}${esc(label)}${hintHtml}${helpHtml}</label>${input}</div>`;
}
function $input(opts) {
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

function renderMeta() {
  const idV = fieldId('version'), idD = fieldId('dsfr');
  return $section('Méta', `
    ${$field('version (du mapping)', $input({ id: idV, path: 'version', value: state.version, type: 'number', step: 1, min: 1 }), idV, null,
      'Version du schéma de `mapping.yml`. Permet au builder de refuser un fichier trop ancien si le schéma évolue.')}
    ${$field('dsfr (version du submodule)', $input({ id: idD, path: 'dsfr', value: state.dsfr, placeholder: '1.14.4' }), idD, 'doit matcher `dsfr/` HEAD',
      'Version DSFR cible. Doit matcher exactement le tag du submodule git checkouté dans `dsfr/`.\nUtilisé pour le banner et pour le check de drift upstream.')}
  `);
}

function renderTypo() {
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

function renderColors() {
  const families = Object.entries(state.colors ?? {});
  const blocks = families.map(([family, cfg]) => {
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
    return `<div data-family="${esc(family)}" class="family">
      <h3>Famille <button type="button" class="help" data-help="Une famille = un anchor + un mapping de grades (75, 100, …, 975, sun, main).&#10;Le builder calcule chacun des 11 grades par remapping LCh autour de l&#39;anchor : la teinte (h°) et la chroma (C*) viennent de l&#39;anchor, la luminance (L*) suit le profil DSFR." aria-label="Aide famille" tabindex="0">?</button></h3>
      ${$field('Nom DSFR (clé)', `<input type="text" id="${esc(idKey)}" name="${esc(idKey)}" value="${esc(family)}" data-key="family-key">`, idKey, 'identifiant dans le mapping (ex: blue-france)',
        'Nom de la famille DSFR à overrider. Doit matcher une clé existante dans `dsfr/src/module/color/variable/_options.scss` (`blue-france`, `red-marianne`, etc.). Le builder regénère cette section dans le workspace avec les valeurs LCh recalculées.')}
      ${$field('Rename (libre)', `<input type="text" id="${esc(idRen)}" name="${esc(idRen)}" value="${esc(cfg.rename)}" data-key="rename" placeholder="blue-ate">`, idRen, 'nouveau nom dans le CSS final',
        'Texte avec lequel le post-process sed remplace `blue-france` (ou la clé d’origine) dans `dist/*.css|js`.\nValeur libre — toute chaîne sans espaces marche. Sert à neutraliser les références État du CSS final.\nExemples : `blue-ate`, `vert-ademe`, `theme-2026`.')}
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
      <hr style="border: 0; border-top: 1px solid #eee; margin: 0.75rem 0">
    </div>`;
  }).join('');
  return $section('Couleurs', blocks, { help:
'Pour chaque famille DSFR (`blue-france`, `red-marianne`…), définit un anchor de couleur. Le builder calcule automatiquement les 11 grades (`75` → `975`, `sun`, `main`) via remapping LCh autour de cet anchor.\n\n• `Nom DSFR (clé)` : identifiant dans `dsfr/_options.scss`.\n• `Rename` : nom libre utilisé par le post-process sed pour neutraliser le préfixe État dans le CSS final.\n• `Anchor` : couleur de référence. Sert à dériver tous les autres grades.\n• `Recalibrate` : émet un alias entre 2 noms de grade (l\'ancien ET le nouveau pointent sur la même valeur).' });
}

// border-radius values in the mapping are stored as full CSS strings
// ("0.75rem"). The UI shows just the rem number; conversion happens in the
// input handler (we always wrap the user-typed number with "rem" before
// storing).
const remOf = (v) => {
  if (v == null) return '';
  const m = String(v).trim().match(/^(-?\d+(?:\.\d+)?)\s*rem$/i);
  return m ? m[1] : '';
};

function renderRadius() {
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

function renderShadows() {
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

function renderComponents() {
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

function renderPostProcess() {
  const pp = state['post-process']?.rename ?? {};
  const pc = state['post-css'] ?? {};
  const t = (id, path, checked, label) => {
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

function renderAll() {
  const html = [renderMeta(), renderTypo(), renderColors(), renderRadius(), renderShadows(), renderComponents(), renderPostProcess()].join('');
  // All interpolated values went through esc() — safe to use innerHTML here.
  document.querySelector('.settings').innerHTML = html;
  attachHandlers();
}

// =============================================================================
// Path-based state mutation
// =============================================================================

function setPath(obj, path, value) {
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] == null || typeof cur[keys[i]] !== 'object') cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}

function deletePath(obj, path) {
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] == null || typeof cur[keys[i]] !== 'object') return;
    cur = cur[keys[i]];
  }
  delete cur[keys[keys.length - 1]];
}

function attachHandlers() {
  for (const el of document.querySelectorAll('[data-path]')) {
    const path = el.dataset.path;
    el.addEventListener('input', () => {
      let v = el.type === 'checkbox' ? el.checked : el.value;
      // data-rem: wrap a numeric input value into "<n>rem" before storing.
      if (el.dataset.rem != null && typeof v === 'string' && v !== '') v = `${v}rem`;
      // data-strip-empty: empty string → unset the key, so YAML and the CLI
      // consumer fall back on their default (the `??` chain in builder/index.js
      // only treats null/undefined as "absent", not "").
      if (el.dataset.stripEmpty != null && v === '') {
        deletePath(state, path);
      } else {
        setPath(state, path, v);
      }
      onStateChanged();
    });
  }

  for (const fam of document.querySelectorAll('.family')) {
    const family = fam.dataset.family;
    const colorInput = fam.querySelector('[data-key="anchor-color"]');
    const hexInput = fam.querySelector('[data-key="anchor-hex"]');
    const renameInput = fam.querySelector('[data-key="rename"]');
    colorInput.addEventListener('input', () => {
      hexInput.value = colorInput.value.toUpperCase();
      state.colors[family].anchor = { hex: colorInput.value.toUpperCase() };
      onStateChanged();
    });
    hexInput.addEventListener('input', () => {
      const v = hexInput.value.trim();
      if (/^#?[0-9a-f]{6}$/i.test(v)) {
        const hex = v.startsWith('#') ? v : '#' + v;
        colorInput.value = hex.toLowerCase();
        state.colors[family].anchor = { hex: hex.toUpperCase() };
        onStateChanged();
      }
    });
    renameInput.addEventListener('input', () => {
      state.colors[family].rename = renameInput.value;
      onStateChanged();
    });
    fam.querySelectorAll('[data-recal-from]').forEach(row => {
      const from = row.dataset.recalFrom;
      row.querySelector('[data-key="to"]').addEventListener('input', e => {
        state.colors[family]['recalibrate-grade'] ??= {};
        state.colors[family]['recalibrate-grade'][from] = e.target.value;
        onStateChanged();
      });
      row.querySelector('[data-action="rm-recal"]').addEventListener('click', () => {
        delete state.colors[family]['recalibrate-grade'][from];
        renderAll(); applyAll();
      });
    });
    fam.querySelector('[data-action="add-recal"]').addEventListener('click', () => {
      state.colors[family]['recalibrate-grade'] ??= {};
      state.colors[family]['recalibrate-grade'][`grade-${Date.now()}`] = '';
      renderAll(); applyAll();
    });
  }

  document.querySelectorAll('[data-target-idx]').forEach(row => {
    const idx = Number(row.dataset.targetIdx);
    row.querySelector('[data-key="selector"]').addEventListener('input', e => {
      state['border-radius'].targets[idx].selector = e.target.value; onStateChanged();
    });
    row.querySelector('[data-key="value"]').addEventListener('input', e => {
      const v = e.target.value;
      state['border-radius'].targets[idx].value = v === '' ? '' : `${v}rem`;
      onStateChanged();
    });
    row.querySelector('[data-key="overflow"]').addEventListener('change', e => {
      if (e.target.checked) state['border-radius'].targets[idx].overflow = true;
      else delete state['border-radius'].targets[idx].overflow;
      onStateChanged();
    });
    row.querySelector('[data-action="rm-target"]').addEventListener('click', () => {
      state['border-radius'].targets.splice(idx, 1); renderAll(); applyAll();
    });
  });
  const addTargetBtn = document.querySelector('[data-action="add-target"]');
  if (addTargetBtn) addTargetBtn.addEventListener('click', () => {
    state['border-radius'].targets.push({ selector: '.fr-', value: '0.75rem' });
    renderAll(); applyAll();
  });

  document.querySelectorAll('[data-component]').forEach(cb => {
    cb.addEventListener('change', () => {
      const name = cb.dataset.component;
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

function onStateChanged() {
  setYamlText(stringify(state, { lineWidth: 0 }));
  setYamlStatus('ok', 'à jour');
  applyPreview();
  if (previewMode === 'palette') renderPaletteView();
}

function setYamlStatus(kind, msg) {
  const el = document.getElementById('yaml-status');
  // textContent — no HTML interpretation, safe for arbitrary error strings.
  el.textContent = msg;
  el.className = 'yaml__status ' + kind;
}

// Setting the textarea value also re-renders the syntax-highlight overlay
// behind it. highlight.js produces escaped HTML, so injection-safe.
function setYamlText(text) {
  const ed = document.getElementById('yaml-editor');
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

function applyPreview() {
  const iframe = document.getElementById('preview-frame');
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

// Send the live state snapshot to the example iframe. The iframe regenerates
// its palette section titles / swatches and the font diagnostic from this
// payload, so renaming a family or changing the css-name in the typo section
// reflects in the témoin without a full reload.
function pushPreviewState() {
  if (previewMode !== 'example') return;
  const iframe = document.getElementById('preview-frame');
  const win = iframe?.contentWindow;
  if (!win) return;
  const palettes = [];
  for (const [family, cfg] of Object.entries(state.colors ?? {})) {
    if (cfg.generation !== 'lch-remap' || !cfg.anchor?.hex) continue;
    let pal;
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
      grades: pal.map(({ name, values }) => ({ name, hex: values[0] }))
    });
  }
  win.postMessage({
    type: 'ademe-state',
    theme: previewTheme,
    fontCssName: state.typography?.primary?.['css-name'] ?? 'Marianne',
    palettes
  }, '*');
}

// DSFR _sets.scss combos that emit --<family>-<lightGrade>-<darkGrade> CSS
// vars. Hardcoded for the 2 ADEME-tracked families; if the user adds another
// family the live preview won't reflect the combined vars (full build CLI
// will). Variant emitted: light-mode value only (most components use that).
const DSFR_SHADE_COMBOS = [
  { name: 'sun-113-625', light: 'sun-113', dark: '625' },
  { name: '850-200',     light: '850',     dark: '200' },
  { name: '925-125',     light: '925',     dark: '125' },
  { name: '950-100',     light: '950',     dark: '100' },
  { name: '975-75',      light: '975',     dark: '75'  },
  { name: 'main-525',    light: 'main-525', dark: 'main-525' },
  { name: '975-sun-113', light: '975',     dark: 'sun-113' }
];

function buildPreviewCss() {
  // The combined shade vars (e.g. --blue-ate-sun-113-625) carry DIFFERENT
  // values in light vs dark mode — the name encodes both grades:
  // "sun-113-625" = sun-113 grade in light, 625 grade in dark.
  // DSFR emits two blocks, light and dark; we mirror that exactly so the
  // primary button is dark in light theme and light in dark theme as
  // expected. We emit each block under all 3 selectors (:root, +light,
  // +dark) plus an @media (prefers-color-scheme) wrap around the dark
  // block, to beat both data-fr-theme switching and OS-default dark.
  const familiesPalette = [];
  for (const [family, cfg] of Object.entries(state.colors ?? {})) {
    if (cfg.generation !== 'lch-remap' || !cfg.anchor?.hex) continue;
    let palette;
    try {
      palette = computeFamilyPalette({
        anchor: cfg.anchor.hex,
        recalibrate: cfg['recalibrate-grade'] ?? {},
        addGrades: cfg['add-grades'] ?? {},
        semanticRemap: deriveSemanticRemap(family, cfg)
      });
    } catch { continue; }
    familiesPalette.push({ family, renamed: cfg.rename || family, palette, byName: Object.fromEntries(palette.map(e => [e.name, e.values])) });
  }

  // !important on every var so we beat DSFR's own @media (prefers-color-scheme:
  // dark) block — when the OS is dark and data-fr-theme is "light", their
  // media-query-scoped :root rule can still tie or out-specify ours via
  // cascade ordering. !important is the simplest reliable lever here.
  const IMP = ' !important';
  const emitBlock = (mode /* 'light' | 'dark' */) => {
    const out = [];
    for (const { family, renamed, palette, byName } of familiesPalette) {
      if (mode === 'light') {
        for (const { name, values } of palette) {
          out.push(`  --${family}-${name}: ${values[0]}${IMP};`);
          if (renamed !== family) out.push(`  --${renamed}-${name}: ${values[0]}${IMP};`);
        }
      }
      for (const combo of DSFR_SHADE_COMBOS) {
        const grade = byName[mode === 'dark' ? combo.dark : combo.light];
        if (!grade) continue;
        const [def, hover = def, active = def] = grade;
        for (const fam of (renamed !== family ? [family, renamed] : [family])) {
          out.push(`  --${fam}-${combo.name}: ${def}${IMP};`);
          out.push(`  --${fam}-${combo.name}-hover: ${hover}${IMP};`);
          out.push(`  --${fam}-${combo.name}-active: ${active}${IMP};`);
        }
      }
    }
    return out;
  };

  const lightVars = emitBlock('light');
  const darkVars  = emitBlock('dark');

  const lines = [];
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

function deriveSemanticRemap(family, cfg) {
  const out = {};
  const prefix = family + '-';
  for (const [oldFull, newFull] of Object.entries(cfg['semantic-remap'] ?? {})) {
    if (oldFull.startsWith(prefix) && newFull.startsWith(prefix)) {
      out[oldFull.slice(prefix.length)] = newFull.slice(prefix.length);
    }
  }
  return out;
}

function applyAll() {
  setYamlText(stringify(state, { lineWidth: 0 }));
  applyPreview();
}

// =============================================================================
// Preview mode toggle: example | gallery | palette
// =============================================================================

const PREVIEW_SOURCES = {
  example: '/example/index.html',
  gallery: '/builder-ui/gallery.html'
};
let previewMode = 'example';

function setPreviewMode(mode) {
  previewMode = mode;
  const iframe = document.getElementById('preview-frame');
  const palette = document.getElementById('palette-view');
  // Scope the toggle to the [data-mode] segmented control only — early
  // versions used `.preview__bar button` which also matched the theme
  // segmented and stripped its .active state on every view switch.
  for (const btn of document.querySelectorAll('.preview__bar [data-mode]')) {
    const active = btn.dataset.mode === mode;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  }
  if (mode === 'palette') {
    iframe.hidden = true;
    palette.hidden = false;
    renderPaletteView();
    applyPreviewTheme(); // ensures the palette container reflects the current theme
  } else {
    iframe.hidden = false;
    palette.hidden = true;
    const target = PREVIEW_SOURCES[mode];
    if (target && iframe.getAttribute('src') !== target) {
      iframe.setAttribute('src', target);
    } else {
      applyPreview();
      applyPreviewTheme();
    }
  }
}

function attachPreviewToggle() {
  for (const btn of document.querySelectorAll('.preview__bar [data-mode]')) {
    btn.addEventListener('click', () => setPreviewMode(btn.dataset.mode));
  }
  for (const btn of document.querySelectorAll('.preview__bar [data-theme]')) {
    btn.addEventListener('click', () => setPreviewTheme(btn.dataset.theme));
  }
}

// Preview theme: 'auto' (no data-fr-theme attribute, lets prefers-color-scheme
// kick in), 'light', or 'dark'. Applied both to the iframe (for example /
// gallery modes) and to the palette-view container (so the palette section
// itself flips its swatches' visible context).
let previewTheme = 'auto';
function setPreviewTheme(theme) {
  previewTheme = theme;
  for (const btn of document.querySelectorAll('.preview__bar [data-theme]')) {
    const active = btn.dataset.theme === theme;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  }
  applyPreviewTheme();
}
function applyPreviewTheme() {
  const iframe = document.getElementById('preview-frame');
  const doc = iframe?.contentDocument;
  // For "auto" we don't simply removeAttribute: DSFR JS may have persisted
  // the user's last explicit choice somewhere (theme module reading from
  // localStorage / a previously-set attribute), so removing data-fr-theme
  // doesn't bring back prefers-color-scheme. Resolve "auto" to the OS
  // preference at click time and set the attribute explicitly. This makes
  // "auto" stable: subsequent clicks always pick the right value.
  const resolvedTheme = previewTheme === 'auto'
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
function wcagMiniBadges(hex) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return '';
  const cls = (r) => r >= 7 ? 'aaa' : r >= 4.5 ? 'aa' : 'fail';
  const w = contrastRatio(hex, '#ffffff');
  const k = contrastRatio(hex, '#1e1e1e');
  return `<span class="${cls(w)}" title="Contraste sur blanc">${w.toFixed(1)}↕</span>` +
         `<span class="${cls(k)}" title="Contraste sur fond sombre">${k.toFixed(1)}↕</span>`;
}

function wcagBadge(hex, against, label) {
  const r = contrastRatio(hex, against);
  let cls = 'fail';
  if (r >= 7) cls = 'aaa';
  else if (r >= 4.5) cls = 'aa';
  return `<span class="${cls}">${label} ${r.toFixed(2)}</span>`;
}

function renderPaletteView() {
  const view = document.getElementById('palette-view');
  if (!view || view.hidden) return;
  const blocks = [];
  for (const [family, cfg] of Object.entries(state.colors ?? {})) {
    if (cfg.generation !== 'lch-remap' || !cfg.anchor?.hex) continue;
    let palette;
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
    const byName = Object.fromEntries(palette.map(e => [e.name, e]));
    const canonical = [];
    for (const key of order) {
      if (key === 'main-') {
        const m = palette.find(e => e.name.startsWith('main-'));
        if (m) canonical.push(m);
      } else if (byName[key]) {
        canonical.push(byName[key]);
      }
    }

    const cells = canonical.map(({ name, values }) => {
      const def = values[0];
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
    const wcagLines = [];
    if (sun)  wcagLines.push(`<div class="pal-wcag"><strong>${esc(sun.name)}</strong> ${esc(sun.values[0])} ${wcagBadge(sun.values[0], '#ffffff', 'sur blanc')}${wcagBadge(sun.values[0], '#1e1e1e', 'sur sombre')}</div>`);
    if (main) wcagLines.push(`<div class="pal-wcag"><strong>${esc(main.name)}</strong> ${esc(main.values[0])} ${wcagBadge(main.values[0], '#ffffff', 'sur blanc')}${wcagBadge(main.values[0], '#1e1e1e', 'sur sombre')}</div>`);
    if (g625) wcagLines.push(`<div class="pal-wcag"><strong>625</strong> ${esc(g625.values[0])} ${wcagBadge(g625.values[0], '#ffffff', 'sur blanc')}${wcagBadge(g625.values[0], '#1e1e1e', 'sur sombre')}</div>`);

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

let yamlTimer = null;
function attachYamlHandler() {
  const ed = document.getElementById('yaml-editor');
  const hl = document.getElementById('yaml-hl');
  const wrap = document.querySelector('.yaml__editor-wrap');

  // Re-highlight on every keystroke (sync with caret), debounce only the
  // expensive parse + state replacement.
  ed.addEventListener('input', () => {
    if (hl) {
      const html = hljs.highlight(ed.value, { language: 'yaml', ignoreIllegals: true }).value;
      hl.innerHTML = html + '\n';
    }
    clearTimeout(yamlTimer);
    yamlTimer = setTimeout(() => {
      try {
        const parsed = parse(ed.value);
        if (typeof parsed !== 'object' || parsed == null) throw new Error('Le YAML doit être un objet');
        state = parsed;
        wrap?.classList.remove('invalid');
        setYamlStatus('ok', 'parsé');
        renderAll();
        applyPreview();
      } catch (e) {
        wrap?.classList.add('invalid');
        setYamlStatus('error', 'erreur : ' + e.message.split('\n')[0]);
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

function attachTopbar() {
  document.getElementById('btn-export').addEventListener('click', () => {
    const blob = new Blob([stringify(state, { lineWidth: 0 })], { type: 'text/yaml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mapping.yml';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  const resetBtn = document.getElementById('btn-reset');
  resetBtn.addEventListener('click', () => {
    if (resetBtn.dataset.confirm !== 'yes') {
      resetBtn.dataset.confirm = 'yes';
      const original = resetBtn.textContent;
      resetBtn.textContent = 'Confirmer ?';
      setTimeout(() => { resetBtn.dataset.confirm = ''; resetBtn.textContent = original; }, 2000);
      return;
    }
    state = structuredClone(DEFAULT_STATE);
    renderAll(); applyAll();
    resetBtn.dataset.confirm = '';
  });
  document.getElementById('btn-load').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });
  document.getElementById('file-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      state = parse(text);
      renderAll(); applyAll();
      setYamlStatus('ok', 'chargé ' + file.name);
    } catch (err) {
      setYamlStatus('error', 'chargement : ' + err.message);
    }
  });
}

// =============================================================================
// Boot
// =============================================================================

const iframe = document.getElementById('preview-frame');
iframe.addEventListener('load', () => {
  applyPreview();
  applyPreviewTheme();
});
window.addEventListener('message', (e) => {
  if (e.data?.type === 'ademe-ready') pushPreviewState();
  if (e.data?.type === 'ademe-theme' && e.data.value) setPreviewTheme(e.data.value);
});

// Help popup: event delegation on the document so we don't have to re-bind
// after every renderAll(). The popup is a singleton positioned with
// getBoundingClientRect — escapes any overflow-clipping ancestor.
const helpPopup = document.getElementById('help-popup');
// Tiny markdown subset: backticks → <code>. Everything outside backticks is
// HTML-escaped. Safe to inject into innerHTML afterwards.
function helpToHtml(text) {
  const parts = String(text).split(/(`[^`]+`)/);
  return parts.map(p => {
    if (p.startsWith('`') && p.endsWith('`') && p.length > 1) {
      return `<code>${esc(p.slice(1, -1))}</code>`;
    }
    return esc(p);
  }).join('');
}

function showHelp(btn) {
  const text = btn.dataset.help;
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
function hideHelp() { if (helpPopup) helpPopup.hidden = true; }
document.addEventListener('mouseover', (e) => {
  const btn = e.target.closest?.('.help');
  if (btn) showHelp(btn);
});
document.addEventListener('mouseout', (e) => {
  const btn = e.target.closest?.('.help');
  if (btn && !btn.contains(e.relatedTarget)) hideHelp();
});
document.addEventListener('focusin',  (e) => { const b = e.target.closest?.('.help'); if (b) showHelp(b); });
document.addEventListener('focusout', (e) => { if (e.target.closest?.('.help')) hideHelp(); });

renderAll();
attachYamlHandler();
attachTopbar();
attachPreviewToggle();
setYamlText(stringify(state, { lineWidth: 0 }));
setYamlStatus('ok', 'défaut chargé');

// Fonts autocomplete: fill #list-font-files once. Endpoint is plain JSON
// (array of stems without extension). 404 / network failure → empty list,
// no big deal.
fetch('/__api/fonts').then(r => r.ok ? r.json() : []).then(stems => {
  const dl = document.getElementById('list-font-files');
  if (!dl) return;
  const frag = document.createDocumentFragment();
  for (const stem of stems) {
    const opt = document.createElement('option');
    opt.value = stem;
    frag.appendChild(opt);
  }
  dl.replaceChildren(frag);
}).catch(() => {});
