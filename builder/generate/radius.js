/**
 * DSFR has no centralized border-radius token; each component defines its own.
 * We override per-selector inside @layer ademe so specificity stays low and
 * upstream `.fr-*` rules can still beat us if they need to.
 *
 * @param {object} borderRadius  mapping.yml `border-radius:` section
 * @returns {string}             SCSS for overrides/_radius.scss
 */
export function generateRadiusScss(borderRadius) {
  const targets = borderRadius?.targets ?? [];
  if (targets.length === 0) return '';

  const lines = ['@layer ademe {'];
  for (const t of targets) {
    if (!t.selector || !t.value) continue;
    lines.push(`  ${t.selector} {`);
    lines.push(`    border-radius: ${t.value};`);
    if (t.overflow === true) lines.push('    overflow: hidden;');
    lines.push('  }');
  }
  lines.push('}');
  return lines.join('\n') + '\n';
}
