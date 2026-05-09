import type { PaletteEntry } from '../types.js';

/**
 * Remplace in-place les lignes SCSS d'une famille dans
 * `dsfr/src/module/color/variable/_options.scss`.
 *
 * Pourquoi un text replacement plutôt qu'un parse/serialize complet de la map
 * SCSS : on garde les commentaires, l'ordre et les familles non mappées
 * exactement comme upstream, donc un transform no-op produit un fichier byte
 * équivalent. Seules les lignes qui commencent par `  <family>-` sont touchées.
 */
export function transformFamilyBlock(
  originalScss: string,
  family: string,
  paletteEntries: PaletteEntry[]
): string {
  const lines = originalScss.split('\n');
  const prefix = `  ${family}-`;
  let firstIdx = -1;
  let lastIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line !== undefined && line.startsWith(prefix)) {
      if (firstIdx === -1) firstIdx = i;
      lastIdx = i;
    }
  }
  if (firstIdx === -1) return originalScss;

  const newBlock = paletteEntries.map(({ name, values }) =>
    `  ${family}-${name}: ${values.join(' ')},`
  );

  return [
    ...lines.slice(0, firstIdx),
    ...newBlock,
    ...lines.slice(lastIdx + 1)
  ].join('\n');
}
