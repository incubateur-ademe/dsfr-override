import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { generateDsfrConfig } from './dsfr-config.js';

/**
 * Prepare the SCSS entry source and resolution context for compilation.
 *
 * Strategy: do NOT materialize a tmp workspace on disk. Instead we feed sass
 * an in-memory string with a virtual URL that points inside `dsfr/src/dsfr/`
 * — that gives @import resolution the same context as if we were building
 * the official DSFR `main.scss`, while letting us append our overrides at
 * the end without touching the submodule.
 *
 * @param {object} opts
 * @param {string} opts.projectRoot  Absolute path of the override project (where dsfr/ submodule lives)
 * @param {string} [opts.overridesIndex]  Absolute path to overrides/_index.scss (created empty if missing)
 * @param {string} [opts.distDir]    Output directory (created if missing)
 * @returns {{ entrySource: string, entryUrl: URL, loadPaths: string[], distDir: string }}
 */
export function prepare(opts) {
  const projectRoot = opts.projectRoot;
  const dsfrRoot = join(projectRoot, 'dsfr');
  const dsfrEntryDir = join(dsfrRoot, 'src/dsfr');
  const overridesIndex = opts.overridesIndex ?? join(projectRoot, 'overrides/_index.scss');
  const distDir = opts.distDir ?? join(projectRoot, 'dist');

  if (!existsSync(dsfrEntryDir)) {
    throw new Error(`DSFR submodule not found at ${dsfrRoot}. Run: git submodule update --init`);
  }

  generateDsfrConfig(dsfrRoot);

  if (!existsSync(overridesIndex)) {
    mkdirSync(dirname(overridesIndex), { recursive: true });
    writeFileSync(overridesIndex, '// generated overrides — empty by default\n');
  }

  if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

  // Reproduce dsfr/tool/build/styles.js: combined entry concatenates each style file
  // declared in the dsfr package (main, legacy, print).
  const overridesAbs = resolve(overridesIndex);
  const entrySource = [
    "@import 'main';",
    "@import 'legacy';",
    "@import 'print';",
    `@import '${overridesAbs}';`,
    ''
  ].join('\n');

  const entryUrl = pathToFileURL(join(dsfrEntryDir, '__ademe-entry.scss'));

  return {
    entrySource,
    entryUrl,
    loadPaths: [dsfrRoot],
    distDir
  };
}
