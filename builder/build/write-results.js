import { writeFileSync } from 'node:fs';

/**
 * Persist compile + postcss results to disk.
 *
 * Separating I/O from the transform pipeline keeps compile() / postcssProcess()
 * pure (string in, string out) — easier to test and reason about.
 *
 * @param {Array<{ outFile: string, css: string, minCss: string | null }>} results
 */
export function writeResults(results) {
  for (const r of results) {
    writeFileSync(r.outFile, r.css);
    if (r.minCss != null) {
      writeFileSync(r.outFile.replace(/\.css$/, '.min.css'), r.minCss);
    }
  }
}
