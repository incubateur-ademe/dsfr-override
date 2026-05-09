import { parse, stringify } from 'yaml';
import { computeFamilyPalette } from 'ademe-palette';
import { contrastRatio } from 'ademe-lch';

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
      { selector: '.fr-input',  value: '0.75rem' },
      { selector: '.fr-select', value: '0.75rem' },
      { selector: '.fr-btn',    value: '0.75rem' },
      { selector: '.fr-badge',  value: '0.75rem' },
      { selector: '.fr-card',   value: '0.75rem', overflow: true },
      { selector: '.fr-alert',  value: '0.75rem', overflow: true }
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
  return `<section class="section"><h2>${esc(title)}${badge}</h2>${body}</section>`;
}
// fieldId() returns a stable id derived from a path so labels can `for=id`
// the inputs and assistive tech / form autofill work correctly.
const slug = (s) => String(s).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
function fieldId(path) { return 'f-' + slug(path); }

function $field(label, input, id, hint) {
  const hintHtml = hint ? `<small style="color:#888;font-size:10px">${esc(hint)}</small>` : '';
  const labelOpen = id ? `<label for="${esc(id)}">` : `<label>`;
  return `<div class="field">${labelOpen}${esc(label)}${hintHtml ? ' ' + hintHtml : ''}</label>${input}</div>`;
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
    ${$field('version (du mapping)', $input({ id: idV, path: 'version', value: state.version, type: 'number', step: 1, min: 1 }), idV)}
    ${$field('dsfr (version du submodule)', $input({ id: idD, path: 'dsfr', value: state.dsfr, placeholder: '1.14.4' }), idD, 'doit matcher dsfr/ HEAD')}
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
        <input type="text" id="${esc(idN)}" name="${esc(idN)}" value="${esc(v?.normal)}" data-key="normal" placeholder="PublicSans-Regular" title="Fichier normal">
        <input type="text" id="${esc(idI)}" name="${esc(idI)}" value="${esc(v?.italic)}" data-key="italic" placeholder="PublicSans-Italic" title="Fichier italic">
        <button class="icon-btn" data-action="rm-weight" title="Supprimer">×</button>
      </div>`;
    }).join('');
  return $section('Typographie', `
    <h3>Primary</h3>
    ${$field('css-name', $input({ id: idCss, path: 'typography.primary.css-name', value: p['css-name'], placeholder: 'Marianne' }), idCss, 'nom CSS de la fonte (gardé pour la compat var(--font-family))')}
    ${$field('files-source', $input({ id: idSrc, path: 'typography.primary.files-source', value: p['files-source'], placeholder: './assets/fonts/' }), idSrc, 'chemin vers les fichiers .woff/.woff2')}
    <div class="note">Poids → fichier normal / fichier italic (sans extension)</div>
    ${weights}
    <h3>Alt</h3>
    ${$field('alt', `<select id="${esc(idAlt)}" name="${esc(idAlt)}" data-path="typography.alt"><option value="keep" ${state.typography?.alt === 'keep' ? 'selected' : ''}>keep (Spectral)</option></select>`, idAlt, 'pour l’instant : keep uniquement')}
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
      <h3>Famille</h3>
      ${$field('Nom DSFR (clé)', `<input type="text" id="${esc(idKey)}" name="${esc(idKey)}" value="${esc(family)}" data-key="family-key">`, idKey, 'identifiant dans le mapping (ex: blue-france)')}
      ${$field('Rename (libre)', `<input type="text" id="${esc(idRen)}" name="${esc(idRen)}" value="${esc(cfg.rename)}" data-key="rename" placeholder="blue-ate">`, idRen, 'utilisé par le post-process sed')}
      <div class="field field--color">
        <label for="${esc(idHex)}">Anchor</label>
        <input type="color" id="${esc(idCol)}" name="${esc(idCol)}" value="${esc(anchorHex.toLowerCase())}" data-key="anchor-color">
        <input type="text" id="${esc(idHex)}" name="${esc(idHex)}" class="hex" value="${esc(anchorHex)}" data-key="anchor-hex" placeholder="#4950FB" pattern="^#?[0-9a-fA-F]{6}$">
      </div>
      <h3>Recalibrate-grade</h3>
      ${recal}
      <button class="add-btn" data-action="add-recal">+ recalibrate</button>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 0.75rem 0">
    </div>`;
  }).join('');
  return $section('Couleurs', blocks);
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
    ${$field('Base', `<input type="number" id="${esc(idBase)}" name="${esc(idBase)}" value="${esc(remOf(state['border-radius']?.base))}" data-path="border-radius.base" data-rem placeholder="0.75" step="0.125" min="0" max="4">`, idBase, 'valeur en rem (sans suffixe)')}
    <h3>Targets <small style="font-weight: 400; color: #888">(values en rem)</small></h3>
    ${targets}
    <button class="add-btn" data-action="add-target">+ target</button>
  `);
}

