import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepare } from './prepare.js';
import { compile } from './compile.js';
import { restore } from './restore.js';
import { postProcess } from './post-process.js';
import { defaultBanner, postcssProcess } from './postcss-process.js';
import { writeResults } from './write-results.js';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

async function build({ minify = false } = {}) {
  const input = prepare({ projectRoot: PROJECT_ROOT });
  const results = await compile(input);
  const status = await restore({ projectRoot: PROJECT_ROOT });
  const banner = defaultBanner(input.mapping);
  for (const r of results) {
    const out = await postcssProcess(r.css, { banner, minify, from: r.outFile, to: r.outFile });
    r.css = out.css;
    r.minCss = out.minCss;
  }
  writeResults(results);
  postProcess({ distDir: input.distDir, mapping: input.mapping });
  const dsfr = results.find(r => r.name === 'dsfr');
  return { outFile: dsfr.outFile, results, clean: status.clean, dirty: status.dirty };
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
  assert.ok(css.includes('--blue-ate-'), 'contains DSFR CSS variables (post-rename)');
  assert.ok(css.includes('@media print'), 'contains print rules');

  assert.ok(r.clean, `dsfr/ submodule should be clean after build, got:\n${r.dirty}`);
});

test('build: ADEME mapping injects LCh palette into combined shade vars', async () => {
  await build();
  const css = readFileSync(join(PROJECT_ROOT, 'dist', 'dsfr-ademe.css'), 'utf8');
  // Phase 1 reference values — combined shade vars + post-rename family names.
  assert.ok(css.includes('--blue-ate-sun-113-625: #001977'), 'blue strong (light) → ADEME sun-157');
  assert.ok(css.includes('--blue-ate-main-525: #4950fb'), 'blue main → ADEME main-444 anchor');
  assert.ok(css.includes('--red-laura-main-472: #ff3333'), 'red main → ADEME main-560 anchor');
});

test('build: typography/shadow/radius overrides reach the final CSS', async () => {
  await build();
  const css = readFileSync(join(PROJECT_ROOT, 'dist', 'dsfr-ademe.css'), 'utf8');
  assert.ok(css.includes('PublicSans-Regular.woff2'), 'PublicSans @font-face emitted');
  assert.ok(css.includes('--shadow-color: rgba(0, 0, 0, 0.16)'), 'neutral shadow color (light) applied');
  assert.ok(css.includes('--shadow-color: rgba(0, 0, 0, 0.32)'), 'neutral shadow color (dark) applied');
  assert.ok(/\.fr-card\s*\{[^}]*border-radius:\s*0\.75rem/.test(css), '.fr-card border-radius 0.75rem');
  assert.ok(/\.fr-card\s*\{[^}]*overflow:\s*hidden/.test(css), '.fr-card overflow: hidden');
});

test('build: post-process rename leaves no upstream family name behind', async () => {
  await build();
  const css = readFileSync(join(PROJECT_ROOT, 'dist', 'dsfr-ademe.css'), 'utf8');
  assert.equal((css.match(/blue-france/g) ?? []).length, 0, 'all blue-france renamed to blue-ate');
  assert.equal((css.match(/red-marianne/g) ?? []).length, 0, 'all red-marianne renamed to red-laura');
});

test('build: copies font files to dist/fonts/', async () => {
  await build();
  const fontsDir = join(PROJECT_ROOT, 'dist', 'fonts');
  for (const variant of ['PublicSans-Regular.woff2', 'PublicSans-Bold.woff2', 'PublicSans-LightItalic.woff']) {
    assert.ok(existsSync(join(fontsDir, variant)), `missing ${variant} in dist/fonts/`);
  }
});

test('build: components.remove strips header/footer from the output', async () => {
  await build();
  const css = readFileSync(join(PROJECT_ROOT, 'dist', 'dsfr-ademe.css'), 'utf8');
  assert.equal((css.match(/\.fr-header[^a-z]/g) ?? []).length, 0, 'no .fr-header selectors');
  assert.equal((css.match(/\.fr-footer[^a-z]/g) ?? []).length, 0, 'no .fr-footer selectors');
});

test('build: manual-overrides reach the output (card-fix)', async () => {
  await build();
  const css = readFileSync(join(PROJECT_ROOT, 'dist', 'dsfr-ademe.css'), 'utf8');
  // Card-fix box-shadow inset trick — manual override appended to overrides/_index.scss.
  assert.ok(/\.fr-card:not\(\.fr-card--no-border\):not\(\.fr-card--shadow\)\s*\{[^}]*box-shadow:\s*inset/.test(css),
    'card-fix box-shadow inset rule present');
});

test('build: two consecutive builds are byte-identical (reproducibility)', async () => {
  const r1 = await build();
  const css1 = readFileSync(r1.outFile);
  const r2 = await build();
  const css2 = readFileSync(r2.outFile);
  assert.deepEqual(css1, css2, 'two builds produced different output');
});

test('postcss: ADEME banner is the very first thing in the file', async () => {
  await build();
  const css = readFileSync(join(PROJECT_ROOT, 'dist', 'dsfr-ademe.css'), 'utf8');
  assert.match(css, /^\/\*\s*ADEME Design System.*DSFR\s+\d+\.\d+/);
});

test('postcss: @media (min-width: 36em) is grouped (mqpacker)', async () => {
  await build();
  const css = readFileSync(join(PROJECT_ROOT, 'dist', 'dsfr-ademe.css'), 'utf8');
  // Pre-postcss this query showed up many times scattered through the file.
  // mqpacker collapses them into a single block; expect a small handful at most.
  const count = (css.match(/@media \(min-width: 36em\) \{/g) ?? []).length;
  assert.ok(count <= 2, `@media (min-width: 36em) should be grouped, got ${count} blocks`);
});

test('postcss: line count is below the pre-postcss baseline', async () => {
  await build();
  const lines = readFileSync(join(PROJECT_ROOT, 'dist', 'dsfr-ademe.css'), 'utf8').split('\n').length;
  // Pre-postcss baseline was ~33342 lines. Anything significantly above means
  // dedup/mqpacker regressed.
  assert.ok(lines < 28000, `dsfr-ademe.css grew unexpectedly: ${lines} lines (baseline ~25445)`);
});

test('postcss: --minify produces a smaller .min.css', async () => {
  await build({ minify: true });
  const css = readFileSync(join(PROJECT_ROOT, 'dist', 'dsfr-ademe.css'));
  const min = readFileSync(join(PROJECT_ROOT, 'dist', 'dsfr-ademe.min.css'));
  assert.ok(min.length < css.length, `min.css ${min.length} should be smaller than css ${css.length}`);
  // cssnano on already mqpacker'd CSS won't shrink dramatically; expect ≥10% off.
  assert.ok(min.length / css.length < 0.95, `min.css should be at least 5% smaller, got ${(min.length / css.length).toFixed(2)}`);
});

test('postcss: banner is idempotent across two builds', async () => {
  await build();
  await build();
  const css = readFileSync(join(PROJECT_ROOT, 'dist', 'dsfr-ademe.css'), 'utf8');
  const banners = (css.match(/ADEME Design System/g) ?? []).length;
  assert.equal(banners, 1, `banner should appear once, got ${banners}`);
});

test('build: dsfr/ submodule git tree stays clean (no leaked writes)', async () => {
  await build();
  const dirty = execFileSync('git', ['status', '--porcelain'], {
    cwd: join(PROJECT_ROOT, 'dsfr'),
    encoding: 'utf8'
  });
  assert.equal(dirty.trim(), '', `dsfr/ dirty after build:\n${dirty}`);
});
