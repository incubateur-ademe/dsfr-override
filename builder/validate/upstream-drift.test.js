import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkUpstreamDrift, updateBaseline } from './upstream-drift.js';

function makeFakeProject() {
  const root = mkdtempSync(join(tmpdir(), 'ademe-drift-'));
  const dsfr = join(root, 'dsfr');
  // Plant only the files upstream-drift looks at; the rest stays absent so
  // the snapshot encodes nulls for them — that's a valid baseline state too.
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

test('upstream-drift: file content change is detected', () => {
  const { root, dsfr, planted } = makeFakeProject();
  try {
    updateBaseline(root, dsfr);
    const target = join(dsfr, planted[0]);
    writeFileSync(target, '// upstream changed something\n');
    const r = checkUpstreamDrift(root, dsfr);
    assert.equal(r.status, 'drift');
    assert.equal(r.drifts.length, 1);
    assert.equal(r.drifts[0].file, planted[0]);
    assert.notEqual(r.drifts[0].was, r.drifts[0].now);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('upstream-drift: deleting a file is detected as drift (now=null)', () => {
  const { root, dsfr, planted } = makeFakeProject();
  try {
    updateBaseline(root, dsfr);
    rmSync(join(dsfr, planted[2]));
    const r = checkUpstreamDrift(root, dsfr);
    assert.equal(r.status, 'drift');
    assert.ok(r.drifts.some(d => d.file === planted[2] && d.now === null));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

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
