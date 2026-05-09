#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { argv, exit, stderr, stdout } from 'node:process';
import { fileURLToPath } from 'node:url';
import { parseArgs as nodeParseArgs } from 'node:util';
import { load as parseYaml } from 'js-yaml';
import { compile } from './build/compile.js';
import { buildOverlay } from './build/overlay.js';
import { postProcess } from './build/post-process.js';
import { defaultBanner, postcssProcess } from './build/postcss-process.js';
import { prepare } from './build/prepare.js';
import { restore } from './build/restore.js';
import { writeResults } from './build/write-results.js';
import { generateOverrides } from './generate/index.js';
import { computeFamilyPalette } from './generate/palette.js';
import { contrastRatio, hexToLch } from './lch.js';
import { validateAll } from './validate/index.js';
import { updateBaseline } from './validate/upstream-drift.js';
import type { CompileResult, Mapping, PaletteEntry } from './types.js';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
} as const;
type ColorKey = keyof typeof C;
const isTty = stdout.isTTY === true;
const c = (color: ColorKey, s: string): string => isTty ? `${C[color]}${s}${C.reset}` : s;

const HELP = `${c('bold', 'ademe-ds')} — DSFR override builder

${c('bold', 'Usage:')}
  ademe-ds <command> [options]

${c('bold', 'Commands:')}
  ${c('cyan', 'build')}             Generate overrides + compile sass + post-process → dist/
  ${c('cyan', 'generate')}          Generate overrides only (no sass)
  ${c('cyan', 'palette <name>')}    Print the LCh palette computed for a family from mapping.yml
  ${c('cyan', 'validate')}          Run mapping / drift / WCAG validators
  ${c('cyan', 'baseline --update')} Snapshot DSFR file hashes into .ademe-baseline.json
  ${c('cyan', 'upgrade')}           git submodule update --remote + validate

${c('bold', 'Options:')}
  --mapping <path>   Path to mapping file (default: mapping.yml)
  --target <mode>    Build target: bundle (default) | overlay | forked
  --minify           Also emit dist/*.min.css (cssnano)
  --sourcemap        Emit dist/*.css.map and link via sourceMappingURL
  --strict           Treat warnings as errors
  -h, --help         Show this help

${c('bold', 'Targets:')}
  ${c('cyan', 'bundle')}   (default) Full DSFR bundle with ADEME overrides — replace dsfr.min.css upstream.
  ${c('cyan', 'overlay')}  Slim CSS overlay (palette + decisions + custom rules) to load on top of
            the upstream DSFR shipped by react-dsfr. Disables \`post-process.rename\`.
  ${c('cyan', 'forked')}   (planned) Fork react-dsfr in a submodule and override its build pipeline.
`;

type BuildTarget = 'bundle' | 'overlay' | 'forked';

interface CliOpts {
  strict: boolean;
  mapping: string;
  update: boolean;
  minify: boolean;
  sourcemap: boolean;
  help: boolean;
  target: BuildTarget;
}

const BUILD_TARGETS = ['bundle', 'overlay', 'forked'] as const;

function parseArgs(args: string[]): { opts: CliOpts; rest: string[] } {
  // `node:util` parseArgs (Node ≥ 18.3, stable depuis Node 20) supporte
  // nativement `--flag value`, `--flag=value`, les boolean flags et les
  // shorts. Pas besoin d'une dep tierce sur ce projet.
  const parsed = nodeParseArgs({
    args,
    options: {
      help:       { type: 'boolean', short: 'h' },
      strict:     { type: 'boolean' },
      update:     { type: 'boolean' },
      minify:     { type: 'boolean' },
      sourcemap:  { type: 'boolean' },
      mapping:    { type: 'string', default: 'mapping.yml' },
      target:     { type: 'string', default: 'bundle' }
    },
    allowPositionals: true,
    strict: false
  });

  const target = stringValue(parsed.values.target, 'bundle');
  if (!isBuildTarget(target)) {
    throw new Error(`unknown --target value: ${target} (expected: ${BUILD_TARGETS.join(' | ')})`);
  }

  const opts: CliOpts = {
    strict:    parsed.values.strict === true,
    update:    parsed.values.update === true,
    minify:    parsed.values.minify === true,
    sourcemap: parsed.values.sourcemap === true,
    help:      parsed.values.help === true,
    mapping:   stringValue(parsed.values.mapping, 'mapping.yml'),
    target
  };
  return { opts, rest: parsed.positionals };
}