function renderShadows() {
  const sc = state.elevation?.['shadow-color'] ?? {};
  const idL = fieldId('shadow-light'), idD = fieldId('shadow-dark');
  return $section('Elevation (shadows)', `
    ${$field('Light shadow-color', $input({ id: idL, path: 'elevation.shadow-color.light', value: sc.light, placeholder: 'rgba(0, 0, 0, 0.16)' }), idL, 'CSS color : rgba / hex / hsl')}
    ${$field('Dark shadow-color',  $input({ id: idD, path: 'elevation.shadow-color.dark',  value: sc.dark,  placeholder: 'rgba(0, 0, 0, 0.32)' }), idD, 'mode dark / data-fr-theme=dark')}
  `);
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
  return $section('Composants à exclure', `<div class="checkboxes">${items}</div>`, { cliOnly: true });
}

function renderPostProcess() {
  const pp = state['post-process']?.rename ?? {};
  const pc = state['post-css'] ?? {};
  const t = (id, path, checked, label) => {
    return `<label class="toggle" for="${esc(id)}"><input type="checkbox" id="${esc(id)}" name="${esc(id)}" data-path="${esc(path)}" ${checked ? 'checked' : ''}> <span>${esc(label)}</span></label>`;
  };
  return $section('Post-process', `
    <h3>Rename CSS final (sed)</h3>
    ${t(fieldId('pp-rename-enabled'), 'post-process.rename.enabled', pp.enabled, 'enabled')}
    ${t(fieldId('pp-rename-safety'),  'post-process.rename.safety-check', pp['safety-check'], 'safety-check (refuse les renames ambigus)')}
    <h3>PostCSS</h3>
    ${t(fieldId('pc-enabled'), 'post-css.enabled', pc.enabled !== false, 'enabled (mqpacker + dedup)')}
    ${t(fieldId('pc-banner'),  'post-css.banner',  pc.banner !== false,  'banner ADEME en tête du fichier')}
  `, { cliOnly: true });
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

function attachHandlers() {
  for (const el of document.querySelectorAll('[data-path]')) {
    const path = el.dataset.path;
    el.addEventListener('input', () => {
      let v = el.type === 'checkbox' ? el.checked : el.value;
      // data-rem: wrap a numeric input value into "<n>rem" before storing.
      if (el.dataset.rem != null && typeof v === 'string' && v !== '') v = `${v}rem`;
      setPath(state, path, v);
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
  document.getElementById('yaml-editor').value = stringify(state, { lineWidth: 0 });
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
  document.getElementById('yaml-editor').value = stringify(state, { lineWidth: 0 });
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
}

// =============================================================================
// Palette LCh visual view — grid of swatches per family with WCAG ratios.
// Recomputes from state on every change. Pure DOM (no iframe).
// =============================================================================

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
  ed.addEventListener('input', () => {
    clearTimeout(yamlTimer);
    yamlTimer = setTimeout(() => {
      try {
        const parsed = parse(ed.value);
        if (typeof parsed !== 'object' || parsed == null) throw new Error('Le YAML doit être un objet');
        state = parsed;
        ed.classList.remove('invalid');
        setYamlStatus('ok', 'parsé');
        renderAll();
        applyPreview();
      } catch (e) {
        ed.classList.add('invalid');
        setYamlStatus('error', 'erreur : ' + e.message.split('\n')[0]);
      }
    }, 600);
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

renderAll();
attachYamlHandler();
attachTopbar();
attachPreviewToggle();
document.getElementById('yaml-editor').value = stringify(state, { lineWidth: 0 });
setYamlStatus('ok', 'défaut chargé');
