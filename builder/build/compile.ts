import { compileStringAsync } from 'sass';
import { join } from 'node:path';
import type { CompileOpts, CompileResult, PrepareInput } from '../types.js';

/**
 * Compile chaque target produit par `prepare()` et renvoie les chaînes CSS brutes.
 * L'I/O disque est délégué à `writeResults()` pour garder ce module purement
 * transformationnel (testable sans fixtures).
 */
export async function compile(input: PrepareInput, opts: CompileOpts = {}): Promise<CompileResult[]> {
  const results: CompileResult[] = [];
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