function isBuildTarget(value: string): value is BuildTarget {
  return (BUILD_TARGETS as readonly string[]).includes(value);
}

// `parseArgs` avec `strict: false` typage `string | boolean | undefined` même
// pour les options déclarées `type: 'string'` (parce que `strict: false`
// laisse passer des shapes inattendues). On narrow ici pour garder un typage
// précis côté CliOpts.
function stringValue(v: string | boolean | undefined, fallback: string): string {
  return typeof v === 'string' ? v : fallback;
}

function logInfo(msg: string): void { stderr.write(c('dim', '· ') + msg + '\n'); }
function logOk(msg: string): void { stderr.write(c('green', '✓ ') + msg + '\n'); }
function logWarn(msg: string): void { stderr.write(c('yellow', '⚠ ') + msg + '\n'); }
function logErr(msg: string): void { stderr.write(c('red', '✗ ') + msg + '\n'); }

async function runBuild(opts: CliOpts): Promise<void> {
  switch (opts.target) {
    case 'bundle':  await runBuildBundle(opts); return;
    case 'overlay': await runBuildOverlay(opts); return;
    case 'forked':  throw new Error('--target=forked not implemented yet (planned: submodule react-dsfr fork — see docs/react-dsfr-integration.md)');
  }
}

async function runBuildOverlay(opts: CliOpts): Promise<void> {
  const t0 = Date.now();
  logInfo('overlay: building slim overlay (rename disabled, components.remove ignored)');
  const result = await buildOverlay({ projectRoot: PROJECT_ROOT, minify: opts.minify });
  if (!result.workspaceClean) {
    logWarn(`dsfr/ working tree is dirty after build:\n${result.workspaceDirty}`);
  }
  logInfo(`overlay: ${result.rootBlocks} :root block(s), ${result.fontFaceBlocks} @font-face`);
  const min = result.minOutFile ? `, ${result.minOutFile}` : '';
  const kb = (result.bytes / 1024).toFixed(1);
  logOk(`overlay: ${result.outFile} (${kb} KB)${min}`);
  logOk(`build complete (${Date.now() - t0}ms)`);
}

