// Default LCh profile — reproduces the DSFR tonal hierarchy from Phase 1 POC.
// Each row: [grade, L_target, C_factor, ΔL_hover, ΔL_active, C_factor_hover, C_factor_active]
// Source: docs/phase1-poc-report.md § "Étape 4 — Profil LCh par défaut"

export const DEFAULT_PROFILE = [
  { grade: '75',  L: 11.0, cFactor: 0.24, dLHover:  15.4, dLActive:  24.0, cFactorHover: 0.70, cFactorActive: 0.55 },
  { grade: '100', L: 14.2, cFactor: 0.27, dLHover:  16.0, dLActive:  24.5, cFactorHover: 0.70, cFactorActive: 0.55 },
  { grade: '125', L: 17.2, cFactor: 0.28, dLHover:  16.5, dLActive:  24.7, cFactorHover: 0.70, cFactorActive: 0.55 },
  { grade: '200', L: 24.3, cFactor: 0.59, dLHover:  16.6, dLActive:  24.5, cFactorHover: 0.75, cFactorActive: 0.60 },
  { grade: 'sun', L: 15.7, cFactor: 1.10, dLHover:  17.8, dLActive:  19.8, cFactorHover: 0.95, cFactorActive: 0.85 },
  { grade: '625', L: 60.3, cFactor: 0.80, dLHover:  14.3, dLActive:  21.2, cFactorHover: 0.65, cFactorActive: 0.45 },
  { grade: '850', L: 82.8, cFactor: 0.33, dLHover: -13.4, dLActive: -20.6, cFactorHover: 0.85, cFactorActive: 0.95 },
  { grade: '925', L: 90.9, cFactor: 0.17, dLHover: -11.1, dLActive: -17.7, cFactorHover: 1.40, cFactorActive: 1.90 },
  { grade: '950', L: 93.9, cFactor: 0.12, dLHover:  -9.8, dLActive: -15.9, cFactorHover: 1.40, cFactorActive: 1.90 },
  { grade: '975', L: 96.8, cFactor: 0.06, dLHover:  -8.1, dLActive: -13.7, cFactorHover: 1.40, cFactorActive: 1.90 }
];

// Main grade uses the anchor itself, with these deltas for hover/active.
export const MAIN_DLH = 14.7;
export const MAIN_DLA = 21.9;
export const MAIN_C_FACTOR_H = 0.85;
export const MAIN_C_FACTOR_A = 0.78;
