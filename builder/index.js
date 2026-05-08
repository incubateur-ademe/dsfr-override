#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { argv, exit, stderr, stdout } from 'node:process';
import { fileURLToPath } from 'node:url';
import { load as parseYaml } from 'js-yaml';
import { compile } from './build/compile.js';
import { postProcess } from './build/post-process.js';
import { defaultBanner, postcssProcess } from './build/postcss-process.js';
import { prepare } from './build/prepare.js';
import { restore } from './build/restore.js';
import { writeResults } from './build/write-results.js';
import { generateOverrides } from './generate/index.js';
import { validateAll } from './validate/index.js';
import { updateBaseline } from './validate/upstream-drift.js';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};
const isTty = stdout.isTTY === true;
const c = (color, s) => isTty ? `${C[color]}${s}${C.reset}` : s;

const HELP = `${c('bold', 'ademe-ds')} — DSFR override builder

${c('bold', 'Usage:')}
  ademe-ds <command> [options]

${c('bold', 'Commands:')}
  ${c('cyan', 'build')}             Generate overrides + compile sass + post-process → dist/
  ${c('cyan', 'generate')}          Generate overrides only (no sass)
  ${c('cyan', 'validate')}          Run mapping / drift / WCAG validators
  ${c('cyan', 'baseline --update')} Snapshot DSFR file hashes into .ademe-baseline.json
  ${c('cyan', 'upgrade')}           git submodule update --remote + validate

${c('bold', 'Options:')}
  --mapping <path>   Path to mapping file (default: mapping.yml)
  --minify           Also emit dist/*.min.css (cssnano)
  --strict           Treat warnings as errors
  -h, --help         Show this help
`;

function parseArgs(args) {
  const opts = { strict: false, mapping: 'mapping.yml', update: false, minify: false, help: false };
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-h' || a === '--help') opts.help = true;
    else if (a === '--strict') opts.strict = true;
    else if (a === '--update') opts.update = true;
    else if (a === '--minify') opts.minify = true;
    else if (a === '--mapping') opts.mapping = args[++i];
    else rest.push(a);
  }
  return { opts, rest };
}

function logInfo(msg) { stderr.write(c('dim', '· ') + msg + '\n'); }
function logOk(msg) { stderr.write(c('green', '✓ ') + msg + '\n'); }
function logWarn(msg) { stderr.write(c('yellow', '⚠ ') + msg + '\n'); }
function logErr(msg) { stderr.write(c('red', '✗ ') + msg + '\n'); }

async function runBuild(opts) {
  const t0 = Date.now();
  logInfo('preparing entry');
  const input = prepare({ projectRoot: PROJECT_ROOT });

  logInfo(`compiling sass (${input.targets.length} target${input.targets.length > 1 ? 's' : ''})`);
  let results;
  let buildErr;
  try {
    results = await compile(input);
  } catch (e) {
    buildErr = e;
  }

  // Restore must run before any other failure path so dsfr/ stays clean.
  const status = await restore({ projectRoot: PROJECT_ROOT });
  if (!status.clean) logWarn(`dsfr/ working tree is dirty after build:\n${status.dirty}`);
  if (buildErr) throw buildErr;

  const postcssCfg = input.mapping?.['post-css'] ?? {};
  const postcssEnabled = postcssCfg.enabled !== false;
  if (postcssEnabled) {
    logInfo(`postcss (mqpacker + dedup${opts.minify ? ' + cssnano' : ''})`);
    const banner = postcssCfg.banner === false ? null
      : (postcssCfg['banner-text'] ?? defaultBanner(input.mapping));
    // Process all targets first (no in-place mutation), then write atomically
    // — if any target throws, dist/ keeps its previous state instead of being
    // half-updated.
    const processed = await Promise.all(results.map(async (r) => {
      const out = await postcssProcess(r.css, { banner, minify: opts.minify, from: r.outFile, to: r.outFile });
      return { ...r, css: out.css, minCss: out.minCss };
    }));
    results = processed;
  }

  writeResults(results);

  const post = postProcess({ distDir: input.distDir, mapping: input.mapping });
  for (const r of post.applied) {
    logInfo(`rename: ${r.from} → ${r.to} (${r.replacements} occurrences in ${r.files} files)`);
  }

  for (const r of results) {
    const min = r.minCss ? `, ${r.outFile.replace(/\.css$/, '.min.css')}` : '';
    logOk(`${r.name}: ${r.outFile}${min}`);
  }
  logOk(`build complete (${Date.now() - t0}ms)`);
}

