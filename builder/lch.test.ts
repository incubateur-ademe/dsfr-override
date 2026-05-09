// Couvre les primitives CIELAB / LCh : parsing hex, gamma sRGB, conversions
// hex<->LCh, et les ratios WCAG. Les valeurs cibles sont indexées sur la Phase 1.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hexToRgb,
  rgbToHex,
  hexToLch,
  lchToHex,
  contrastRatio,
  relativeLuminance,
  srgbToLinear,
  linearToSrgb
} from './lch.js';

const close = (a: number, b: number, tol = 0.5): boolean => Math.abs(a - b) <= tol;

// `hexToRgb` accepte les trois formes CSS (3-digit, 6-digit, avec ou sans `#`).
test('hex parsing accepts 3-digit, 6-digit, with or without #', () => {
  assert.deepEqual(hexToRgb('#000'), [0, 0, 0]);
  assert.deepEqual(hexToRgb('FFF'), [1, 1, 1]);
  const [r, g, b] = hexToRgb('#4950FB');
  assert.ok(close(r, 73 / 255, 1e-9));
  assert.ok(close(g, 80 / 255, 1e-9));
  assert.ok(close(b, 251 / 255, 1e-9));
});

// Une chaîne non-hexa lève — pas de fallback silencieux.
test('hex parsing rejects invalid input', () => {
  assert.throws(() => hexToRgb('xyz'));
  assert.throws(() => hexToRgb('#12'));
});

// Pour des valeurs byte-aligned, le round-trip hex→rgb→hex est exact à la casse près.
test('rgbToHex round-trip stays exact for byte-aligned values', () => {
  for (const hex of ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#4950fb', '#ff3333', '#907fff']) {
    assert.equal(rgbToHex(hexToRgb(hex)).toLowerCase(), hex.toLowerCase());
  }
});

// `srgbToLinear` et `linearToSrgb` sont inverses à 1e-9 près sur tout l'intervalle.
test('sRGB gamma round-trip', () => {
  for (const c of [0, 0.04, 0.05, 0.18, 0.5, 0.9, 1.0]) {
    const back = linearToSrgb(srgbToLinear(c));
    assert.ok(Math.abs(back - c) < 1e-9, `${c} → ${back}`);
  }
});

// Les anchors Blue ATE et Red Laura doivent matcher les coordonnées LCh
// documentées dans le rapport Phase 1 (annexe « Coordonnées LCh des anchors POC »).
test('hex → LCh anchors match Phase 1 documentation', () => {
  // Phase 1 report § Annexe — Coordonnées LCh des anchors POC
  const blueAte = hexToLch('#4950FB');
  assert.ok(close(blueAte[0], 44.40, 0.2), `Blue ATE L*: ${blueAte[0]}`);
  assert.ok(close(blueAte[1], 99.70, 0.2), `Blue ATE C*: ${blueAte[1]}`);
  assert.ok(close(blueAte[2], 301.00, 0.2), `Blue ATE h°: ${blueAte[2]}`);

  const redLaura = hexToLch('#FF3333');
  assert.ok(close(redLaura[0], 55.95, 0.2), `Red Laura L*: ${redLaura[0]}`);
  assert.ok(close(redLaura[1], 89.25, 0.2), `Red Laura C*: ${redLaura[1]}`);
  assert.ok(close(redLaura[2], 34.27, 0.2), `Red Laura h°: ${redLaura[2]}`);
});

// Le round-trip hex→LCh→hex dérive d'au plus ±1 byte par canal pour les couleurs
// in-gamut (limite intrinsèque due à la non-linéarité gamma + matrice).
test('hex → LCh → hex round-trip stable within 1 byte per channel', () => {
  // Round-trip is lossy at the byte level due to gamma + matrix non-linearity,
  // but should not drift more than ±1 in any RGB channel for in-gamut colors.
  const samples = ['#000000', '#ffffff', '#808080', '#4950fb', '#ff3333', '#907fff', '#001977', '#560200'];
  for (const hex of samples) {
    const [L, C, h] = hexToLch(hex);
    const back = lchToHex(L, C, h);
    const a = hexToRgb(hex).map(c => Math.round(c * 255));
    const b = hexToRgb(back).map(c => Math.round(c * 255));
    for (let i = 0; i < 3; i++) {
      const av = a[i] ?? 0;
      const bv = b[i] ?? 0;
      assert.ok(Math.abs(av - bv) <= 1, `${hex} → ${back}: channel ${i} drifted ${av} → ${bv}`);
    }
  }
});

// Quand un point LCh sort du gamut sRGB, `lchToHex` bisectionne le chroma sans
// jamais produire de valeurs RGB hors [0, 1] et préserve la luminosité demandée.
test('lchToHex clamps out-of-gamut chroma by bisection', () => {
  // L=50, h=0 (red), unrealistic chroma C=200 should be clamped to a valid hex.
  const hex = lchToHex(50, 200, 0);
  const [r, g, b] = hexToRgb(hex);
  assert.ok(r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1);
  // After clamp, the resulting color should still be within reasonable distance
  // of the requested L (chroma was reduced, lightness preserved).
  const [Lback] = hexToLch(hex);
  assert.ok(close(Lback, 50, 1.0), `L drifted: requested 50, got ${Lback}`);
});

// Sanity check de la formule WCAG : luminance noir=0, blanc=1, gris moyen ~0.21.
test('relative luminance: black=0, white=1, mid-gray ~0.21', () => {
  assert.ok(Math.abs(relativeLuminance('#000000')) < 1e-9);
  assert.ok(Math.abs(relativeLuminance('#ffffff') - 1) < 1e-9);
  assert.ok(close(relativeLuminance('#808080'), 0.2158, 0.005));
});

// Bornes du ratio de contraste WCAG : 21 pour noir/blanc, 1 pour deux couleurs identiques.
test('contrast ratio: black/white = 21, identical = 1', () => {
  assert.ok(close(contrastRatio('#000000', '#ffffff'), 21, 0.01));
  assert.equal(contrastRatio('#4950fb', '#4950fb'), 1);
});

// Les ratios de contraste calculés sur la palette Phase 1 doivent matcher les
// valeurs documentées (rapport Phase 1 § « Conformité RGAA AA vérifiée »).
test('WCAG contrast on Phase 1 palette matches documented values', () => {
  // Phase 1 report § "Conformité RGAA AA vérifiée" — contrasts on white background.
  const cases: Array<[string, number]> = [
    ['#001977', 14.94],
    ['#4950FB',  5.49],
    ['#907FFF',  3.15],
    ['#560200', 14.95],
    ['#FF3333',  3.64],
    ['#F95C4E',  3.15]
  ];
  for (const [hex, expected] of cases) {
    const ratio = contrastRatio(hex, '#ffffff');
    assert.ok(close(ratio, expected, 0.02), `${hex}/#fff: expected ${expected}, got ${ratio.toFixed(2)}`);
  }
});
