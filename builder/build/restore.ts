import { execFileSync } from 'node:child_process';
import type { RestoreStatus } from '../types.js';

interface RestoreOpts {
  projectRoot: string;
  callbacks?: Array<() => void | Promise<void>>;
}

/**
 * Vérifie que le working tree du submodule `dsfr/` est propre — invariant de
 * chaque build. Les futures étapes (filter-packages, etc.) enregistrent leurs
 * callbacks de cleanup via `opts.callbacks` qui tournent avant la vérif git.
 *
 * @throws si `git status` échoue, ou si l'un des callbacks lève.
 */
export async function restore(opts: RestoreOpts): Promise<RestoreStatus> {
  const errors: Error[] = [];
  for (const cb of opts.callbacks ?? []) {
    try { await cb(); } catch (e) { errors.push(e as Error); }
  }

  let dirty = '';
  try {
    dirty = execFileSync('git', ['status', '--porcelain'], {
      cwd: `${opts.projectRoot}/dsfr`,
      encoding: 'utf8'
    });
  } catch (e) {
    throw new Error(`git status failed in dsfr/: ${(e as Error).message}`);
  }

  if (errors.length > 0) {
    const msg = errors.map(e => e.message).join('\n  ');
    throw new Error(`restore() callbacks failed:\n  ${msg}`);
  }

  return { clean: dirty.trim() === '', dirty };
}
