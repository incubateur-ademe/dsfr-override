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

test('build: empty overrides produce a sane DSFR-shaped CSS', async (t) => {
  // Ensure no leftover dist file biases the test.
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
