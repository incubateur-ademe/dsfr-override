import type { Elevation } from '../types.js';

/**
 * Génère les overrides `--shadow-color` light/dark de DSFR.
 *
 * DSFR expose le tint d'élévation via `--shadow-color` (light) et le
 * re-déclare sous `:root[data-fr-theme=dark]` pour le dark mode — on miroite
 * cette structure pour que la cascade reste cohérente.
 */
export function generateShadowsScss(elevation: Elevation | undefined): string {
  const sc = elevation?.['shadow-color'];
  if (!sc) return '';

  const lines: string[] = [];
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
