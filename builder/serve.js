#!/usr/bin/env node
import { createReadStream, statSync } from 'node:fs';
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
