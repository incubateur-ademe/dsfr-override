/**
 * Assemble `_site/` — bundle prod déployable du builder, identique à
 * l'expérience dev, en statique pur.
 *
 * Contenu produit :
 *
 *   _site/
 *   ├── .nojekyll                  (désactive le pipeline Jekyll de GitHub Pages)
 *   ├── index.html                 (redirection racine → /builder-ui/)
 *   ├── builder-ui/                (bundle esbuild + index.html + style.css + gallery.html)
 *   ├── example/                   (page témoin — chargée en iframe)
 *   ├── dist/                      (CSS dérivé + fonts + JS DSFR vendor + icônes)
 *   └── __api/                     (snapshots statiques des endpoints du dev server)
 *       ├── icons/dsfr.json        (listing — 1036 entrées)
 *       ├── icons/lucide.json      (listing — 1952 entrées)
 *       ├── icons/dsfr/*.svg       (copies plates depuis dsfr/.../core/icon/<group>/)
 *       ├── icons/lucide/*.svg     (copies depuis node_modules/lucide-static/icons/)
 *       ├── dsfr-shade-combos.json (parsé depuis _sets.scss)
 *       └── fonts.json             (listing — stems des assets/fonts/)
 *
 * Le suffixe `.json` sur les listings évite la collision avec les dossiers
 * homonymes qui hébergent les SVG (cas `icons/dsfr.json` vs `icons/dsfr/`).
 *
 * Le builder-ui consomme ces ressources via des paths relatifs `../__api/...`
 * depuis `/builder-ui/index.html`, ce qui marche en dev (serveur sert tout
 * depuis `/`) ET en prod (Pages sert depuis `/<repo>/`).
 */
import { copyFile, cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = resolve(ROOT, '_site');

await rm(SITE, { recursive: true, force: true });
await mkdir(SITE, { recursive: true });
await writeFile(join(SITE, '.nojekyll'), '');

// --- 1. Bundle builder-ui (équivalent à `pnpm build:ui`) -------------------

const UI_OUT = join(SITE, 'builder-ui');
await mkdir(UI_OUT, { recursive: true });
await build({
  entryPoints: [resolve(ROOT, 'builder-ui/main.ts')],
  bundle: true,
  format: 'esm',
  target: ['es2022'],
  outfile: join(UI_OUT, 'main.js'),
  external: ['hljs/core', 'hljs/yaml'],
  alias: {
    'ademe-lch': resolve(ROOT, 'builder/lch.ts'),
    'ademe-palette': resolve(ROOT, 'builder/generate/palette.ts'),
    'ademe-profile': resolve(ROOT, 'builder/generate/profile-lch.ts')
  },
  sourcemap: 'linked',
  logLevel: 'info'
});

// L'`<importmap>` du index.html dev cite yaml + ademe-* qu'on inline ici via
// esbuild ; on remplace par une importmap réduite aux deux modules CDN.
const indexHtml = await readFile(resolve(ROOT, 'builder-ui/index.html'), 'utf8');
const prodImportmap = `<script type="importmap">
    {
      "imports": {
        "hljs/core": "https://esm.sh/highlight.js@11.11.1/lib/core",
        "hljs/yaml": "https://esm.sh/highlight.js@11.11.1/lib/languages/yaml"
      }
    }
  </script>`;
await writeFile(
  join(UI_OUT, 'index.html'),
  indexHtml.replace(/<script type="importmap">[\s\S]*?<\/script>/, prodImportmap)
);
await copyFile(resolve(ROOT, 'builder-ui/gallery.html'), join(UI_OUT, 'gallery.html'));
await copyFile(resolve(ROOT, 'builder-ui/style.css'), join(UI_OUT, 'style.css'));

// --- 2. Page témoin et CSS dérivé (pris de `dist/`) ------------------------

await cp(resolve(ROOT, 'example'), join(SITE, 'example'), { recursive: true });

if (!existsSync(resolve(ROOT, 'dist'))) {
  throw new Error('build-pages: `dist/` absent — run `pnpm build` first.');
}
await cp(resolve(ROOT, 'dist'), join(SITE, 'dist'), { recursive: true });

// --- 3. Snapshots API : équivalent statique de serve.ts -------------------

const API = join(SITE, '__api');
// Important : créer d'abord les dossiers `icons/dsfr/` et `icons/lucide/`
// (ils contiendront les SVG), puis écrire les listings `icons/dsfr.json` et
// `icons/lucide.json` à côté. L'ordre fichier-puis-dossier produirait une
// erreur EISDIR si on tentait l'inverse.
await mkdir(join(API, 'icons/dsfr'), { recursive: true });
await mkdir(join(API, 'icons/lucide'), { recursive: true });

// 3a. icons/dsfr — listing + copie plate des SVG (depuis tous les <group>/)
const dsfrIconRoot = resolve(ROOT, 'dsfr/src/dsfr/core/icon');
interface DsfrIcon { name: string; group: string | null }
const dsfrIcons: DsfrIcon[] = [];
function walkDsfrIcons(dir: string, group: string | null): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) walkDsfrIcons(join(dir, entry.name), group ?? entry.name);
    else if (entry.name.endsWith('.svg')) dsfrIcons.push({ name: entry.name.slice(0, -4), group });
  }
}
if (existsSync(dsfrIconRoot)) walkDsfrIcons(dsfrIconRoot, null);
dsfrIcons.sort((a, b) => a.name.localeCompare(b.name));
await writeFile(join(API, 'icons/dsfr.json'), JSON.stringify(dsfrIcons));

