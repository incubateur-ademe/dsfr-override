import { hexToLch, lchToHex } from '../lch.js';
import {
  DEFAULT_PROFILE,
  MAIN_DLH, MAIN_DLA, MAIN_C_FACTOR_H, MAIN_C_FACTOR_A
} from './profile-lch.js';
import type { PaletteCfg, PaletteEntry, ProfileRow } from '../types.js';

/**
 * Calcule la palette complète d'une famille à partir de son anchor hex en
 * combinant le profil par défaut, les `add-grades` et les `recalibrate`.
 *
 * @param cfg le `PaletteCfg` de la famille (anchor, recalibrations, add-grades, semantic-remap).
 * @returns Les entrées de palette dans l'ordre d'émission. Chaque entrée porte un
 *   triplet default/hover/active (5-tuple pour `main` :
 *   default/hoverL/activeL/hoverD/activeD).
 */
export function computeFamilyPalette(cfg: PaletteCfg): PaletteEntry[] {
  const [L0, C0, h0] = hexToLch(cfg.anchor);
  const recalibrate = cfg.recalibrate ?? {};
  const addGrades = cfg.addGrades ?? {};
  const out: PaletteEntry[] = [];

  // Si `recalibrate` mappe OLD → baseName, on émet aussi OLD avec les mêmes
  // valeurs, sinon `_static.scss` / `_sets.scss` (qui réfèrent encore l'OLD)
  // casseraient à la compilation Sass.
  const pushWithAlias = (canonicalName: string, values: string[]): void => {
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

  // Add-grades explicites — ignorés s'ils dupliquent un grade déjà produit par
  // le profil par défaut.
  for (const [name, params] of Object.entries(addGrades)) {
    if (out.some(e => e.name === name)) continue;
    const row: ProfileRow = {
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

  // Grade `main` : l'anchor lui-même, numéroté round(L0 * 10).
  const mainName = `main-${Math.round(L0 * 10)}`;
  const mainDefault = lchToHex(L0, C0, h0);
  const mainHoverL = lchToHex(L0 + MAIN_DLH, C0 * MAIN_C_FACTOR_H, h0);
  const mainActiveL = lchToHex(L0 + MAIN_DLA, C0 * MAIN_C_FACTOR_A, h0);
  // DSFR `main` porte 5 valeurs (default + hover-light + active-light + hover-dark
  // + active-dark). Phase 1 réutilise le même hover/active pour les deux modes.
  const mainTuple = [mainDefault, mainHoverL, mainActiveL, mainHoverL, mainActiveL];
  pushWithAlias(mainName, mainTuple);

  // Semantic remap : on conserve l'ancien nom de grade dans la palette (avec les
  // valeurs de sa cible) pour que les fichiers DSFR qui le référencent encore
  // (typiquement `_sets.scss`) ne cassent pas. Ex : `red-marianne-425` miroite
  // `red-marianne-sun-157`.
  const semanticRemap = cfg.semanticRemap ?? {};
  for (const [oldGrade, newGrade] of Object.entries(semanticRemap)) {
    const target = out.find(e => e.name === newGrade);
    if (target && !out.some(e => e.name === oldGrade)) {
      out.push({ name: oldGrade, values: target.values });
    }
  }

  return out;
}

function computeTriplet(row: ProfileRow, C0: number, h0: number): string[] {
  const C = C0 * row.cFactor;
  const def = lchToHex(row.L, C, h0);
  const hoverHex = lchToHex(row.L + row.dLHover, C * row.cFactorHover, h0);
  const activeHex = lchToHex(row.L + row.dLActive, C * row.cFactorActive, h0);
  return [def, hoverHex, activeHex];
}

/**
 * Sérialise la palette d'une famille en fragment SCSS prêt à être collé dans
 * `_options.scss`. Le format colle exactement la convention DSFR, byte pour byte :
 *
 *   // family-name
 *   family-name-75: #hex #hex #hex,
 *   family-name-main-XXX: #hex #hex #hex #hex #hex,
 */
export function serializeFamily(family: string, palette: PaletteEntry[]): string {
  const lines = [`  // ${family}`];
  for (const { name, values } of palette) {
    lines.push(`  ${family}-${name}: ${values.join(' ')},`);
  }
  return lines.join('\n');
}
