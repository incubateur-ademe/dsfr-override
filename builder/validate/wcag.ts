import { contrastRatio } from '../lch.js';
import { computeFamilyPalette } from '../generate/palette.js';
import type { ColorFamily, Mapping, WcagCheck, WcagResult } from '../types.js';

interface ValidateWcagArgs {
  mapping: Mapping;
}

/**
 * Valide les ratios WCAG déclarés dans `mapping.colors.<family>.wcag` contre la
 * palette LCh recalculée. Passer par `computeFamilyPalette` (plutôt que scraper
 * le CSS) contourne le fait que DSFR n'émet que des variables CSS de teintes
 * *combinées* (ex : `--blue-france-sun-113-625`), pas les vars par-grade dont
 * parle le mapping.
 */
export function validateWcag({ mapping }: ValidateWcagArgs): WcagResult {
  const checks: WcagCheck[] = [];

  for (const [family, cfg] of Object.entries(mapping?.colors ?? {})) {
    if (!cfg?.wcag || cfg.generation !== 'lch-remap' || !cfg.anchor?.hex) continue;

    const palette = computeFamilyPalette({
      anchor: cfg.anchor.hex,
      recalibrate: cfg['recalibrate-grade'] ?? {},
      addGrades: cfg['add-grades'] ?? {},
      semanticRemap: deriveSemanticRemap(family, cfg)
    });
    const byName: Record<string, string | undefined> = Object.fromEntries(palette.map(e => [e.name, e.values[0]]));

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

function deriveSemanticRemap(family: string, cfg: ColorFamily): Record<string, string> {
  const out: Record<string, string> = {};
  const prefix = `${family}-`;
  for (const [oldFull, newFull] of Object.entries(cfg['semantic-remap'] ?? {})) {
    if (oldFull.startsWith(prefix) && newFull.startsWith(prefix)) {
      out[oldFull.slice(prefix.length)] = newFull.slice(prefix.length);
    }
  }
  return out;
}
