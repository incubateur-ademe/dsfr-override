/**
 * Generate @font-face declarations that override DSFR's primary typography.
 *
 * Trick: keep `font-family: 'Marianne'` (or whatever DSFR's CSS name is) so all
 * existing `font-family` rules in the cascade still resolve, but point the
 * src URLs at our own font files. The new declarations come *after* DSFR's
 * own @font-face block (we ship via overrides/_index.scss imported last) so
 * the browser uses ours.
 *
 * @param {object} typography  mapping.yml `typography:` section
 * @returns {string}           SCSS content for overrides/_font-face.scss
 */
export function generateFontFaceScss(typography) {
  if (!typography?.primary) return '';
  const primary = typography.primary;
  const cssName = primary['css-name'] ?? 'Marianne';
  const display = primary.display ?? 'swap';
  const weights = primary.weights ?? {};

  const blocks = [];
  for (const [weight, variants] of Object.entries(weights)) {
    for (const [styleKey, fileBase] of Object.entries(variants)) {
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
