import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

/**
 * Apply the optional post-process rename (e.g. blue-france → blue-ate, red-marianne → red-laura)
 * across every dist/*.css and dist/*.js file.
 *
 * Steps:
 *  1. (optional) safety-check: every occurrence of the old name must sit in an
 *     expected context — CSS variable, BEM modifier, or JS identifier.
 *     Anything else is suspicious and aborts the rename so we don't silently
 *     mangle prose, urls, or comments.
 *  2. Replace token by token.
 *  3. Sanity check: post-rename, the old name must no longer appear.
 *
 * @param {object} opts
 * @param {string} opts.distDir
 * @param {object | null} opts.mapping
 * @returns {{ enabled: boolean, applied: Array<{ from: string, to: string, files: number, replacements: number }> }}
 */
export function postProcess({ distDir, mapping }) {
  const cfg = mapping?.['post-process']?.rename;
  if (!cfg?.enabled) return { enabled: false, applied: [] };

  const renames = collectRenames(mapping);
  if (renames.length === 0) return { enabled: true, applied: [] };

  const files = readdirSync(distDir)
    .filter(f => ['.css', '.js'].includes(extname(f)))
    .map(f => join(distDir, f));

  if (cfg['safety-check'] !== false) {
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      for (const { from } of renames) {
        const offending = findUnexpectedContexts(content, from);
        if (offending.length > 0) {
          throw new Error(
            `safety-check: '${from}' appears in unexpected context in ${file}:\n` +
            offending.slice(0, 3).map(s => `  ${s}`).join('\n')
          );
        }
      }
    }
  }

  const applied = [];
  for (const { from, to } of renames) {
    let touched = 0, replacements = 0;
    for (const file of files) {
      const before = readFileSync(file, 'utf8');
      const re = new RegExp(escape(from), 'g');
      const matches = before.match(re);
      if (!matches) continue;
      const after = before.replace(re, to);
      writeFileSync(file, after);
      touched++;
      replacements += matches.length;
      if (after.includes(from)) {
        throw new Error(`post-process: '${from}' still present in ${file} after rename — replacement is non-idempotent`);
      }
    }
    applied.push({ from, to, files: touched, replacements });
  }
  return { enabled: true, applied };
}

function collectRenames(mapping) {
  const out = [];
  for (const [family, cfg] of Object.entries(mapping?.colors ?? {})) {
    if (typeof cfg?.rename === 'string' && cfg.rename !== family) {
      out.push({ from: family, to: cfg.rename });
    }
  }
  return out;
}

/**
 * Walk every occurrence of `name` in `content`; an occurrence is suspect only
 * if the surrounding token is exactly `name` (i.e. nothing on either side that
 * would tie it to an identifier like --blue-france-625 or fr-btn--blue-france).
 * That filters comments, prose, and stray strings without flagging the very
 * dense legitimate use sites.
 */
function findUnexpectedContexts(content, name) {
  const out = [];
  let idx = 0;
  while ((idx = content.indexOf(name, idx)) !== -1) {
    const left = idx > 0 ? content[idx - 1] : '';
    const right = content[idx + name.length] ?? '';
    const isStandalone = !/[a-zA-Z0-9_-]/.test(left) && !/[a-zA-Z0-9_-]/.test(right);
    if (isStandalone) {
      const start = Math.max(0, idx - 30);
      const end = Math.min(content.length, idx + name.length + 30);
      out.push(content.slice(start, end).replace(/\n/g, ' '));
    }
    idx += name.length;
  }
  return out;
}

function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
