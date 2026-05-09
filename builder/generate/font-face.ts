import type { Typography } from '../types.js';

/**
 * Génère les `@font-face` qui surchargent la typographie primaire de DSFR.
 *
 * Astuce : on conserve `font-family: 'Marianne'` (ou le nom CSS DSFR du moment)
 * pour que toutes les règles `font-family` existantes dans la cascade
 * résolvent, mais on pointe les `src:` vers nos propres fichiers. Les
 * déclarations sortent *après* le bloc `@font-face` DSFR (notre
 * `overrides/_index.scss` est importé en dernier), donc le browser prend les
 * nôtres.
 */
export function generateFontFaceScss(typography: Typography | undefined): string {
  if (!typography?.primary) return '';
  const primary = typography.primary;
  const cssName = primary['css-name'] ?? 'Marianne';
  const display = primary.display ?? 'swap';
  const weights = primary.weights ?? {};

  const blocks: string[] = [];
  for (const [weight, variants] of Object.entries(weights)) {
    for (const [styleKey, fileBase] of Object.entries(variants)) {
      if (!fileBase) continue;
      const fontStyle = styleKey === 'italic' ? 'italic' : 'normal';
      blocks.push([
        '@font-face {',
        `  font-family: '${cssName}';`,
        `  src: url('fonts/${fileBase}.woff2') format('woff2'), url('fonts/${fileBase}.woff') format('woff');`,
        `  font-weight: ${weight};`,
        `  font-style: ${fontStyle};`,
        `  font-display: ${display};`,
        '}'
      ].join('\n'));
    }
  }
  return blocks.join('\n\n') + '\n';
}