function runGenerate() {
  const mappingPath = resolve(PROJECT_ROOT, 'mapping.yml');
  const mapping = existsSync(mappingPath) ? parseYaml(readFileSync(mappingPath, 'utf8')) : null;
  const result = generateOverrides({
    projectRoot: PROJECT_ROOT,
    mapping,
    distDir: resolve(PROJECT_ROOT, 'dist')
  });
  for (const f of result.written) logInfo(`wrote ${f}`);
  if (result.fontsCopied > 0) logInfo(`copied ${result.fontsCopied} font files`);
  logOk('generate: done');
}

function runValidate(opts) {
  const result = validateAll({ projectRoot: PROJECT_ROOT });
  let hardFails = 0;
  let softFails = 0;

  for (const e of result.mapping.errors) { logErr(`mapping: ${e}`); hardFails++; }
  for (const w of result.mapping.warnings) { logWarn(`mapping: ${w}`); softFails++; }

  if (result.drift.status === 'no-baseline') {
    logWarn('drift: no .ademe-baseline.json — run `ademe-ds baseline --update` after a verified upstream upgrade');
    softFails++;
  } else if (result.drift.status === 'drift') {
    for (const d of result.drift.drifts) logWarn(`drift: ${d.file} changed since baseline`);
    softFails++;
  } else {
    logOk('drift: no changes since baseline');
  }

  for (const ck of result.wcag.checks) {
    if (ck.missing) {
      logWarn(`wcag: ${ck.token} not found in CSS (build first?)`);
      softFails++;
    } else if (ck.ok) {
      logInfo(`wcag: ${ck.token} on ${ck.against}: ${ck.ratio.toFixed(2)} ≥ ${ck.min}`);
    } else {
      logErr(`wcag: ${ck.token} on ${ck.against}: ${ck.ratio.toFixed(2)} < ${ck.min}`);
      hardFails++;
    }
  }

  if (hardFails > 0) { logErr(`validate: ${hardFails} error(s)`); return 1; }
  if (opts.strict && softFails > 0) { logErr(`validate: ${softFails} warning(s) treated as errors (--strict)`); return 1; }
  logOk(`validate: ok${softFails ? ` (${softFails} warning${softFails > 1 ? 's' : ''})` : ''}`);
  return 0;
}

function runBaseline(opts) {
  if (!opts.update) {
    logErr('baseline: pass --update to snapshot current dsfr/ hashes into .ademe-baseline.json');
    return 1;
  }
  const path = updateBaseline(PROJECT_ROOT, resolve(PROJECT_ROOT, 'dsfr'));
  logOk(`baseline: wrote ${path}`);
  return 0;
}

function runUpgrade(opts) {
  logInfo('git submodule update --remote dsfr');
  execFileSync('git', ['submodule', 'update', '--remote', 'dsfr'], {
    cwd: PROJECT_ROOT, stdio: 'inherit'
  });
  return runValidate(opts);
}

async function main() {
  const raw = argv.slice(2);
  if (raw.length === 0 || raw.includes('-h') || raw.includes('--help')) {
    stdout.write(HELP);
    exit(raw.length === 0 ? 1 : 0);
  }

  const [command, ...args] = raw;
  const { opts } = parseArgs(args);

  try {
    switch (command) {
      case 'build':    await runBuild(opts); exit(0);
      case 'generate': runGenerate(); exit(0);
      case 'validate': exit(runValidate(opts));
      case 'baseline': exit(runBaseline(opts));
      case 'upgrade':  exit(runUpgrade(opts));
      default:
        logErr(`unknown command: ${command}`);
        stdout.write(HELP);
        exit(1);
    }
  } catch (e) {
    logErr(e.message);
    exit(1);
  }
}

main();
