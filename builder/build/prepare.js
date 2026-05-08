import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { load as parseYaml } from 'js-yaml';
import { generateDsfrConfig } from './dsfr-config.js';
import { computeFamilyPalette } from '../generate/palette.js';
import { generateOverrides } from '../generate/index.js';
import { transformFamilyBlock } from './transform-options.js';
import { ensureWorkspace } from './workspace.js';
import { filterComponents } from './filter-components.js';

/**
 * Build the inputs for sass compilation. Materializes a writable copy of dsfr/
 * (so that the modified _options.scss wins at relative-import time), then
 * composes one SCSS entry per DSFR package we want to ship. Today: `dsfr`
 * (components / scheme / core) and `utility` (background-, text-, border-,
 * fr-tag--blue-france etc.).
 *
 * @param {object} opts
 * @param {string} opts.projectRoot       Project root (where dsfr/ submodule lives)
 * @param {string} [opts.mappingPath]     Path to mapping.yml (default: <projectRoot>/mapping.yml)
 * @param {string} [opts.overridesIndex]  Path to overrides/_index.scss (auto-created if missing)
 * @param {string} [opts.distDir]         Output dir (auto-created if missing)
 * @returns {{
 *   targets: Array<{ name: string, entrySource: string, entryUrl: URL, outName: string, withOverrides: boolean }>,
 *   loadPaths: string[],
 *   distDir: string,
 *   workspaceDsfr: string,
 *   mapping: object | null
 * }}
 */
export function prepare(opts) {
  const projectRoot = opts.projectRoot;
  const dsfrRoot = join(projectRoot, 'dsfr');
  const overridesIndex = opts.overridesIndex ?? join(projectRoot, 'overrides/_index.scss');
  const distDir = opts.distDir ?? join(projectRoot, 'dist');
  const mappingPath = opts.mappingPath ?? join(projectRoot, 'mapping.yml');

  if (!existsSync(join(dsfrRoot, 'src/dsfr'))) {
    throw new Error(`DSFR submodule not found at ${dsfrRoot}. Run: git submodule update --init`);
  }

  const { workspaceDsfr } = ensureWorkspace(projectRoot, dsfrRoot);

  generateDsfrConfig(workspaceDsfr);
  // Also seed .config/ in the submodule itself — storybook stories live in
  // dsfr/src/dsfr/**/*.stories.js and resolve their @config refs relatively.
  // .config/ is in the submodule's .gitignore so git status stays clean.
  generateDsfrConfig(dsfrRoot);

  if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

  const mapping = existsSync(mappingPath)
    ? parseYaml(readFileSync(mappingPath, 'utf8'))
    : null;

  generateOverrides({ projectRoot, mapping, distDir });

  // Always start from the pristine submodule so the workspace doesn't
  // accumulate stale per-build mutations.
  const optionsSrc = join(dsfrRoot, 'src/module/color/variable/_options.scss');
  const optionsDst = join(workspaceDsfr, 'src/module/color/variable/_options.scss');
  let optionsScss = readFileSync(optionsSrc, 'utf8');
  if (mapping?.colors) {
    for (const [family, cfg] of Object.entries(mapping.colors)) {
      if (cfg?.generation !== 'lch-remap' || !cfg?.anchor?.hex) continue;
      const semanticRemap = {};
      const rawRemap = cfg['semantic-remap'] ?? cfg.semanticRemap ?? {};
      const prefix = `${family}-`;
      for (const [oldFull, newFull] of Object.entries(rawRemap)) {
        if (oldFull.startsWith(prefix) && newFull.startsWith(prefix)) {
          semanticRemap[oldFull.slice(prefix.length)] = newFull.slice(prefix.length);
        }
      }
      const palette = computeFamilyPalette({
        anchor: cfg.anchor.hex,
        recalibrate: cfg['recalibrate-grade'] ?? cfg.recalibrate ?? {},
        addGrades: cfg['add-grades'] ?? cfg.addGrades ?? {},
        semanticRemap
      });
      optionsScss = transformFamilyBlock(optionsScss, family, palette);
    }
  }
  writeFileSync(optionsDst, optionsScss);

  filterComponents({
    dsfrRoot,
    workspaceDsfr,
    removeList: mapping?.components?.remove ?? []
  });

  const overridesAbs = resolve(overridesIndex);

  // The dsfr package ships components/scheme/core; we append our overrides
  // here so they ride the same cascade. Utility (colors, icons, spacing
  // utilities) is a sibling package and doesn't need our overrides — they
  // just consume the same CSS variables, which are already overridden by
  // the dsfr bundle loaded alongside.
  const dsfrEntry = [
    "@import 'main';",
    "@import 'legacy';",
    "@import 'print';",
    `@import '${overridesAbs}';`,
    ''
  ].join('\n');
  // utility/main.scss starts with `@include path.to-dist(1)` (DSFR ships its
  // utility CSS at `dist/utility/utility.css`, so `..` resolves to dist/).
  // We output flat at `dist/utility-ademe.css`, so we need dist = '' instead.
  // path.to-dist uses first-wins (`@if $value == null`), so calling it with 0
  // before importing utility/main.scss neutralises its 1.
  const utilityEntry = [
    "@use 'src/module/path' as ademe-path;",
    "@include ademe-path.to-dist(0);",
    "@import 'main';",
    "@import 'legacy';",
    "@import 'print';",
    ''
  ].join('\n');

  const targets = [
    {
      name: 'dsfr',
      entrySource: dsfrEntry,
      entryUrl: pathToFileURL(join(workspaceDsfr, 'src/dsfr/__ademe-entry.scss')),
      outName: 'dsfr-ademe.css'
    },
    {
      name: 'utility',
      entrySource: utilityEntry,
      entryUrl: pathToFileURL(join(workspaceDsfr, 'src/dsfr/utility/__ademe-entry.scss')),
      outName: 'utility-ademe.css'
    }
  ];

  return {
    targets,
    loadPaths: [workspaceDsfr],
    distDir,
    workspaceDsfr,
    mapping
  };
}
