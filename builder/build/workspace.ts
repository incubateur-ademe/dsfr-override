import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

/**
 * Matérialise une copie writable de `dsfr/` sous `.tmp/workspace/dsfr/`.
 *
 * Pourquoi une copie complète et pas des symlinks : sass résout les `@use`
 * comme `@use 'options'` relativement à l'URL *canonique* du fichier source
 * (en suivant d'abord les symlinks), donc tout fichier symlinké rerouterait
 * vers le submodule réel et bypasserait nos overrides. Les Importers
 * customs n'interceptent pas non plus ces loads relatifs. Une copie physique
 * est la seule voie pour faire gagner notre `_options.scss` dans son propre
 * dossier.
 *
 * Cache : clé sur le HEAD git du submodule. Les builds suivants sans changement
 * upstream skippent la copie complètement (coût ≈ 1 stat).
 */
export function ensureWorkspace(projectRoot: string, dsfrRoot: string): { workspaceDsfr: string; refreshed: boolean } {
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
