import { execFileSync } from 'node:child_process';

/**
 * Verify that the dsfr/ submodule working tree is clean — invariant of every build.
 * Future steps (filter-packages, etc.) will register cleanup callbacks here.
 *
 * @param {object} opts
 * @param {string} opts.projectRoot
 * @param {Array<() => void | Promise<void>>} [opts.callbacks]  Cleanup hooks to run before the check
 * @returns {Promise<{ clean: boolean, dirty: string }>}
 */
export async function restore(opts) {
  const errors = [];
  for (const cb of opts.callbacks ?? []) {
    try { await cb(); } catch (e) { errors.push(e); }
  }

  let dirty = '';
  try {
    dirty = execFileSync('git', ['status', '--porcelain'], {
      cwd: `${opts.projectRoot}/dsfr`,
      encoding: 'utf8'
    });
  } catch (e) {
    throw new Error(`git status failed in dsfr/: ${e.message}`);
  }

  if (errors.length > 0) {
    const msg = errors.map(e => e.message).join('\n  ');
    throw new Error(`restore() callbacks failed:\n  ${msg}`);
  }

  return { clean: dirty.trim() === '', dirty };
}
