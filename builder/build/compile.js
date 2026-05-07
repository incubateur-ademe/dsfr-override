import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { compileStringAsync } from 'sass';

/**
 * Compile the SCSS entry produced by prepare() into a CSS file.
 *
 * @param {object} input  Result of prepare()
 * @param {object} [opts]
 * @param {string} [opts.outName='dsfr-ademe.css']
 * @param {boolean} [opts.sourceMap=false]
 * @returns {Promise<{ outFile: string, css: string }>}
 */
export async function compile(input, opts = {}) {
  const outName = opts.outName ?? 'dsfr-ademe.css';
  const result = await compileStringAsync(input.entrySource, {
    url: input.entryUrl,
    loadPaths: input.loadPaths,
    style: 'expanded',
    sourceMap: opts.sourceMap === true,
    silenceDeprecations: ['global-builtin', 'import', 'mixed-decls']
  });

  const outFile = join(input.distDir, outName);
  writeFileSync(outFile, result.css);

  return { outFile, css: result.css };
}
