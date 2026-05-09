import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const FLAVORS = ['main', 'legacy', 'print'];

interface FilterComponentsArgs {
  dsfrRoot: string;
  workspaceDsfr: string;
  removeList: string[];
}

/**
 * Strip les lignes `@import 'X/<flavor>';` des composants exclus dans
 * `<workspace>/src/dsfr/component/{main,legacy,print}.scss`.
 *
 * Recopie systématiquement le fichier upstream avant le strip — le patch reste
 * idempotent et le workspace ne traîne pas le résidu d'un build précédent avec
 * une autre liste `components.remove`.
 *
 * Pour DSFR v1.14.4, aucun composant top-level ne déclare header/footer dans
 * son bloc `style:` (uniquement `example.style:`, qu'on ne compile pas), donc
 * supprimer le `@import` suffit — pas besoin de patcher `.package.yml`.
 */
export function filterComponents({ dsfrRoot, workspaceDsfr, removeList }: FilterComponentsArgs): void {
  for (const flavor of FLAVORS) {
    const src = join(dsfrRoot, 'src/dsfr/component', `${flavor}.scss`);
    const dst = join(workspaceDsfr, 'src/dsfr/component', `${flavor}.scss`);
    if (!existsSync(src)) continue;

    if (!removeList || removeList.length === 0) {
      cpSync(src, dst);
      continue;
    }

    let content = readFileSync(src, 'utf8');
    for (const name of removeList) {
      const re = new RegExp(`^@import '${escape(name)}/${flavor}';\\n?`, 'gm');
      content = content.replace(re, '');
    }
    writeFileSync(dst, content);
  }
}

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
