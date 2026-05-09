import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { generateFontFaceScss } from './font-face.js';
import { generateShadowsScss } from './shadows.js';
import { generateRadiusScss } from './radius.js';
import { applyIconMapping, generateIconAddsScss } from './icons.js';
import type { GenerateOverridesResult, IconMappingResult, Mapping } from '../types.js';

interface GenerateOverridesArgs {
  projectRoot: string;
  mapping: Mapping | null;
  distDir: string;
}

/**
 * Matérialise tous les overrides SCSS sous `<projectRoot>/overrides/` depuis le
 * mapping parsé et copie les fichiers de fontes référencés par `typography`
 * dans `dist/`.
 *
 * Écrit `_font-face.scss`, `_shadows.scss`, `_radius.scss` + un `_index.scss`
 * qui les importe dans l'ordre. Les sections vides produisent des fichiers
 * vides (et aucun `@import` correspondant).
 *
 * @throws si une entrée `manual-overrides` pointe vers un fichier introuvable.
 */
export function generateOverrides({ projectRoot, mapping, distDir }: GenerateOverridesArgs): GenerateOverridesResult {
  const overridesDir = join(projectRoot, 'overrides');
  if (!existsSync(overridesDir)) mkdirSync(overridesDir, { recursive: true });

  // Icônes : rsync DSFR → dist/icons/, puis applique overrides Lucide + adds.
  // Doit tourner avant les sections SCSS, car `addEntries` nourrit `_icons.scss`.
  const iconResult: IconMappingResult = mapping
    ? applyIconMapping({ projectRoot, mapping, distDir })
    : { overridesApplied: 0, addsApplied: 0, addEntries: [] };

  const written: string[] = [];
  const sections = [
    { file: '_font-face.scss', content: mapping ? generateFontFaceScss(mapping.typography) : '' },
    { file: '_shadows.scss',   content: mapping ? generateShadowsScss(mapping.elevation)   : '' },
    { file: '_radius.scss',    content: mapping ? generateRadiusScss(mapping['border-radius']) : '' },
    { file: '_icons.scss',     content: generateIconAddsScss(iconResult.addEntries) }
  ];

  const indexImports: string[] = [];
  for (const { file, content } of sections) {
    const path = join(overridesDir, file);
    writeFileSync(path, content);
    written.push(path);
    if (content.trim().length > 0) indexImports.push(file.replace(/^_/, '').replace(/\.scss$/, ''));
  }

  // Manual overrides : fichiers curatés par l'utilisateur (chemin absolu ou
  // relatif au projet). On ne les recopie pas — on les `@import` en chemin
  // absolu pour que les édits prennent effet au build suivant sans plomberie.
  const manualImports: string[] = [];
  for (const path of mapping?.['manual-overrides'] ?? []) {
    const abs = resolve(projectRoot, path);
    if (!existsSync(abs)) {
      throw new Error(`manual-overrides: file not found: ${path} (resolved to ${abs})`);
    }
    manualImports.push(abs);
  }

  const indexPath = join(overridesDir, '_index.scss');
  const lines: string[] = [];
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

interface CopyDsfrJsArgs {
  projectRoot: string;
  distDir: string;
}

/**
 * Copie les bundles JS DSFR upstream (module + nomodule) dans `dist/`. Sans
 * eux, les composants interactifs (modal, accordion, toggle, banner de consentement…)
 * restent statiques. On tire depuis `@gouvfr/dsfr` parce que le submodule ne
 * ship que les sources — épingler la version du package dans `package.json`
 * miroir du tag du submodule.
 */
function copyDsfrJs({ projectRoot, distDir }: CopyDsfrJsArgs): number {
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

interface CopyFontsArgs {
  projectRoot: string;
  mapping: Mapping | null;
  distDir: string;
}

function copyFonts({ projectRoot, mapping, distDir }: CopyFontsArgs): number {
  const distFonts = join(distDir, 'fonts');
  let count = 0;

  // Primary : fichiers de fontes fournis par l'utilisateur sous `typography.primary.files-source`.
  const primary = mapping?.typography?.primary;
  if (primary?.['files-source'] && primary?.weights) {
    const sourceDir = resolve(projectRoot, primary['files-source']);
    if (existsSync(sourceDir)) {
      if (!existsSync(distFonts)) mkdirSync(distFonts, { recursive: true });
      for (const variants of Object.values(primary.weights)) {
        for (const fileBase of Object.values(variants)) {
          if (!fileBase) continue;
          for (const ext of ['woff2', 'woff']) {
            const src = join(sourceDir, `${fileBase}.${ext}`);
            const dst = join(distFonts, `${fileBase}.${ext}`);
            if (existsSync(src)) { cpSync(src, dst); count++; }
          }
        }
      }
    }
  }
  // Alt : quand "keep", on laisse les `@font-face` DSFR intacts et on transporte
  // juste les fichiers upstream depuis le submodule dans `dist/fonts/`, pour que
  // Spectral (ou ce que DSFR ship comme alt) charge au lieu de 404.
  // Marianne est filtrée — la licence l'exclut du périmètre légal du fork.
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
