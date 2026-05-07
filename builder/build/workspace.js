import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

/**
 * Materialize a writable copy of dsfr/ inside .tmp/workspace/dsfr/.
 *
 * Why a full copy and not symlinks: sass resolves @use's like `@use 'options'`
 * (relative to the source file's *canonical* URL) by walking symlinks first,
 * so any symlinked file would route back to the real submodule and bypass
 * our overrides. Importers don't intercept those relative loads either.
 * A physical copy is the only way to make our _options.scss "win" inside
 * its own directory.
 *
 * Cache: keyed on the submodule's git HEAD. Subsequent builds with no upstream
 * change skip the copy entirely (cost ≈ 1 stat).
 *
 * @param {string} projectRoot
 * @param {string} dsfrRoot
 * @returns {{ workspaceDsfr: string, refreshed: boolean }}
 */
export function ensureWorkspace(projectRoot, dsfrRoot) {
  const workspaceRoot = join(projectRoot, '.tmp', 'workspace');
  const workspaceDsfr = join(workspaceRoot, 'dsfr');
  const headFile = join(workspaceRoot, '.dsfr-head');

  const currentHead = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: dsfrRoot,
    encoding: 'utf8'
  }).trim();

  const cachedHead = existsSync(headFile) ? readFileSync(headFile, 'utf8') : '';
  if (cachedHead === currentHead && existsSync(workspaceDsfr)) {
    return { workspaceDsfr, refreshed: false };
  }

  if (existsSync(workspaceDsfr)) rmSync(workspaceDsfr, { recursive: true, force: true });
  mkdirSync(workspaceRoot, { recursive: true });
  cpSync(dsfrRoot, workspaceDsfr, { recursive: true, dereference: false });
  writeFileSync(headFile, currentHead);

  return { workspaceDsfr, refreshed: true };
}
