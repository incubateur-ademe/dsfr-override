// Couvre la détection de drift upstream — création de baseline, comparaison
// par hash sha256, et différenciation no-baseline / ok / drift. Tout tourne
// dans un projet tmp pour rester hermétique.

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkUpstreamDrift, updateBaseline } from './upstream-drift.js';

function makeFakeProject() {
  const root = mkdtempSync(join(tmpdir(), 'ademe-drift-'));
  const dsfr = join(root, 'dsfr');
  // On ne plante que les fichiers que `upstream-drift` regarde ; le reste
  // reste absent pour que le snapshot encode des `null` — état de baseline
  // valide aussi.
  const planted = [
    'src/module/color/variable/_options.scss',
    'src/module/color/variable/_sets.scss',
    'src/module/color/variable/_decisions.scss',
    'src/module/color/variable/_static.scss',
    'src/dsfr/component/main.scss',
    'src/dsfr/component/legacy.scss',
    'src/dsfr/component/print.scss',
    'src/dsfr/core/style/typography/setting/_font-face.scss',
    'src/module/elevation/variable/_shadows.scss'
  ];
  for (const rel of planted) {
    const abs = join(dsfr, rel);
    mkdirSync(join(abs, '..'), { recursive: true });
    writeFileSync(abs, `// initial: ${rel}\n`);
  }
  return { root, dsfr, planted };
}

// Sans `.ademe-baseline.json`, le statut est `no-baseline` — pas un échec.
test('upstream-drift: no baseline → status no-baseline', () => {
  const { root, dsfr } = makeFakeProject();
  try {
    const r = checkUpstreamDrift(root, dsfr);
    assert.equal(r.status, 'no-baseline');
    assert.equal(r.drifts.length, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// `updateBaseline` puis `checkUpstreamDrift` immédiat = statut `ok`.
test('upstream-drift: write baseline then status ok', () => {
  const { root, dsfr } = makeFakeProject();
  try {
    const path = updateBaseline(root, dsfr);
    assert.ok(existsSync(path));
    const r = checkUpstreamDrift(root, dsfr);
    assert.equal(r.status, 'ok');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Une modif de contenu d'un fichier tracké change son sha256 et passe le statut à `drift`.
test('upstream-drift: file content change is detected', () => {
  const { root, dsfr, planted } = makeFakeProject();
  try {
    updateBaseline(root, dsfr);
    const first = planted[0];
    if (!first) throw new Error('planted[0] missing');
    const target = join(dsfr, first);
    writeFileSync(target, '// upstream changed something\n');
    const r = checkUpstreamDrift(root, dsfr);
    assert.equal(r.status, 'drift');
    assert.equal(r.drifts.length, 1);
    const drift = r.drifts[0];
    if (!drift) throw new Error('drifts[0] missing');
    assert.equal(drift.file, first);
    assert.notEqual(drift.was, drift.now);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Supprimer un fichier tracké est aussi du drift (la signature passe de hash à `null`).
test('upstream-drift: deleting a file is detected as drift (now=null)', () => {
  const { root, dsfr, planted } = makeFakeProject();
  try {
    updateBaseline(root, dsfr);
    const third = planted[2];
    if (!third) throw new Error('planted[2] missing');
    rmSync(join(dsfr, third));
    const r = checkUpstreamDrift(root, dsfr);
    assert.equal(r.status, 'drift');
    assert.ok(r.drifts.some(d => d.file === third && d.now === null));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Le JSON de baseline est pretty-printé (lisible à la review humaine).
test('upstream-drift: baseline json is human-readable (sorted-ish, indented)', () => {
  const { root, dsfr } = makeFakeProject();
  try {
    const path = updateBaseline(root, dsfr);
    const content = readFileSync(path, 'utf8');
    assert.ok(content.startsWith('{\n'), 'pretty-printed');
    const parsed = JSON.parse(content);
    assert.ok(typeof parsed === 'object' && parsed !== null);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
