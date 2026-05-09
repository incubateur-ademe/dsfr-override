import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import type { Mapping } from '../types.js';

interface PostProcessArgs {
  distDir: string;
  mapping: Mapping | null;
}

interface AppliedRename {
  from: string;
  to: string;
  files: number;
  replacements: number;
}

interface PostProcessResult {
  enabled: boolean;
  applied: AppliedRename[];
}

/**
 * Applique le rename post-process optionnel (ex : `blue-france` → `blue-ate`,
 * `red-marianne` → `red-laura`) sur tous les `dist/*.css` et `dist/*.js`.
 *
 * Pipeline en trois temps :
 *  1. (optionnel) safety-check : chaque occurrence de l'ancien nom doit s'asseoir
 *     dans un contexte attendu (variable CSS, BEM modifier, identifiant JS).
 *     Tout le reste est suspect et abort, sinon on mangle silencieusement de la
 *     prose, des URLs ou des commentaires.
 *  2. Remplacement token par token.
 *  3. Sanity check : après rename, l'ancien nom ne doit plus apparaître.
 *
 * @throws si le safety-check trouve une occurrence isolée, ou si une passe de
 *   remplacement laisse l'ancien nom (substitution non idempotente).
 */
export function postProcess({ distDir, mapping }: PostProcessArgs): PostProcessResult {
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

  const applied: AppliedRename[] = [];
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

function collectRenames(mapping: Mapping | null): Array<{ from: string; to: string }> {
  const out: Array<{ from: string; to: string }> = [];
  for (const [family, cfg] of Object.entries(mapping?.colors ?? {})) {
    if (typeof cfg?.rename === 'string' && cfg.rename !== family) {
      out.push({ from: family, to: cfg.rename });
    }
  }
  return out;
}

// Une occurrence est suspecte uniquement si le token est exactement `name`
// — rien à droite ni à gauche qui l'attache à un identifiant comme
// `--blue-france-625` ou `fr-btn--blue-france`. Ça filtre commentaires, prose
// et strings parasites sans flagger les sites d'usage légitimes (très denses).
function findUnexpectedContexts(content: string, name: string): string[] {
  const out: string[] = [];
  let idx = 0;
  while ((idx = content.indexOf(name, idx)) !== -1) {
    const left = idx > 0 ? content[idx - 1] ?? '' : '';
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

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
