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
function $field(label, input) {
  return `<div class="field"><label>${esc(label)}</label>${input}</div>`;
}

function renderMeta() {
  return $section('Méta', `
    ${$field('version', `<input type="text" data-path="version" value="${esc(state.version)}">`)}
    ${$field('dsfr', `<input type="text" data-path="dsfr" value="${esc(state.dsfr)}">`)}
  `);
}

function renderTypo() {
  const p = state.typography?.primary ?? {};
  const weights = Object.entries(p.weights ?? {})
    .map(([w, v]) => `<div class="list-row" data-weight="${esc(w)}">
      <input type="text" value="${esc(w)}" data-key="weight" style="max-width: 50px">
      <input type="text" value="${esc(v?.normal)}" data-key="normal" placeholder="PublicSans-Regular">
      <input type="text" value="${esc(v?.italic)}" data-key="italic" placeholder="PublicSans-Italic">
      <button class="icon-btn" data-action="rm-weight" title="Supprimer">×</button>
    </div>`).join('');
  return $section('Typographie', `
    <h3>Primary</h3>
    ${$field('css-name', `<input type="text" data-path="typography.primary.css-name" value="${esc(p['css-name'])}">`)}
    ${$field('files-source', `<input type="text" data-path="typography.primary.files-source" value="${esc(p['files-source'])}">`)}
    <div class="note">Format weight = poids → fichier normal / fichier italic</div>
    ${weights}
    <h3>Alt</h3>
    ${$field('alt', `<select data-path="typography.alt"><option value="keep" ${state.typography?.alt === 'keep' ? 'selected' : ''}>keep (Spectral)</option></select>`)}
  `);
}

function renderColors() {
  const families = Object.entries(state.colors ?? {});
  const blocks = families.map(([family, cfg]) => {
    const anchorHex = cfg.anchor?.hex ?? '#000000';
    const recal = Object.entries(cfg['recalibrate-grade'] ?? {})
      .map(([from, to]) => `<div class="list-row" data-recal-from="${esc(from)}">
        <input type="text" value="${esc(from)}" data-key="from" placeholder="main-525">
        <span>→</span>
        <input type="text" value="${esc(to)}" data-key="to" placeholder="main-444">
        <button class="icon-btn" data-action="rm-recal" title="Supprimer">×</button>
      </div>`).join('');
    return `<div data-family="${esc(family)}" class="family">
      <h3>Famille</h3>
      ${$field('Nom DSFR (clé)', `<input type="text" value="${esc(family)}" data-key="family-key">`)}
      ${$field('Rename (libre)', `<input type="text" value="${esc(cfg.rename)}" data-key="rename" placeholder="blue-ate">`)}
      <div class="field field--color">
        <label>Anchor</label>
        <input type="color" value="${esc(anchorHex.toLowerCase())}" data-key="anchor-color">
        <input type="text" class="hex" value="${esc(anchorHex)}" data-key="anchor-hex" placeholder="#4950FB">
      </div>
      <h3>Recalibrate-grade</h3>
      ${recal}
      <button class="add-btn" data-action="add-recal">+ recalibrate</button>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 0.75rem 0">
    </div>`;
  }).join('');
  return $section('Couleurs', blocks);
}

function renderRadius() {
  const targets = (state['border-radius']?.targets ?? []).map((t, i) => `
    <div class="list-row" data-target-idx="${i}">
      <input type="text" value="${esc(t.selector)}" data-key="selector" placeholder=".fr-card">
      <input type="text" value="${esc(t.value)}" data-key="value" placeholder="0.75rem" style="max-width: 90px">
      <label class="toggle" style="margin: 0; flex: 0 0 auto">
        <input type="checkbox" data-key="overflow" ${t.overflow ? 'checked' : ''}>
        <span>overflow</span>
      </label>
      <button class="icon-btn" data-action="rm-target" title="Supprimer">×</button>
    </div>`).join('');
  return $section('Border-radius', `
    ${$field('Base', `<input type="text" data-path="border-radius.base" value="${esc(state['border-radius']?.base)}" placeholder="0.75rem">`)}
    <h3>Targets</h3>
    ${targets}
    <button class="add-btn" data-action="add-target">+ target</button>
  `);
}

function renderShadows() {
  const sc = state.elevation?.['shadow-color'] ?? {};
  return $section('Elevation (shadows)', `
    ${$field('Light shadow-color', `<input type="text" data-path="elevation.shadow-color.light" value="${esc(sc.light)}" placeholder="rgba(0, 0, 0, 0.16)">`)}
    ${$field('Dark shadow-color',  `<input type="text" data-path="elevation.shadow-color.dark"  value="${esc(sc.dark)}"  placeholder="rgba(0, 0, 0, 0.32)">`)}
  `);
}

function renderComponents() {
  const removed = new Set(state.components?.remove ?? []);
  const known = ['header', 'footer', 'consent', 'breadcrumb', 'navigation', 'translate'];
  const all = Array.from(new Set([...known, ...removed]));
  const items = all.map(c => `<label class="toggle">
    <input type="checkbox" data-component="${esc(c)}" ${removed.has(c) ? 'checked' : ''}>
    <span>${esc(c)}</span>
  </label>`).join('');
  return $section('Composants à exclure', `<div class="checkboxes">${items}</div>`, { cliOnly: true });
}

