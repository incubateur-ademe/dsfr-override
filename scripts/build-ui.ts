/**
 * Build du bundle prod de `builder-ui/` vers `builder-ui/dist/`.
 *
 * Le mode dev sert `main.ts` à la volée via esbuild dans `serve.ts` —
 * ici on produit un dossier statique déployable (3 fichiers : `main.js`
 * bundlé, `index.html`, `style.css`, `gallery.html`).
 *
 * - `yaml` est inliné dans `main.js` (devient un seul ESM auto-suffisant).
 * - `hljs/core` et `hljs/yaml` restent externes (CDN esm.sh) ; le bundle
 *   ne tire pas la lib complète, on garde le coût initial bas.
 * - L'`<importmap>` initial est remplacé par un import minimaliste qui
 *   ne contient plus que les deux mappings CDN ; tout le reste est bundlé.
 */
import { build } from 'esbuild';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'builder-ui');
const OUT = resolve(SRC, 'dist');

await mkdir(OUT, { recursive: true });

await build({
  entryPoints: [resolve(SRC, 'main.ts')],
  bundle: true,
  format: 'esm',
  target: ['es2022'],
  outfile: resolve(OUT, 'main.js'),
  external: ['hljs/core', 'hljs/yaml'],
  alias: {
    'ademe-lch': resolve(ROOT, 'builder/lch.ts'),
    'ademe-palette': resolve(ROOT, 'builder/generate/palette.ts'),
    'ademe-profile': resolve(ROOT, 'builder/generate/profile-lch.ts')
  },
  sourcemap: 'linked',
  logLevel: 'info'
});

// Copie statique des assets HTML/CSS, en réécrivant l'importmap d'index.html
// pour ne garder que les CDN externes (le reste est bundlé dans main.js).
const indexHtml = await readFile(resolve(SRC, 'index.html'), 'utf8');
const prodImportmap = `<script type="importmap">
    {
      "imports": {
        "hljs/core": "https://esm.sh/highlight.js@11.11.1/lib/core",
        "hljs/yaml": "https://esm.sh/highlight.js@11.11.1/lib/languages/yaml"
      }
    }
  </script>`;
const indexProd = indexHtml
  .replace(/<script type="importmap">[\s\S]*?<\/script>/, prodImportmap)
  .replace(/src="\.\/main\.js"/, 'src="./main.js"');
await writeFile(resolve(OUT, 'index.html'), indexProd);

await copyFile(resolve(SRC, 'gallery.html'), resolve(OUT, 'gallery.html'));
await copyFile(resolve(SRC, 'style.css'), resolve(OUT, 'style.css'));

process.stdout.write(`✓ builder-ui/dist/ prêt (main.js + index.html + style.css + gallery.html)\n`);
