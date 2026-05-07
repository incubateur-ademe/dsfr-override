import { contrastRatio } from '../lch.js';
import { computeFamilyPalette } from '../generate/palette.js';

/**
 * Validate WCAG contrast ratios declared in mapping.colors.<family>.wcag
 * against the LCh-recomputed palette. Going through computeFamilyPalette
 * (rather than scraping the CSS) sidesteps the fact that DSFR only emits
 * *combined* shade vars (e.g. --blue-france-sun-113-625), not the per-grade
 * vars the mapping speaks about.
 *
 * @param {object} args
 * @param {object} args.mapping
 * @returns {{ checks: Array<{token: string, hex: string, against: string, min: number, ratio: number, ok: boolean}>, fails: number }}
 */
export function validateWcag({ mapping }) {
  const checks = [];

  for (const [family, cfg] of Object.entries(mapping?.colors ?? {})) {
    if (!cfg?.wcag || cfg.generation !== 'lch-remap' || !cfg.anchor?.hex) continue;

    const palette = computeFamilyPalette({
      anchor: cfg.anchor.hex,
      recalibrate: cfg['recalibrate-grade'] ?? {},
      addGrades: cfg['add-grades'] ?? {},
      semanticRemap: deriveSemanticRemap(family, cfg)
    });
    const byName = Object.fromEntries(palette.map(e => [e.name, e.values[0]]));

    for (const [grade, spec] of Object.entries(cfg.wcag)) {
      const hex = byName[grade];
      const token = `${cfg.rename ?? family}-${grade}`;
      if (!hex) {
        checks.push({ token, hex: null, against: spec.against, min: spec.min, ratio: 0, ok: false, missing: true });
        continue;
      }
      const ratio = contrastRatio(hex, spec.against);
      checks.push({ token, hex, against: spec.against, min: spec.min, ratio, ok: ratio + 1e-3 >= spec.min });
    }
  }

  return { checks, fails: checks.filter(c => !c.ok).length };
}

function deriveSemanticRemap(family, cfg) {
  const out = {};
  const prefix = `${family}-`;
  for (const [oldFull, newFull] of Object.entries(cfg['semantic-remap'] ?? {})) {
    if (oldFull.startsWith(prefix) && newFull.startsWith(prefix)) {
      out[oldFull.slice(prefix.length)] = newFull.slice(prefix.length);
    }
  }
  return out;
}
