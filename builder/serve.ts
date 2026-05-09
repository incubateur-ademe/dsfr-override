#!/usr/bin/env node
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import * as esbuild from 'esbuild';

const PROJECT_ROOT = resolve(new URL('..', import.meta.url).pathname);
const PORT = Number(process.env['PORT']) || 8080;
const ROOT_PAGE = '/example/index.html';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico':  'image/x-icon'
};

interface DsfrIcon {
  name: string;
  group: string | null;
}

interface ShadeCombo {
  name: string;
  light: string;
  dark: string;
}

// Cache du bundle builder-ui : esbuild prend ~50 ms à froid mais on évite
// de rebuild à chaque requête en gardant le résultat tant qu'aucun fichier
// source touché n'a un `mtimeMs` plus récent. Le set de fichiers watchés
// est connu : main.ts + les 3 modules `ademe-*` qu'il consomme. Un toucher
// ailleurs (composant tiers, etc.) ne déclenche pas de rebuild — c'est
// volontaire pour un dev fluide ; lance `pnpm build:ui` pour un bundle
// reproductible.
const BUILDER_UI_SOURCES = [
  'builder-ui/main.ts',
  'builder/lch.ts',
  'builder/generate/palette.ts',
  'builder/generate/profile-lch.ts',
  'builder/types.ts'
];
let cachedUIBundle: { code: string; key: string } | null = null;

