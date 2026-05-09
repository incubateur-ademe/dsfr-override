#!/usr/bin/env node
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const PROJECT_ROOT = resolve(new URL('..', import.meta.url).pathname);
const PORT = Number(process.env.PORT) || 8080;
const ROOT_PAGE = '/example/index.html';

const MIME = {
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

const server = createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/' || urlPath === '') urlPath = ROOT_PAGE;

  // ---------------------------------------------------------------------------
  // Icons APIs — listing + per-name SVG. Used by the builder-ui to populate
  // datalists (autocomplete) and inline <img> previews on each icon row.
  //
  // /__api/icons/dsfr        → JSON [{name, group}, ...]    (~1000 entries)
  // /__api/icons/lucide      → JSON ["circle-check", ...]   (~1500 entries)
  // /__api/icons/dsfr/svg/<name>.svg    → resolved DSFR SVG
  // /__api/icons/lucide/svg/<name>.svg  → resolved Lucide SVG
  // ---------------------------------------------------------------------------
  if (urlPath === '/__api/icons/dsfr') {
    const root = join(PROJECT_ROOT, 'dsfr/src/dsfr/core/icon');
    const out = [];
    if (existsSync(root)) {
      const walk = (dir, group) => {
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
    let found = null;
    if (existsSync(root)) {
      const walk = (dir) => {
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
  if (lucideSvgMatch) {
    const file = join(PROJECT_ROOT, 'node_modules/lucide-static/icons', `${lucideSvgMatch[1]}.svg`);
    if (existsSync(file)) {
      res.writeHead(200, { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=300' });
      createReadStream(file).pipe(res);
    } else {
      res.writeHead(404); res.end('Icon not found');
    }
    return;
  }

  // Tiny JSON API used by the builder-ui to discover the shade combos that
  // DSFR emits as `--<family>-<lightGrade>-<darkGrade>` vars. We need them to
  // override the live preview for any family (not just the 2 primaries we
  // used to hardcode). Parses dsfr/src/module/color/variable/_sets.scss with
  // a small ad-hoc regex — DSFR has kept this format stable across 1.x.
  if (urlPath === '/__api/dsfr-shade-combos') {
    const setsFile = join(PROJECT_ROOT, 'dsfr/src/module/color/variable/_sets.scss');
    const out = {};
    if (existsSync(setsFile)) {
      const text = readFileSync(setsFile, 'utf8');
      // Walk each `family-name: (` block, then capture nested entries of
      // shape `semantic: family-leftGrade family-rightGrade,`.
      const familyRe = /^\s{4}([a-z][a-z0-9-]+):\s*\($/gm;
      let m;
      while ((m = familyRe.exec(text)) !== null) {
        const family = m[1];
        if (family === 'grey') continue; // DSFR handles grey specially
        const blockStart = familyRe.lastIndex;
        const blockEnd = text.indexOf(')', blockStart);
        if (blockEnd < 0) continue;
        const block = text.slice(blockStart, blockEnd);
        const combos = [];
        const entryRe = new RegExp(`^\\s+[a-z-]+:\\s*${family}-([a-z0-9-]+)\\s+${family}-([a-z0-9-]+),?$`, 'gm');
        let entry;
        while ((entry = entryRe.exec(block)) !== null) {
          const [, light, dark] = entry;
          // DSFR collapses --<family>-<grade>-<grade> when light===dark to
          // just --<family>-<grade> (e.g. main-525-main-525 → main-525).
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

  // Tiny JSON API used by the builder-ui to populate font autocompletes.
  // Returns the list of font basenames (without extension) under
  // assets/fonts/ — only .woff2 unique stems, sorted.
  if (urlPath === '/__api/fonts') {
    const dir = join(PROJECT_ROOT, 'assets/fonts');
    let stems = [];
    if (existsSync(dir)) {
      const seen = new Set();
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
