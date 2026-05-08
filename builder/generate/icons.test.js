import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applyIconMapping, generateIconAddsScss } from './icons.js';

const REAL_ROOT = '/Users/lsagetlethias/source/ADEME/dsfr-override';

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

test('generateIconAddsScss: empty input → empty string', () => {
  assert.equal(generateIconAddsScss([]), '');
  assert.equal(generateIconAddsScss(null), '');
});
