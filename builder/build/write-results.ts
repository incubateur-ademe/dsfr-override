import { writeFileSync } from 'node:fs';
import type { CompileResult } from '../types.js';

/**
 * Persiste les résultats de compile + postcss sur disque.
 *
 * Séparer l'I/O de la pipeline de transform garde `compile()` /
 * `postcssProcess()` purs (string in, string out), donc faciles à tester.
 *
 * @throws si un `outFile` ne se termine pas par `.css` alors qu'on a une variante
 *   minifiée à émettre — sans ce suffixe, le chemin `.min` collisionnerait
 *   silencieusement avec `outFile`.
 */
export function writeResults(results: CompileResult[]): void {
  for (const r of results) {
    writeFileSync(r.outFile, r.css);
    if (r.minCss != null) {
      if (!r.outFile.endsWith('.css')) {
        throw new Error(`writeResults: cannot derive .min.css path from ${r.outFile} (expected .css extension)`);
      }
      writeFileSync(r.outFile.slice(0, -4) + '.min.css', r.minCss);
    }
  }
}