function renderPostProcess() {
  const pp = state['post-process']?.rename ?? {};
  const pc = state['post-css'] ?? {};
  return $section('Post-process', `
    <h3>Rename</h3>
    <label class="toggle"><input type="checkbox" data-path="post-process.rename.enabled" ${pp.enabled ? 'checked' : ''}> <span>enabled</span></label>
    <label class="toggle"><input type="checkbox" data-path="post-process.rename.safety-check" ${pp['safety-check'] ? 'checked' : ''}> <span>safety-check</span></label>
    <h3>PostCSS</h3>
    <label class="toggle"><input type="checkbox" data-path="post-css.enabled" ${pc.enabled !== false ? 'checked' : ''}> <span>enabled (mqpacker + dedup + banner)</span></label>
    <label class="toggle"><input type="checkbox" data-path="post-css.banner" ${pc.banner !== false ? 'checked' : ''}> <span>banner ADEME</span></label>
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
      const v = el.type === 'checkbox' ? el.checked : el.value;
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
      state['border-radius'].targets[idx].value = e.target.value; onStateChanged();
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
  // Cover :root, :root[data-fr-theme=light] AND :root[data-fr-theme=dark] in
  // one selector. DSFR defines its combined-shade vars under both light and
  // dark blocks, and the `[data-fr-theme=dark]` block has higher specificity
  // than a plain `:root`, so our overrides need the same selector specificity
  // to win — otherwise the dark hex (e.g. #907fff for sun-113-625) shadows
  // our recomputed light value.
  const lines = [':root, :root[data-fr-theme=light], :root[data-fr-theme=dark] {'];

  for (const [family, cfg] of Object.entries(state.colors ?? {})) {
    if (cfg.generation !== 'lch-remap' || !cfg.anchor?.hex) continue;
    const renamed = cfg.rename || family;
    let palette;
    try {
      palette = computeFamilyPalette({
        anchor: cfg.anchor.hex,
        recalibrate: cfg['recalibrate-grade'] ?? {},
        addGrades: cfg['add-grades'] ?? {},
        semanticRemap: deriveSemanticRemap(family, cfg)
      });
    } catch (e) { continue; }
    const byName = Object.fromEntries(palette.map(e => [e.name, e.values]));

    // Per-grade vars (some components read them directly).
    for (const { name, values } of palette) {
      lines.push(`  --${family}-${name}: ${values[0]};`);
      if (renamed !== family) lines.push(`  --${renamed}-${name}: ${values[0]};`);
    }

    // Combined shade vars: this is what DSFR components actually consume in
    // light mode. Without overriding these, the preview keeps the original
    // hardcoded hex values from dsfr-ademe.css (built with the previous mapping).
    for (const combo of DSFR_SHADE_COMBOS) {
      const lightGrade = byName[combo.light];
      if (!lightGrade) continue;
      const def    = lightGrade[0];
      const hover  = lightGrade[1] ?? def;
      const active = lightGrade[2] ?? def;
      for (const fam of (renamed !== family ? [family, renamed] : [family])) {
        lines.push(`  --${fam}-${combo.name}: ${def};`);
        lines.push(`  --${fam}-${combo.name}-hover: ${hover};`);
        lines.push(`  --${fam}-${combo.name}-active: ${active};`);
      }
    }
  }

  // Shadow uses the canonical light/dark split so the user sees the right
  // shadow when toggling the iframe theme.
  lines.push('}');
  if (state.elevation?.['shadow-color']?.light) {
    lines.push(`:root, :root[data-fr-theme=light] { --shadow-color: ${state.elevation['shadow-color'].light}; }`);
  }
  if (state.elevation?.['shadow-color']?.dark) {
    lines.push(`:root[data-fr-theme=dark] { --shadow-color: ${state.elevation['shadow-color'].dark}; }`);
  }

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
  for (const btn of document.querySelectorAll('.preview__bar button')) {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  }
  if (mode === 'palette') {
    iframe.hidden = true;
    palette.hidden = false;
    renderPaletteView();
  } else {
    iframe.hidden = false;
    palette.hidden = true;
    const target = PREVIEW_SOURCES[mode];
    if (target && iframe.getAttribute('src') !== target) {
      iframe.setAttribute('src', target);
    } else {
      applyPreview();
    }
  }
}

function attachPreviewToggle() {
  for (const btn of document.querySelectorAll('.preview__bar button')) {
    btn.addEventListener('click', () => setPreviewMode(btn.dataset.mode));
  }
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
iframe.addEventListener('load', () => applyPreview());

renderAll();
attachYamlHandler();
attachTopbar();
attachPreviewToggle();
document.getElementById('yaml-editor').value = stringify(state, { lineWidth: 0 });
setYamlStatus('ok', 'défaut chargé');
