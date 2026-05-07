import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const FLAVORS = ['main', 'legacy', 'print'];

/**
 * Strip `@import 'X/<flavor>';` lines for excluded components from
 * <workspace>/src/dsfr/component/{main,legacy,print}.scss.
 *
 * Always copies the upstream file from dsfr/ first, so the patch is idempotent
 * and the workspace doesn't carry residue from a previous build with a different
 * `components.remove` list.
 *
 * For DSFR v1.14.4, no top-level component declares header/footer in its
 * `style:` block (only `example.style:`, which we don't compile), so removing
 * the @import is sufficient — no further .package.yml patching needed.
 *
 * @param {object} args
 * @param {string} args.dsfrRoot       Pristine submodule path (read source of truth)
 * @param {string} args.workspaceDsfr  Workspace path (write target)
 * @param {string[]} args.removeList   Component names from mapping.yml `components.remove`
 */
export function filterComponents({ dsfrRoot, workspaceDsfr, removeList }) {
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

function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
