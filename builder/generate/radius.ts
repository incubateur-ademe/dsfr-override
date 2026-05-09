import type { BorderRadius } from '../types.js';

/**
 * Génère les overrides ciblés de `border-radius`.
 *
 * DSFR n'a pas de token border-radius centralisé : chaque composant définit
 * le sien (ex : `.fr-input { border-radius: 1v 1v 0 0 }`) au top level de la
 * cascade. On émet nos overrides au même niveau mais plus loin dans le
 * fichier — la cascade naïve gagne. Une version précédente enveloppait ces
 * règles dans `@layer ademe`, abandonnée car le spec CSS Cascade Layers dit
 * que `unlayered > layered` peu importe l'ordre, donc DSFR (unlayered)
 * shadowait silencieusement nos surcharges.
 */
export function generateRadiusScss(borderRadius: BorderRadius | undefined): string {
  const targets = borderRadius?.targets ?? [];
  if (targets.length === 0) return '';

  const lines: string[] = [];
  for (const t of targets) {
    if (!t.selector || !t.value) continue;
    lines.push(`${t.selector} {`);
    lines.push(`  border-radius: ${t.value};`);
    if (t.overflow === true) lines.push('  overflow: hidden;');
    lines.push('}');
  }
  return lines.join('\n') + '\n';
}
