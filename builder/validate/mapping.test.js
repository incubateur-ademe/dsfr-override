import test from 'node:test';
import assert from 'node:assert/strict';
import { extractUpstreamFamilies, validateMapping } from './mapping.js';

test('mapping: empty input is an error', () => {
  const r = validateMapping(null);
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /no mapping/);
});

test('mapping: missing version/dsfr emit warnings, not errors', () => {
  const r = validateMapping({ colors: {} });
  assert.equal(r.errors.length, 0);
  assert.ok(r.warnings.some(w => w.includes('version')));
  assert.ok(r.warnings.some(w => w.includes('dsfr')));
});

test('mapping: lch-remap requires anchor.hex', () => {
  const r = validateMapping({
    version: 1,
    dsfr: '1.14.4',
    colors: { 'blue-france': { generation: 'lch-remap' } }
  });
  assert.ok(r.errors.some(e => e.includes('anchor.hex required')));
});

test('mapping: invalid hex color is an error', () => {
  const r = validateMapping({
    version: 1, dsfr: '1.14.4',
    colors: { 'blue-france': { generation: 'lch-remap', anchor: { hex: 'not-a-hex' } } }
  });
  assert.ok(r.errors.some(e => e.includes('not a valid hex')));
});

test('mapping: rename collision with upstream family is an error', () => {
  const upstream = new Set(['blue-france', 'red-marianne', 'green-emeraude']);
  const r = validateMapping({
    version: 1, dsfr: '1.14.4',
    colors: { 'blue-france': { rename: 'green-emeraude', generation: 'lch-remap', anchor: { hex: '#4950FB' } } }
  }, { upstreamFamilies: upstream });
  assert.ok(r.errors.some(e => e.includes('collides')));
});

test('mapping: rename to self is a warning', () => {
  const r = validateMapping({
    version: 1, dsfr: '1.14.4',
    colors: { 'blue-france': { rename: 'blue-france', generation: 'lch-remap', anchor: { hex: '#4950FB' } } }
  });
  assert.ok(r.warnings.some(w => w.includes('no-op')));
});

test('mapping: components.remove must be an array', () => {
  const r = validateMapping({
    version: 1, dsfr: '1.14.4',
    components: { remove: 'header' }
  });
  assert.ok(r.errors.some(e => e.includes('components.remove must be an array')));
});

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