// Copie plate : on perd la sous-arbo `<group>/` parce que serve.ts résout
// par nom (pas par groupe), donc le client ne connaît pas le groupe.
async function flatCopySvgs(rootDir: string, destDir: string): Promise<number> {
  let count = 0;
  async function walk(dir: string): Promise<void> {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name.endsWith('.svg')) {
        await copyFile(full, join(destDir, entry.name));
        count++;
      }
    }
  }
  if (existsSync(rootDir)) await walk(rootDir);
  return count;
}
const dsfrSvgCount = await flatCopySvgs(dsfrIconRoot, join(API, 'icons/dsfr'));

// 3b. icons/lucide — listing + copie depuis lucide-static
const lucideRoot = resolve(ROOT, 'node_modules/lucide-static/icons');
const lucideNames = existsSync(lucideRoot)
  ? readdirSync(lucideRoot).filter(f => f.endsWith('.svg')).map(f => f.slice(0, -4)).sort()
  : [];
await writeFile(join(API, 'icons/lucide.json'), JSON.stringify(lucideNames));

let lucideCount = 0;
for (const name of lucideNames) {
  await copyFile(join(lucideRoot, `${name}.svg`), join(API, 'icons/lucide', `${name}.svg`));
  lucideCount++;
}

// 3c. dsfr-shade-combos — parsé depuis _sets.scss (cf. serve.ts)
const setsFile = resolve(ROOT, 'dsfr/src/module/color/variable/_sets.scss');
interface ShadeCombo { name: string; light: string; dark: string }
const combosByFamily: Record<string, ShadeCombo[]> = {};
if (existsSync(setsFile)) {
  const text = readFileSync(setsFile, 'utf8');
  const familyRe = /^\s{4}([a-z][a-z0-9-]+):\s*\($/gm;
  for (const m of text.matchAll(familyRe)) {
    const family = m[1];
    if (!family || family === 'grey') continue;
    const blockStart = (m.index ?? 0) + m[0].length;
    const blockEnd = text.indexOf(')', blockStart);
    if (blockEnd < 0) continue;
    const block = text.slice(blockStart, blockEnd);
    const combos: ShadeCombo[] = [];
    const entryRe = new RegExp(`^\\s+[a-z-]+:\\s*${family}-([a-z0-9-]+)\\s+${family}-([a-z0-9-]+),?$`, 'gm');
    for (const entry of block.matchAll(entryRe)) {
      const light = entry[1], dark = entry[2];
      if (!light || !dark) continue;
      combos.push({ name: light === dark ? light : `${light}-${dark}`, light, dark });
    }
    if (combos.length) (combosByFamily[family] ??= []).push(...combos);
  }
}
await writeFile(join(API, 'dsfr-shade-combos.json'), JSON.stringify(combosByFamily));

// 3d. fonts — listing des stems unique de assets/fonts/
const fontsDir = resolve(ROOT, 'assets/fonts');
const fontStems: string[] = [];
if (existsSync(fontsDir)) {
  const seen = new Set<string>();
  for (const f of readdirSync(fontsDir)) {
    if (!f.endsWith('.woff2') && !f.endsWith('.woff')) continue;
    const stem = f.replace(/\.(woff2?|woff)$/, '');
    if (!seen.has(stem)) { seen.add(stem); fontStems.push(stem); }
  }
  fontStems.sort();
}
await writeFile(join(API, 'fonts.json'), JSON.stringify(fontStems));

// --- 4. Redirection racine → /builder-ui/ ---------------------------------

await writeFile(join(SITE, 'index.html'), `<!DOCTYPE html>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=./builder-ui/">
<title>dsfr-override builder UI</title>
<link rel="canonical" href="./builder-ui/">
<p>Redirection vers <a href="./builder-ui/">le builder UI</a>.</p>
`);

const sumStat = (label: string, n: number): string => `${label.padEnd(22)} ${String(n).padStart(5)}`;
process.stdout.write(`✓ _site/ prêt
  ${sumStat('DSFR icons SVG', dsfrSvgCount)}
  ${sumStat('Lucide icons SVG', lucideCount)}
  ${sumStat('DSFR icons listed', dsfrIcons.length)}
  ${sumStat('shade-combos families', Object.keys(combosByFamily).length)}
  ${sumStat('font stems', fontStems.length)}
`);