async function bundleBuilderUI(projectRoot: string): Promise<string> {
  const key = BUILDER_UI_SOURCES
    .map(p => `${p}:${statSync(join(projectRoot, p)).mtimeMs}`)
    .join('|');
  if (cachedUIBundle?.key === key) return cachedUIBundle.code;

  const result = await esbuild.build({
    entryPoints: [join(projectRoot, 'builder-ui/main.ts')],
    bundle: true,
    format: 'esm',
    target: ['es2022'],
    external: ['hljs/core', 'hljs/yaml'],
    alias: {
      'ademe-lch': join(projectRoot, 'builder/lch.ts'),
      'ademe-palette': join(projectRoot, 'builder/generate/palette.ts'),
      'ademe-profile': join(projectRoot, 'builder/generate/profile-lch.ts')
    },
    sourcemap: 'inline',
    write: false,
    logLevel: 'silent'
  });
  const code = result.outputFiles[0]?.text ?? '';
  cachedUIBundle = { code, key };
  return code;
}

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const reqUrl = req.url ?? '/';
  let urlPath = decodeURIComponent(reqUrl.split('?')[0] ?? '/');
  if (urlPath === '/' || urlPath === '') urlPath = ROOT_PAGE;

  // Mode dev : intercepte la requête `builder-ui/main.js` et sert le bundle
  // esbuild de `main.ts`. Le navigateur (qui charge l'importmap) continue à
  // demander un `.js`, donc cette interception est invisible côté HTML.
  if (urlPath === '/builder-ui/main.js') {
    bundleBuilderUI(PROJECT_ROOT)
      .then((code) => {
        res.writeHead(200, {
          'content-type': 'application/javascript; charset=utf-8',
          'cache-control': 'no-store'
        });
        res.end(code);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
        res.end(`esbuild build failed:\n${message}`);
      });
    return;
  }

  // ---------------------------------------------------------------------------
  // APIs Icônes — listing + SVG par nom. Consommées par le builder-ui pour
  // populer les datalists (autocomplete) et les previews `<img>` inline sur
  // chaque ligne d'icône.
  //
  // /__api/icons/dsfr        → JSON [{name, group}, ...]    (~1000 entrées)
  // /__api/icons/lucide      → JSON ["circle-check", ...]   (~1500 entrées)
  // /__api/icons/dsfr/svg/<name>.svg    → SVG DSFR résolu
  // /__api/icons/lucide/svg/<name>.svg  → SVG Lucide résolu
  // ---------------------------------------------------------------------------
  if (urlPath === '/__api/icons/dsfr') {
    const root = join(PROJECT_ROOT, 'dsfr/src/dsfr/core/icon');
    const out: DsfrIcon[] = [];
    if (existsSync(root)) {
      const walk = (dir: string, group: string | null): void => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          if (entry.isDirectory()) walk(join(dir, entry.name), group ?? entry.name);
          else if (entry.name.endsWith('.svg')) out.push({ name: entry.name.slice(0, -4), group });
        }
      };
      walk(root, null);
      out.sort((a, b) => a.name.localeCompare(b.name));
    }
    res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    res.end(JSON.stringify(out));
    return;
  }
  if (urlPath === '/__api/icons/lucide') {
    const root = join(PROJECT_ROOT, 'node_modules/lucide-static/icons');
    const out = existsSync(root)
      ? readdirSync(root).filter(f => f.endsWith('.svg')).map(f => f.slice(0, -4)).sort()
      : [];
    res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    res.end(JSON.stringify(out));
    return;
  }
  const dsfrSvgMatch = urlPath.match(/^\/__api\/icons\/dsfr\/svg\/([a-z0-9-]+(?:--[a-z0-9-]+)*)\.svg$/i);
  if (dsfrSvgMatch) {
    const name = dsfrSvgMatch[1];
    const root = join(PROJECT_ROOT, 'dsfr/src/dsfr/core/icon');
    let found: string | null = null;
    if (existsSync(root)) {
      const walk = (dir: string): void => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          if (found) return;
          if (entry.isDirectory()) walk(join(dir, entry.name));
          else if (entry.name === `${name}.svg`) found = join(dir, entry.name);
        }
      };
      walk(root);
    }
    if (found) {
      res.writeHead(200, { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=300' });
      createReadStream(found).pipe(res);
    } else {
      res.writeHead(404); res.end('Icon not found');
    }
    return;
  }
  const lucideSvgMatch = urlPath.match(/^\/__api\/icons\/lucide\/svg\/([a-z0-9-]+)\.svg$/i);
  if (lucideSvgMatch && lucideSvgMatch[1]) {
    const file = join(PROJECT_ROOT, 'node_modules/lucide-static/icons', `${lucideSvgMatch[1]}.svg`);
    if (existsSync(file)) {
      res.writeHead(200, { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=300' });
      createReadStream(file).pipe(res);
    } else {
      res.writeHead(404); res.end('Icon not found');
    }
    return;
  }

  // Petite API JSON utilisée par le builder-ui pour découvrir les combos de
  // teintes que DSFR émet sous forme `--<family>-<lightGrade>-<darkGrade>`. On
  // en a besoin pour piloter l'aperçu live de toute famille (pas juste les 2
  // primaires qu'on hardcodait avant). Parse `dsfr/src/module/color/variable/_sets.scss`
  // avec un petit regex ad-hoc — DSFR garde ce format stable à travers la 1.x.
  if (urlPath === '/__api/dsfr-shade-combos') {
    const setsFile = join(PROJECT_ROOT, 'dsfr/src/module/color/variable/_sets.scss');
    const out: Record<string, ShadeCombo[]> = {};
    if (existsSync(setsFile)) {
      const text = readFileSync(setsFile, 'utf8');
      // Walk chaque bloc `family-name: (`, puis capture les entrées nested
      // sous forme `semantic: family-leftGrade family-rightGrade,`.
      const familyRe = /^\s{4}([a-z][a-z0-9-]+):\s*\($/gm;
      let m: RegExpExecArray | null;
      while ((m = familyRe.exec(text)) !== null) {
        const family = m[1];
        if (!family || family === 'grey') continue; // DSFR gère grey spécialement
        const blockStart = familyRe.lastIndex;
        const blockEnd = text.indexOf(')', blockStart);
        if (blockEnd < 0) continue;
        const block = text.slice(blockStart, blockEnd);
        const combos: ShadeCombo[] = [];
        const entryRe = new RegExp(`^\\s+[a-z-]+:\\s*${family}-([a-z0-9-]+)\\s+${family}-([a-z0-9-]+),?$`, 'gm');
        let entry: RegExpExecArray | null;
        while ((entry = entryRe.exec(block)) !== null) {
          const light = entry[1];
          const dark = entry[2];
          if (!light || !dark) continue;
          // DSFR collapse `--<family>-<grade>-<grade>` en `--<family>-<grade>`
          // quand light===dark (ex : main-525-main-525 → main-525).
          const name = light === dark ? light : `${light}-${dark}`;
          combos.push({ name, light, dark });
        }
        if (combos.length) (out[family] ??= []).push(...combos);
      }
    }
    res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    res.end(JSON.stringify(out));
    return;
  }

  // Petite API JSON pour populer l'autocomplete fontes côté builder-ui.
  // Renvoie les basenames (sans extension) trouvés sous `assets/fonts/`,
  // dédupliqués par stem et triés.
  if (urlPath === '/__api/fonts') {
    const dir = join(PROJECT_ROOT, 'assets/fonts');
    const stems: string[] = [];
    if (existsSync(dir)) {
      const seen = new Set<string>();
      for (const f of readdirSync(dir)) {
        if (!f.endsWith('.woff2') && !f.endsWith('.woff')) continue;
        const stem = f.replace(/\.(woff2?|woff)$/, '');
        if (!seen.has(stem)) { seen.add(stem); stems.push(stem); }
      }
      stems.sort();
    }
    res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    res.end(JSON.stringify(stems));
    return;
  }

  const safe = normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(PROJECT_ROOT, safe);
  if (!filePath.startsWith(PROJECT_ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  let stat;
  try { stat = statSync(filePath); } catch {
    res.writeHead(404); res.end('Not found'); return;
  }
  if (stat.isDirectory()) {
    res.writeHead(301, { Location: urlPath.replace(/\/?$/, '/') + 'index.html' }); res.end(); return;
  }

  res.writeHead(200, {
    'content-type': MIME[extname(filePath)] ?? 'application/octet-stream',
    'cache-control': 'no-store'
  });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  process.stderr.write(`http://localhost:${PORT}${ROOT_PAGE}\n`);
});