async function runBuildBundle(opts: CliOpts): Promise<void> {
  const t0 = Date.now();
  logInfo('preparing entry');
  const input = prepare({ projectRoot: PROJECT_ROOT });

  logInfo(`compiling sass (${input.targets.length} target${input.targets.length > 1 ? 's' : ''})`);
  let results: CompileResult[] | undefined;
  let buildErr: unknown;
  try {
    results = await compile(input, { sourceMap: opts.sourcemap });
  } catch (e) {
    buildErr = e;
  }

  // `restore` doit tourner avant tout autre chemin d'erreur, sinon `dsfr/`
  // reste sale si la compilation Sass échoue.
  const status = await restore({ projectRoot: PROJECT_ROOT });
  if (!status.clean) logWarn(`dsfr/ working tree is dirty after build:\n${status.dirty}`);
  if (buildErr) throw buildErr;
  if (!results) throw new Error('compile returned no results');

  const postcssCfg = input.mapping?.['post-css'] ?? {};
  const postcssEnabled = postcssCfg.enabled !== false;
  if (postcssEnabled) {
    logInfo(`postcss (mqpacker + dedup${opts.minify ? ' + cssnano' : ''})`);
    const banner = postcssCfg.banner === false ? null
      : (postcssCfg['banner-text'] ?? defaultBanner(input.mapping));
    // Process all targets d'abord (zéro mutation in-place), puis write atomique
    // — si un target throw, `dist/` garde son état précédent au lieu d'être
    // moitié-updaté.
    const processed = await Promise.all(results.map(async (r): Promise<CompileResult> => {
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

function runGenerate(): void {
  const mappingPath = resolve(PROJECT_ROOT, 'mapping.yml');
  const mapping = existsSync(mappingPath)
    ? (parseYaml(readFileSync(mappingPath, 'utf8')) as Mapping | null)
    : null;
  const result = generateOverrides({
    projectRoot: PROJECT_ROOT,
    mapping,
    distDir: resolve(PROJECT_ROOT, 'dist')
  });
  for (const f of result.written) logInfo(`wrote ${f}`);
  if (result.fontsCopied > 0) logInfo(`copied ${result.fontsCopied} font files`);
  logOk('generate: done');
}

function runValidate(opts: CliOpts): number {
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

function runBaseline(opts: CliOpts): number {
  if (!opts.update) {
    logErr('baseline: pass --update to snapshot current dsfr/ hashes into .ademe-baseline.json');
    return 1;
  }
  const path = updateBaseline(PROJECT_ROOT, resolve(PROJECT_ROOT, 'dsfr'));
  logOk(`baseline: wrote ${path}`);
  return 0;
}

/**
 * Préview standalone d'une palette LCh sans toucher à `dist/`. Lit `mapping.yml`,
 * recalcule la palette de la famille demandée et l'imprime sur stdout.
 *
 * Format de sortie : ligne par grade `<name> <hex> L=NN.N C=CC.C h=HHH°` +
 * un mini-rapport WCAG du grade `main` contre `#ffffff` et `#1e1e1e`.
 */
function runPalette(family: string): number {
  const mappingPath = resolve(PROJECT_ROOT, 'mapping.yml');
  if (!existsSync(mappingPath)) {
    logErr('palette: mapping.yml introuvable');
    return 1;
  }
  const mapping = parseYaml(readFileSync(mappingPath, 'utf8')) as Mapping | null;
  const cfg = mapping?.colors?.[family];
  if (!cfg) {
    logErr(`palette: famille « ${family} » absente de mapping.colors`);
    return 1;
  }
  if (!cfg.anchor?.hex) {
    logErr(`palette: famille « ${family} » sans anchor.hex`);
    return 1;
  }
  // Avec `exactOptionalPropertyTypes`, on ne propage que les clés réellement
  // définies — pas de `undefined` à la place d'une absence.
  const paletteCfg: Parameters<typeof computeFamilyPalette>[0] = { anchor: cfg.anchor.hex };
  const recal = cfg['recalibrate-grade'] ?? cfg.recalibrate;
  if (recal) paletteCfg.recalibrate = recal;
  const adds = cfg['add-grades'] ?? cfg.addGrades;
  if (adds) paletteCfg.addGrades = adds;
  const remap = cfg['semantic-remap'] ?? cfg.semanticRemap;
  if (remap) paletteCfg.semanticRemap = remap;
  const palette: PaletteEntry[] = computeFamilyPalette(paletteCfg);
  const renamed = cfg.rename ?? family;
  stdout.write(`${c('bold', renamed)} (anchor ${c('cyan', cfg.anchor.hex)})\n`);
  for (const entry of palette) {
    const hex = entry.values[0] ?? '#000000';
    const [L, C, h] = hexToLch(hex);
    stdout.write(`  ${entry.name.padEnd(16)} ${hex}  L=${L.toFixed(1).padStart(5)} C=${C.toFixed(1).padStart(5)} h=${h.toFixed(0).padStart(3)}°\n`);
  }
  const main = palette.find(p => p.name.startsWith('main-'));
  if (main) {
    const hex = main.values[0] ?? '#000000';
    const onWhite = contrastRatio(hex, '#ffffff');
    const onDark = contrastRatio(hex, '#1e1e1e');
    stdout.write(`\n  WCAG main vs #ffffff : ${onWhite.toFixed(2)}\n`);
    stdout.write(`  WCAG main vs #1e1e1e : ${onDark.toFixed(2)}\n`);
  }
  return 0;
}

function runUpgrade(opts: CliOpts): number {
  logInfo('git submodule update --remote dsfr');
  execFileSync('git', ['submodule', 'update', '--remote', 'dsfr'], {
    cwd: PROJECT_ROOT, stdio: 'inherit'
  });
  return runValidate(opts);
}

async function main(): Promise<void> {
  const raw = argv.slice(2);
  if (raw.length === 0 || raw.includes('-h') || raw.includes('--help')) {
    stdout.write(HELP);
    exit(raw.length === 0 ? 1 : 0);
  }

  const [command, ...args] = raw;

  try {
    const { opts } = parseArgs(args);

    switch (command) {
      case 'build':    await runBuild(opts); exit(0);
      case 'generate': runGenerate(); exit(0);
      case 'validate': exit(runValidate(opts));
      case 'baseline': exit(runBaseline(opts));
      case 'upgrade':  exit(runUpgrade(opts));
      case 'palette': {
        const familyArg = args.find(a => !a.startsWith('-'));
        if (!familyArg) {
          logErr('palette: passe le nom d\'une famille (ex: ademe-ds palette blue-france)');
          exit(1);
        }
        exit(runPalette(familyArg));
      }
      default:
        logErr(`unknown command: ${command}`);
        stdout.write(HELP);
        exit(1);
    }
  } catch (e) {
    logErr((e as Error).message);
    exit(1);
  }
}

main();
