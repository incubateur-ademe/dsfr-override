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
import type { Mapping, PrepareInput, PrepareOpts } from '../types.js';

/**
 * Construit les inputs de la compilation Sass : matérialise une copie writable
 * de `dsfr/` (pour que notre `_options.scss` modifié gagne au moment des
 * imports relatifs), puis compose une entrée SCSS par package DSFR à shipper.
 * Aujourd'hui : `dsfr` (components / scheme / core) et `utility` (background-,
 * text-, border-, fr-tag--blue-france…).
 *
 * @throws si le submodule DSFR n'est pas initialisé.
 */
export function prepare(opts: PrepareOpts): PrepareInput {
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
  // Seed aussi `.config/` dans le submodule — les stories storybook vivent dans
  // `dsfr/src/dsfr/**/*.stories.js` et résolvent leurs refs `@config`
  // relativement. `.config/` est dans le `.gitignore` du submodule, donc
  // `git status dsfr/` reste propre.
  generateDsfrConfig(dsfrRoot);

  if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

  const mapping: Mapping | null = opts.mapping !== undefined
    ? opts.mapping
    : (existsSync(mappingPath)
      ? (parseYaml(readFileSync(mappingPath, 'utf8')) as Mapping | null)
      : null);

  generateOverrides({ projectRoot, mapping, distDir });

  // Toujours partir du submodule pristine, sinon le workspace accumule des
  // mutations stale d'un build à l'autre (palette précédente injectée…).
  const optionsSrc = join(dsfrRoot, 'src/module/color/variable/_options.scss');
  const optionsDst = join(workspaceDsfr, 'src/module/color/variable/_options.scss');
  let optionsScss = readFileSync(optionsSrc, 'utf8');
  if (mapping?.colors) {
    for (const [family, cfg] of Object.entries(mapping.colors)) {
      if (cfg?.generation !== 'lch-remap' || !cfg?.anchor?.hex) continue;
      const semanticRemap: Record<string, string> = {};
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

  // Le package `dsfr` ship components/scheme/core ; on y ajoute nos overrides
  // pour qu'ils tiennent dans la même cascade. `utility` (colors, icons,
  // spacing) est un package sibling qui n'a pas besoin de nos overrides — il
  // consomme les mêmes variables CSS, déjà patchées par le bundle `dsfr`
  // chargé à côté.
  const dsfrEntry = [
    "@import 'main';",
    "@import 'legacy';",
    "@import 'print';",
    `@import '${overridesAbs}';`,
    ''
  ].join('\n');
  // `utility/main.scss` commence par `@include path.to-dist(1)` (DSFR ship son
  // CSS utility à `dist/utility/utility.css`, donc `..` résout à `dist/`).
  // Nous on output à plat sous `dist/utility-ademe.css`, donc il faut dist = ''.
  // `path.to-dist` est first-wins (`@if $value == null`) : on l'appelle avec 0
  // avant d'importer `utility/main.scss` pour neutraliser son `1`.
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
