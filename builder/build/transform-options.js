/**
 * Replace, in-place, the SCSS lines for one family in dsfr/src/module/color/variable/_options.scss.
 *
 * Why text replacement and not full map parse/serialize: keeps comments, ordering,
 * and unmapped families exactly as upstream, so a no-op transform produces a
 * byte-equivalent file. Only the lines starting with "  <family>-" are touched.
 *
 * @param {string} originalScss
 * @param {string} family       e.g. 'blue-france'
 * @param {Array<{ name: string, values: string[] }>} paletteEntries
 * @returns {string}            modified SCSS, or unchanged if family has no lines
 */
export function transformFamilyBlock(originalScss, family, paletteEntries) {
  const lines = originalScss.split('\n');
  const prefix = `  ${family}-`;
  let firstIdx = -1;
  let lastIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(prefix)) {
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
