import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepare } from './prepare.js';
import { compile } from './compile.js';
import { restore } from './restore.js';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

async function build() {
  const input = prepare({ projectRoot: PROJECT_ROOT });
  const result = await compile(input);
  const status = await restore({ projectRoot: PROJECT_ROOT });
  return { ...result, clean: status.clean, dirty: status.dirty };
}

test('build: produces a sane DSFR-shaped CSS', async () => {
  const out = join(PROJECT_ROOT, 'dist', 'dsfr-ademe.css');
  if (existsSync(out)) rmSync(out);

  const r = await build();
  assert.equal(r.outFile, out);
  assert.ok(existsSync(out), 'dist file written');
  assert.ok(statSync(out).size > 100_000, 'CSS bigger than 100KB');

  const css = readFileSync(out, 'utf8');
  assert.ok(css.includes('.fr-btn'), 'contains .fr-btn');
  assert.ok(css.includes('.fr-card'), 'contains .fr-card');
  assert.ok(css.includes('--blue-france-'), 'contains DSFR CSS variables');
  assert.ok(css.includes('@media print'), 'contains print rules');

  assert.ok(r.clean, `dsfr/ submodule should be clean after build, got:\n${r.dirty}`);
});

test('build: ADEME mapping injects LCh palette into combined shade vars', async () => {
  await build();
  const css = readFileSync(join(PROJECT_ROOT, 'dist', 'dsfr-ademe.css'), 'utf8');
  // Phase 1 reference values — the combined shade vars DSFR emits should now hold ours.
  assert.ok(css.includes('--blue-france-sun-113-625: #001977'), 'blue strong (light) → ADEME sun-157');
  assert.ok(css.includes('--blue-france-main-525: #4950fb'), 'blue main → ADEME main-444 anchor');
  assert.ok(css.includes('--red-marianne-main-472: #ff3333'), 'red main → ADEME main-560 anchor');
});

test('build: two consecutive builds are byte-identical (reproducibility)', async () => {
  const r1 = await build();
  const css1 = readFileSync(r1.outFile);
  const r2 = await build();
  const css2 = readFileSync(r2.outFile);
  assert.deepEqual(css1, css2, 'two builds produced different output');
});

test('build: dsfr/ submodule git tree stays clean (no leaked writes)', async () => {
  await build();
  const dirty = execFileSync('git', ['status', '--porcelain'], {
    cwd: join(PROJECT_ROOT, 'dsfr'),
    encoding: 'utf8'
  });
  assert.equal(dirty.trim(), '', `dsfr/ dirty after build:\n${dirty}`);
});
