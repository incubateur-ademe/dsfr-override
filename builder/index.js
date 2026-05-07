#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process';

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

function main() {
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

  stderr.write(`[ademe-ds] ${command}: not implemented yet (Step 0 placeholder)\n`);
  exit(0);
}

main();
