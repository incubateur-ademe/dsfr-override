// Couvre les vérifs structurelles sur `mapping.yml` : champs requis, valeurs
// admissibles, collisions de rename, et l'extraction des familles upstream
// depuis `_options.scss` (utilisée pour détecter les collisions).

import test from 'node:test';
import assert from 'node:assert/strict';
import { extractUpstreamFamilies, validateMapping } from './mapping.js';

// Un mapping null produit une erreur dure — le builder ne tournerait pas à blanc.
test('mapping: empty input is an error', () => {
  const r = validateMapping(null);
  assert.equal(r.errors.length, 1);
  const first = r.errors[0];
  assert.ok(first !== undefined);
  assert.match(first, /no mapping/);
});

// Champs informatifs (`version`, `dsfr`) absents = warning seulement, pas d'erreur dure.
test('mapping: missing version/dsfr emit warnings, not errors', () => {
  const r = validateMapping({ colors: {} });
  assert.equal(r.errors.length, 0);
  assert.ok(r.warnings.some(w => w.includes('version')));
  assert.ok(r.warnings.some(w => w.includes('dsfr')));
});

// `generation: lch-remap` sans `anchor.hex` est une erreur dure — sinon le
// builder ne sait pas par où commencer la génération de palette.
test('mapping: lch-remap requires anchor.hex', () => {
  const r = validateMapping({
    version: 1,
    dsfr: '1.14.4',
    colors: { 'blue-france': { generation: 'lch-remap' } }
  });
  assert.ok(r.errors.some(e => e.includes('anchor.hex required')));
});

// Une chaîne `anchor.hex` non-hexa est rejetée tôt, avant la passe LCh.
test('mapping: invalid hex color is an error', () => {
  const r = validateMapping({
    version: 1, dsfr: '1.14.4',
    colors: { 'blue-france': { generation: 'lch-remap', anchor: { hex: 'not-a-hex' } } }
  });
  assert.ok(r.errors.some(e => e.includes('not a valid hex')));
});

// Renommer vers un nom de famille déjà utilisé upstream casserait la cascade
// — erreur dure.
test('mapping: rename collision with upstream family is an error', () => {
  const upstream = new Set(['blue-france', 'red-marianne', 'green-emeraude']);
  const r = validateMapping({
    version: 1, dsfr: '1.14.4',
    colors: { 'blue-france': { rename: 'green-emeraude', generation: 'lch-remap', anchor: { hex: '#4950FB' } } }
  }, { upstreamFamilies: upstream });
  assert.ok(r.errors.some(e => e.includes('collides')));
});

// `rename: <même nom>` est un no-op signalé en warning (probablement un oubli côté user).
test('mapping: rename to self is a warning', () => {
  const r = validateMapping({
    version: 1, dsfr: '1.14.4',
    colors: { 'blue-france': { rename: 'blue-france', generation: 'lch-remap', anchor: { hex: '#4950FB' } } }
  });
  assert.ok(r.warnings.some(w => w.includes('no-op')));
});

// Type runtime check : `components.remove` doit être un array, pas un string.
test('mapping: components.remove must be an array', () => {
  // Intentionally passing a string instead of array to validate the runtime check.
  const r = validateMapping({
    version: 1, dsfr: '1.14.4',
    components: { remove: 'header' as unknown as string[] }
  });
  assert.ok(r.errors.some(e => e.includes('components.remove must be an array')));
});

// Un mapping minimal ADEME (Blue ATE + Red Laura + remove header/footer) passe sans erreur.
test('mapping: clean ADEME-shaped mapping has zero errors', () => {
  const r = validateMapping({
    version: 1,
    dsfr: '1.14.4',
    colors: {
      'blue-france': { rename: 'blue-ate', generation: 'lch-remap', anchor: { hex: '#4950FB' } },
      'red-marianne': { rename: 'red-laura', generation: 'lch-remap', anchor: { hex: '#FF3333' } }
    },
    components: { remove: ['header', 'footer'] }
  });
  assert.equal(r.errors.length, 0, `unexpected errors: ${r.errors.join(', ')}`);
});

// L'extraction des familles upstream se base sur les marqueurs `// <name>` que
// DSFR maintient au-dessus de chaque bloc dans `_options.scss`.
test('extractUpstreamFamilies: pulls names from // comment markers in _options.scss', () => {
  const scss = `
$values: (
  // grey
  grey-50: #161616 #343434 #474747,
  // blue-france
  blue-france-75: #1b1b35 #3a3a68 #4d4d83,
  // red-marianne
  red-marianne-425: #c9191e #f93f42 #f95a5c,
);
`;
  const families = extractUpstreamFamilies(scss);
  assert.ok(families.has('grey'));
  assert.ok(families.has('blue-france'));
  assert.ok(families.has('red-marianne'));
});
