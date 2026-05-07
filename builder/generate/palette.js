import { hexToLch, lchToHex } from '../lch.js';
import {
  DEFAULT_PROFILE,
  MAIN_DLH, MAIN_DLA, MAIN_C_FACTOR_H, MAIN_C_FACTOR_A
} from './profile-lch.js';

/**
 * Compute a full palette for one family from its anchor hex.
 *
 * @param {object} cfg
 * @param {string} cfg.anchor    Hex anchor (e.g. '#4950FB')
 * @param {object} [cfg.addGrades]      e.g. { 'sun-157': { L: 15.7, cFactor: 1.10 } }
 *                                     Used to inject grades that don't exist in the upstream profile.
 * @param {object} [cfg.recalibrate]    e.g. { 'main-525': 'main-444', 'sun-113': 'sun-157' }
 *                                     Re-numbers a grade. The numeric grade is dropped from the LCh
 *                                     calculation (we use the *new* number) but we also emit the old
 *                                     name as an alias so that DSFR _static.scss / _sets.scss don't break.
 * @returns {Array<{ name: string, values: string[] }>}  In emission order. Each entry holds the
 *   default-hover-active triplet (5-tuple for main: default-hoverL-activeL-hoverD-activeD).
 */
export function computeFamilyPalette(cfg) {
  const [L0, C0, h0] = hexToLch(cfg.anchor);
  const recalibrate = cfg.recalibrate ?? {};
  const addGrades = cfg.addGrades ?? {};
  const out = [];

  // Helper: if recalibrate maps OLD → baseName, alias OLD with the same values.
  const pushWithAlias = (canonicalName, values) => {
    out.push({ name: canonicalName, values });
    for (const [oldName, newName] of Object.entries(recalibrate)) {
      if (newName === canonicalName && oldName !== canonicalName && !out.some(e => e.name === oldName)) {
        out.push({ name: oldName, values });
      }
    }
  };

  for (const row of DEFAULT_PROFILE) {
    const triplet = computeTriplet(row, C0, h0);
    const baseName = row.grade === 'sun' ? `sun-${Math.round(row.L * 10)}` : row.grade;
    pushWithAlias(baseName, triplet);
  }

  // Explicit add-grades (declarative; ignored if already produced by the default profile).
  for (const [name, params] of Object.entries(addGrades)) {
    if (out.some(e => e.name === name)) continue;
    const row = {
      grade: name,
      L: params.L,
      cFactor: params['c-factor'] ?? params.cFactor ?? 1,
      dLHover: params['dL-hover'] ?? params.dLHover ?? 17.8,
      dLActive: params['dL-active'] ?? params.dLActive ?? 19.8,
      cFactorHover: params['c-factor-hover'] ?? params.cFactorHover ?? 0.95,
      cFactorActive: params['c-factor-active'] ?? params.cFactorActive ?? 0.85
    };
    pushWithAlias(name, computeTriplet(row, C0, h0));
  }

  // Main grade: anchor itself, numbered round(L0 * 10).
  const mainName = `main-${Math.round(L0 * 10)}`;
  const mainDefault = lchToHex(L0, C0, h0);
  const mainHoverL = lchToHex(L0 + MAIN_DLH, C0 * MAIN_C_FACTOR_H, h0);
  const mainActiveL = lchToHex(L0 + MAIN_DLA, C0 * MAIN_C_FACTOR_A, h0);
  // DSFR main has 5 values (default + hover-light + active-light + hover-dark + active-dark).
  // Phase 1 reuses the same hover/active for both modes.
  const mainTuple = [mainDefault, mainHoverL, mainActiveL, mainHoverL, mainActiveL];
  pushWithAlias(mainName, mainTuple);

  // Semantic remap: keep the old grade name in the palette (mirroring its target's
  // values) so DSFR files that still reference the old name (typically _sets.scss)
  // don't break. e.g. red-marianne-425 mirrors red-marianne-sun-157.
  const semanticRemap = cfg.semanticRemap ?? {};
  for (const [oldGrade, newGrade] of Object.entries(semanticRemap)) {
    const target = out.find(e => e.name === newGrade);
    if (target && !out.some(e => e.name === oldGrade)) {
      out.push({ name: oldGrade, values: target.values });
    }
  }

  return out;
}

function computeTriplet(row, C0, h0) {
  const C = C0 * row.cFactor;
  const def = lchToHex(row.L, C, h0);
  const hoverHex = lchToHex(row.L + row.dLHover, C * row.cFactorHover, h0);
  const activeHex = lchToHex(row.L + row.dLActive, C * row.cFactorActive, h0);
  return [def, hoverHex, activeHex];
}

/**
 * Serialize a family's palette as the SCSS map fragment that goes into _options.scss.
 * Output format follows the existing DSFR convention exactly:
 *
 *   // family-name
 *   family-name-75: #hex #hex #hex,
 *   family-name-main-XXX: #hex #hex #hex #hex #hex,
 */
export function serializeFamily(family, palette) {
  const lines = [`  // ${family}`];
  for (const { name, values } of palette) {
    lines.push(`  ${family}-${name}: ${values.join(' ')},`);
  }
  return lines.join('\n');
}
