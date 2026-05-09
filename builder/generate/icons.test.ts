// Couvre la pipeline icônes : rsync depuis le submodule, overrides Lucide 1-1,
// adds (avec leurs trois formes YAML) et la génération SCSS associée. Utilise
// le checkout réel du submodule — REAL_ROOT pointe vers la racine projet.

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applyIconMapping, generateIconAddsScss } from './icons.js';

const REAL_ROOT = '/Users/lsagetlethias/source/ADEME/dsfr-override';

// Sans overrides ni adds, `applyIconMapping` doit recopier l'intégralité de
// l'arbre DSFR sans toucher aux fichiers (aucun marqueur Lucide).
test('icons: empty mapping copies the entire DSFR icon set unchanged', () => {
  const dist = mkdtempSync(join(tmpdir(), 'icons-empty-'));
  try {
    const r = applyIconMapping({ projectRoot: REAL_ROOT, mapping: {}, distDir: dist });
    assert.equal(r.overridesApplied, 0);
    assert.equal(r.addsApplied, 0);
    assert.ok(existsSync(join(dist, 'icons/system/fr--success-fill.svg')));
    // Original DSFR svg, not lucide.
    const svg = readFileSync(join(dist, 'icons/system/fr--success-fill.svg'), 'utf8');
    assert.ok(!svg.includes('lucide'), 'pristine DSFR file should not contain lucide marker');
  } finally {
    rmSync(dist, { recursive: true, force: true });
  }
});

// Une override remplace exactement le SVG cible (le fichier post-rsync porte la
// signature Lucide), sans contaminer les voisins.
test('icons.overrides: replace fr--success-fill with lucide circle-check', () => {
  const dist = mkdtempSync(join(tmpdir(), 'icons-ov-'));
  try {
    const r = applyIconMapping({
      projectRoot: REAL_ROOT,
      mapping: { icons: { overrides: { 'fr--success-fill': 'circle-check' } } },
      distDir: dist
    });
    assert.equal(r.overridesApplied, 1);
    const svg = readFileSync(join(dist, 'icons/system/fr--success-fill.svg'), 'utf8');
    assert.match(svg, /lucide-circle-check/);
    // Other DSFR icons stay pristine.
    const other = readFileSync(join(dist, 'icons/system/fr--warning-fill.svg'), 'utf8');
    assert.ok(!other.includes('lucide'));
  } finally {
    rmSync(dist, { recursive: true, force: true });
  }
});

// Une override qui pointe vers un nom DSFR inconnu lève — pas de drop silencieux.
test('icons.overrides: throws on unknown DSFR icon name', () => {
  const dist = mkdtempSync(join(tmpdir(), 'icons-bad-'));
  try {
    assert.throws(
      () => applyIconMapping({
        projectRoot: REAL_ROOT,
        mapping: { icons: { overrides: { 'fr--this-does-not-exist': 'circle-check' } } },
        distDir: dist
      }),
      /not an existing DSFR icon/
    );
  } finally {
    rmSync(dist, { recursive: true, force: true });
  }
});

// Idem côté Lucide : nom inconnu = throw, l'utilisateur est redirigé vers la liste.
test('icons.overrides: throws on unknown lucide name', () => {
  const dist = mkdtempSync(join(tmpdir(), 'icons-bad2-'));
  try {
    assert.throws(
      () => applyIconMapping({
        projectRoot: REAL_ROOT,
        mapping: { icons: { overrides: { 'fr--success-fill': 'definitely-not-a-lucide-icon' } } },
        distDir: dist
      }),
      /lucide icon .* not found/
    );
  } finally {
    rmSync(dist, { recursive: true, force: true });
  }
});

// Forme string brute : token = nom Lucide, le SVG atterrit sous `dist/icons/lucide/`.
test('icons.add: string entry maps to .fr-icon-<name>', () => {
  const dist = mkdtempSync(join(tmpdir(), 'icons-add-'));
  try {
    const r = applyIconMapping({
      projectRoot: REAL_ROOT,
      mapping: { icons: { add: ['flame'] } },
      distDir: dist
    });
    assert.equal(r.addsApplied, 1);
    assert.deepEqual(r.addEntries, [{ token: 'flame', lucideName: 'flame' }]);
    assert.ok(existsSync(join(dist, 'icons/lucide/flame.svg')));
  } finally {
    rmSync(dist, { recursive: true, force: true });
  }
});

// Forme objet `{token, name}` : le SVG est nommé d'après le token, pas le nom Lucide.
test('icons.add: object entry with custom token aliases the lucide name', () => {
  const dist = mkdtempSync(join(tmpdir(), 'icons-alias-'));
  try {
    const r = applyIconMapping({
      projectRoot: REAL_ROOT,
      mapping: { icons: { add: [{ token: 'ademe-pin', name: 'map-pin' }] } },
      distDir: dist
    });
    assert.deepEqual(r.addEntries, [{ token: 'ademe-pin', lucideName: 'map-pin' }]);
    assert.ok(existsSync(join(dist, 'icons/lucide/ademe-pin.svg')));
    assert.ok(!existsSync(join(dist, 'icons/lucide/map-pin.svg')));
  } finally {
    rmSync(dist, { recursive: true, force: true });
  }
});

// Une règle CSS par entrée, avec `mask-image` vendor-préfixé pour matcher la
// sortie de la mixin DSFR `generate-icons`.
test('generateIconAddsScss: emits one rule per add entry', () => {
  const scss = generateIconAddsScss([
    { token: 'flame', lucideName: 'flame' },
    { token: 'ademe-pin', lucideName: 'map-pin' }
  ]);
  assert.match(scss, /\.fr-icon-flame::before, \.fr-icon-flame::after \{/);
  assert.match(scss, /mask-image: url\('icons\/lucide\/flame\.svg'\);/);
  assert.match(scss, /\.fr-icon-ademe-pin::before/);
  assert.match(scss, /mask-image: url\('icons\/lucide\/ademe-pin\.svg'\);/);
});

// Aucune entrée → string vide (et donc aucun `@import` dans `_index.scss`).
test('generateIconAddsScss: empty input → empty string', () => {
  assert.equal(generateIconAddsScss([]), '');
  assert.equal(generateIconAddsScss(null), '');
});
