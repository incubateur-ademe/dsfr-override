/**
 * DSFR has no centralized border-radius token; each component defines its own
 * (e.g. `.fr-input { border-radius: 1v 1v 0 0 }`) at the top level of the
 * cascade. We emit our overrides at the same level but later in the file —
 * naive cascade wins. We previously wrapped this in @layer ademe, but DSFR's
 * own rules sit unlayered, and CSS Cascade Layers spec says unlayered beats
 * layered regardless of declaration order, so the layered version was
 * silently shadowed.
 *
 * @param {object} borderRadius  mapping.yml `border-radius:` section
 * @returns {string}             SCSS for overrides/_radius.scss
 */
export function generateRadiusScss(borderRadius) {
  const targets = borderRadius?.targets ?? [];
  if (targets.length === 0) return '';

  const lines = [];
  for (const t of targets) {
    if (!t.selector || !t.value) continue;
    lines.push(`${t.selector} {`);
    lines.push(`  border-radius: ${t.value};`);
    if (t.overflow === true) lines.push('  overflow: hidden;');
    lines.push('}');
  }
  return lines.join('\n') + '\n';
}
