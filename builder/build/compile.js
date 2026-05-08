import { compileStringAsync } from 'sass';
import { join } from 'node:path';

/**
 * Compile every target produced by prepare() and return the raw CSS strings.
 * Disk I/O is delegated to writeResults() so this stays purely transformational.
 *
 * @param {object} input  Result of prepare()
 * @param {object} [opts]
 * @param {boolean} [opts.sourceMap=false]
 * @returns {Promise<Array<{ name: string, outFile: string, css: string }>>}
 */
export async function compile(input, opts = {}) {
  const results = [];
  for (const target of input.targets) {
    const r = await compileStringAsync(target.entrySource, {
      url: target.entryUrl,
      loadPaths: input.loadPaths,
      style: 'expanded',
      sourceMap: opts.sourceMap === true,
      silenceDeprecations: ['global-builtin', 'import', 'mixed-decls']
    });
    results.push({
      name: target.name,
      outFile: join(input.distDir, target.outName),
      css: r.css
    });
  }
  return results;
}
