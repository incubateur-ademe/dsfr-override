#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { argv, cwd, exit, stderr, stdout } from 'node:process';
import { fileURLToPath } from 'node:url';
import { prepare } from './build/prepare.js';
import { compile } from './build/compile.js';
import { restore } from './build/restore.js';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const COMMANDS = new Set(['build', 'generate', 'validate']);

const HELP = `ademe-ds — DSFR override builder (Phase 2)

Usage:
  ademe-ds <command> [options]

Commands:
  build       Generate overrides + run DSFR build + post-process → dist/
  generate    Generate overrides only (no DSFR build)
  validate    Validate mapping.yml + check upstream drift

Options:
  --mapping <path>   Path to mapping file (default: mapping.yml)
  --strict           Treat warnings as errors
  -h, --help         Show this help
`;

function parseArgs(args) {
  const opts = { strict: false, mapping: 'mapping.yml', help: false };
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-h' || a === '--help') opts.help = true;
    else if (a === '--strict') opts.strict = true;
    else if (a === '--mapping') opts.mapping = args[++i];
    else rest.push(a);
  }
  return { opts, rest };
}

async function runBuild() {
  const t0 = Date.now();
  stderr.write('[ademe-ds] build: preparing entry…\n');
  const input = prepare({ projectRoot: PROJECT_ROOT });

  stderr.write('[ademe-ds] build: compiling sass…\n');
  let outFile;
  let buildErr;
  try {
    const result = await compile(input);
    outFile = result.outFile;
  } catch (e) {
    buildErr = e;
  }

  const status = await restore({ projectRoot: PROJECT_ROOT });
  if (!status.clean) {
    stderr.write(`[ademe-ds] WARN: dsfr/ working tree is dirty after build:\n${status.dirty}\n`);
  }
  if (buildErr) throw buildErr;

  const ms = Date.now() - t0;
  stderr.write(`[ademe-ds] build: ${outFile} (${ms}ms)\n`);
}

async function main() {
  const raw = argv.slice(2);
  if (raw.length === 0 || raw.includes('-h') || raw.includes('--help')) {
    stdout.write(HELP);
    exit(raw.length === 0 ? 1 : 0);
  }

  const [command, ...args] = raw;
  parseArgs(args);

  if (!COMMANDS.has(command)) {
    stderr.write(`Unknown command: ${command}\n\n${HELP}`);
    exit(1);
  }

  try {
    if (command === 'build') {
      await runBuild();
    } else {
      stderr.write(`[ademe-ds] ${command}: not implemented yet\n`);
    }
    exit(0);
  } catch (e) {
    stderr.write(`[ademe-ds] error: ${e.message}\n`);
    exit(1);
  }
}

main();
