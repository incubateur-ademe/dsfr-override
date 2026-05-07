/**
 * DSFR exposes the elevation tint via --shadow-color (light) and re-declares
 * it under :root[data-fr-theme=dark] for dark mode. We mirror that structure
 * so the cascade stays consistent.
 *
 * @param {object} elevation  mapping.yml `elevation:` section
 * @returns {string}          SCSS for overrides/_shadows.scss
 */
export function generateShadowsScss(elevation) {
  const sc = elevation?.['shadow-color'];
  if (!sc) return '';

  const lines = [];
  if (sc.light) {
    lines.push(':root {');
    lines.push(`  --shadow-color: ${sc.light};`);
    lines.push('}');
  }
  if (sc.dark) {
    lines.push(':root[data-fr-theme=dark] {');
    lines.push(`  --shadow-color: ${sc.dark};`);
    lines.push('}');
  }
  return lines.join('\n') + '\n';
}
