import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { compileStringAsync } from 'sass';

/**
 * Compile every target produced by prepare() into its CSS file.
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
    const outFile = join(input.distDir, target.outName);
    writeFileSync(outFile, r.css);
    results.push({ name: target.name, outFile, css: r.css });
  }
  return results;
}
