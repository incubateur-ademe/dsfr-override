import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { generateFontFaceScss } from './font-face.js';
import { generateShadowsScss } from './shadows.js';
import { generateRadiusScss } from './radius.js';
import { applyIconMapping, generateIconAddsScss } from './icons.js';

/**
 * Materialize all SCSS overrides under <projectRoot>/overrides/ from a parsed
 * mapping, plus copy font files referenced by the typography section into dist/.
 *
 * Writes _font-face.scss, _shadows.scss, _radius.scss + the _index.scss that
 * imports them in order. Empty sections produce empty files (no @import emitted).
 *
 * @param {object} args
 * @param {string} args.projectRoot
 * @param {object | null} args.mapping
 * @param {string} args.distDir
 * @returns {{ overridesIndex: string, written: string[], fontsCopied: number }}
 */
export function generateOverrides({ projectRoot, mapping, distDir }) {
  const overridesDir = join(projectRoot, 'overrides');
  if (!existsSync(overridesDir)) mkdirSync(overridesDir, { recursive: true });

  // Icons: rsync DSFR icons → dist/icons/, apply Lucide overrides + adds.
  // Done before the SCSS sections because addEntries feeds _icons.scss.
  const iconResult = mapping
    ? applyIconMapping({ projectRoot, mapping, distDir })
    : { overridesApplied: 0, addsApplied: 0, addEntries: [] };

  const written = [];
  const sections = [
    { file: '_font-face.scss', content: mapping ? generateFontFaceScss(mapping.typography) : '' },
    { file: '_shadows.scss',   content: mapping ? generateShadowsScss(mapping.elevation)   : '' },
    { file: '_radius.scss',    content: mapping ? generateRadiusScss(mapping['border-radius']) : '' },
    { file: '_icons.scss',     content: generateIconAddsScss(iconResult.addEntries) }
  ];

  const indexImports = [];
  for (const { file, content } of sections) {
    const path = join(overridesDir, file);
    writeFileSync(path, content);
    written.push(path);
    if (content.trim().length > 0) indexImports.push(file.replace(/^_/, '').replace(/\.scss$/, ''));
  }

  // Manual overrides: user-curated files referenced by absolute or project-relative path.
  // We don't copy them — we just import them via absolute path so edits take effect
  // on the next build with no extra plumbing.
  const manualImports = [];
  for (const path of mapping?.['manual-overrides'] ?? []) {
    const abs = resolve(projectRoot, path);
    if (!existsSync(abs)) {
      throw new Error(`manual-overrides: file not found: ${path} (resolved to ${abs})`);
    }
    manualImports.push(abs);
  }

  const indexPath = join(overridesDir, '_index.scss');
  const lines = [];
  for (const name of indexImports) lines.push(`@import '${name}';`);
  for (const abs of manualImports) lines.push(`@import '${abs}';`);
  const indexBody = lines.length === 0 ? '// no overrides generated\n' : lines.join('\n') + '\n';
  writeFileSync(indexPath, indexBody);
  written.push(indexPath);

  const fontsCopied = copyFonts({ projectRoot, mapping, distDir });
  const jsCopied = copyDsfrJs({ projectRoot, distDir });

  return {
    overridesIndex: indexPath,
    written,
    fontsCopied,
    jsCopied,
    iconsCopied: iconResult
  };
}

/**
 * Copy the upstream DSFR JS bundles (module + nomodule) into dist/. Without
 * the JS, interactive components (modal, accordion, toggle, consent banner…)
 * stay static. We pull from @gouvfr/dsfr because the submodule itself ships
 * sources only — pinning the package version in package.json mirrors the
 * submodule's pinned tag.
 */
function copyDsfrJs({ projectRoot, distDir }) {
  const src = join(projectRoot, 'node_modules/@gouvfr/dsfr/dist/dsfr');
  if (!existsSync(src)) return 0;
  if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });
  let count = 0;
  for (const f of ['dsfr.module.min.js', 'dsfr.nomodule.min.js']) {
    const s = join(src, f);
    if (existsSync(s)) { cpSync(s, join(distDir, f)); count++; }
  }
  return count;
}

function copyFonts({ projectRoot, mapping, distDir }) {
  const distFonts = join(distDir, 'fonts');
  let count = 0;

  // Primary: user-supplied font files at typography.primary.files-source.
  const primary = mapping?.typography?.primary;
  if (primary?.['files-source'] && primary?.weights) {
    const sourceDir = resolve(projectRoot, primary['files-source']);
    if (existsSync(sourceDir)) {
      if (!existsSync(distFonts)) mkdirSync(distFonts, { recursive: true });
      for (const variants of Object.values(primary.weights)) {
        for (const fileBase of Object.values(variants)) {
          for (const ext of ['woff2', 'woff']) {
            const src = join(sourceDir, `${fileBase}.${ext}`);
            const dst = join(distFonts, `${fileBase}.${ext}`);
            if (existsSync(src)) { cpSync(src, dst); count++; }
          }
        }
      }
    }
  }
  // Alt: when "keep", we leave DSFR's @font-face declarations intact and just
  // ferry the upstream files from the submodule into dist/fonts/, so Spectral
  // (or whatever DSFR ships as alt) actually loads instead of 404'ing.
  if (mapping?.typography?.alt === 'keep') {
    const dsfrFonts = join(projectRoot, 'dsfr/src/dsfr/core/asset/fonts');
    if (existsSync(dsfrFonts)) {
      if (!existsSync(distFonts)) mkdirSync(distFonts, { recursive: true });
      for (const f of readdirSync(dsfrFonts)) {
        if (f.startsWith('Marianne')) continue;
        const src = join(dsfrFonts, f);
        const dst = join(distFonts, f);
        if (existsSync(src)) { cpSync(src, dst); count++; }
      }
    }
  }
  return count;
}
