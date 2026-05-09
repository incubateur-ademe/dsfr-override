// Garde-fou central de la cible visuelle : compare la palette LCh générée par
// le builder aux hexa exactes du POC Phase 1 (Blue ATE + Red Laura), avec une
// tolérance de ±3 bytes par canal qui absorbe les variations matrice/whitepoint
// entre implémentations LCh.

import test from 'node:test';
import assert from 'node:assert/strict';
import { computeFamilyPalette, serializeFamily } from './palette.js';
import { hexToRgb } from '../lch.js';

// Phase 1 reference: dsfr/src/module/color/variable/_options.scss in the ../dsfr/ Phase 1 fork.
// Each entry is [hex_default, hex_hover, hex_active] (5 values for main).
const PHASE1_BLUE = {
  '75':        ['#1e193a', '#413b54', '#555064'],
  '100':       ['#241f45', '#4a4360', '#5e5870'],
  '125':       ['#2b254d', '#524b6a', '#665f78'],
  '200':       ['#2e2d87', '#62569f', '#786ca7'],
  '625':       ['#907fff', '#bdacff', '#d0c2ff'],
  '850':       ['#d4c6ff', '#aea3d5', '#9b8fc6'],
  '925':       ['#e9e1ff', '#cbc0ec', '#b9ace6'],
  '950':       ['#f0ebff', '#d6ceed', '#c5bbe5'],
  '975':       ['#f7f4ff', '#e1ddec', '#d2cce1'],
  'sun-157':   ['#001977', '#0036db', '#2b3dd7'],
  'main-444':  ['#4950fb', '#8c7cff', '#a492ff', '#8c7cff', '#a492ff']
};

const PHASE1_RED = {
  '75':        ['#37120c', '#543732', '#654d48'],
  '100':       ['#411712', '#603f39', '#715450'],
  '125':       ['#491d17', '#6a4640', '#7a5c57'],
  '200':       ['#770b0f', '#99493e', '#a56257'],
  '625':       ['#f95c4e', '#ff9e8e', '#ffbaae'],
  '850':       ['#ffbfb4', '#d69b91', '#c6867c'],
  '925':       ['#ffded8', '#eebab0', '#e7a397'],
  '950':       ['#ffe9e5', '#efc9c2', '#e7b5ac'],
  '975':       ['#fff3f1', '#eedbd7', '#e4c9c5'],
  'sun-157':   ['#560200', '#a20013', '#ab0015'],
  'main-560':  ['#ff3333', '#ff8d7c', '#ffab9d', '#ff8d7c', '#ffab9d']
};

const TOL = 3; // bytes; absorbs differences in matrix/whitepoint conventions across LCh implementations.

function bytesClose(actualHex: string, expectedHex: string, tol = TOL): boolean {
  const a = hexToRgb(actualHex).map(c => Math.round(c * 255));
  const b = hexToRgb(expectedHex).map(c => Math.round(c * 255));
  for (let i = 0; i < 3; i++) if (Math.abs((a[i] ?? 0) - (b[i] ?? 0)) > tol) return false;
  return true;
}

function diffHex(actualHex: string, expectedHex: string): number[] {
  const a = hexToRgb(actualHex).map(c => Math.round(c * 255));
  const b = hexToRgb(expectedHex).map(c => Math.round(c * 255));
  return a.map((c, i) => c - (b[i] ?? 0));
}

function paletteAsMap(entries: Array<{ name: string; values: string[] }>): Record<string, string[]> {
  const m: Record<string, string[]> = {};
  for (const e of entries) m[e.name] = e.values;
  return m;
}

// L'anchor Blue ATE (#4950FB) reproduit l'intégralité des 11 grades Phase 1 à ±3 bytes/canal.
test('Blue ATE palette: anchor #4950FB matches all 11 Phase 1 grades within ±3 bytes', () => {
  const palette = paletteAsMap(computeFamilyPalette({
    anchor: '#4950FB',
    recalibrate: { 'main-525': 'main-444', 'sun-113': 'sun-157' }
  }));

  for (const [grade, expected] of Object.entries(PHASE1_BLUE)) {
    const got = palette[grade];
    assert.ok(got, `missing grade ${grade}`);
    assert.equal(got.length, expected.length, `grade ${grade}: expected ${expected.length} values, got ${got.length}`);
    for (let i = 0; i < expected.length; i++) {
      const g = got[i];
      const e = expected[i];
      if (g === undefined || e === undefined) throw new Error(`palette ${grade}[${i}]: undefined value`);
      const ok = bytesClose(g, e);
      assert.ok(ok, `blue-france-${grade}[${i}]: expected ${e}, got ${g} (diff ${diffHex(g, e).join(',')})`);
    }
  }
});

// `recalibrate-grade` doit émettre l'ancien nom comme alias pointant vers les
// valeurs de la cible — sinon `_static.scss` / `_sets.scss` cassent.
test('Blue ATE palette: emits aliases for recalibrated grades (main-525, sun-113)', () => {
  const palette = paletteAsMap(computeFamilyPalette({
    anchor: '#4950FB',
    recalibrate: { 'main-525': 'main-444', 'sun-113': 'sun-157' }
  }));

  assert.ok(palette['main-525'], 'main-525 alias should exist');
  assert.ok(palette['main-444'], 'main-444 canonical should exist');
  assert.deepEqual(palette['main-525'], palette['main-444'], 'alias must mirror canonical values');

  assert.ok(palette['sun-113'], 'sun-113 alias should exist');
  assert.ok(palette['sun-157'], 'sun-157 canonical should exist');
  assert.deepEqual(palette['sun-113'], palette['sun-157'], 'sun alias must mirror canonical values');
});

// Idem pour Red Laura (#FF3333), avec un add-grade `sun-157` parce que cette
// famille n'a pas de variante `sun` upstream.
test('Red Laura palette: anchor #FF3333 matches all 11 Phase 1 grades within ±3 bytes', () => {
  const palette = paletteAsMap(computeFamilyPalette({
    anchor: '#FF3333',
    addGrades: { 'sun-157': { L: 15.7, 'c-factor': 1.10 } },
    recalibrate: { 'main-472': 'main-560' }
  }));

  for (const [grade, expected] of Object.entries(PHASE1_RED)) {
    const got = palette[grade];
    assert.ok(got, `missing grade ${grade}`);
    assert.equal(got.length, expected.length, `grade ${grade}: expected ${expected.length} values, got ${got.length}`);
    for (let i = 0; i < expected.length; i++) {
      const g = got[i];
      const e = expected[i];
      if (g === undefined || e === undefined) throw new Error(`palette ${grade}[${i}]: undefined value`);
      const ok = bytesClose(g, e);
      assert.ok(ok, `red-marianne-${grade}[${i}]: expected ${e}, got ${g} (diff ${diffHex(g, e).join(',')})`);
    }
  }
});

// `serializeFamily` produit un bloc SCSS au format exact de DSFR (commentaire
// d'en-tête + 2 espaces d'indentation + virgule terminale).
test('serializeFamily produces a DSFR-shaped block', () => {
  const block = serializeFamily('blue-france', [
    { name: '75', values: ['#1e193a', '#413b54', '#555064'] },
    { name: 'main-444', values: ['#4950fb', '#8c7cff', '#a492ff', '#8c7cff', '#a492ff'] }
  ]);

  assert.ok(block.includes('// blue-france'));
  assert.ok(block.includes('  blue-france-75: #1e193a #413b54 #555064,'));
  assert.ok(block.includes('  blue-france-main-444: #4950fb #8c7cff #a492ff #8c7cff #a492ff,'));
});
