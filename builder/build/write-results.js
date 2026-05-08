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
      if (!r.outFile.endsWith('.css')) {
        // Without the .css suffix the .min path would silently collide with
        // outFile and overwrite the unminified content.
        throw new Error(`writeResults: cannot derive .min.css path from ${r.outFile} (expected .css extension)`);
      }
      writeFileSync(r.outFile.slice(0, -4) + '.min.css', r.minCss);
    }
  }
}
