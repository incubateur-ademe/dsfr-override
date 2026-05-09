import type { Mapping, ValidateMappingResult } from '../types.js';

interface ValidateMappingOpts {
  upstreamFamilies?: Set<string>;
}

/**
 * Vérifs structurelles minimales sur le `mapping.yml` parsé. Capture les
 * misconfigurations évidentes (anchor manquant, generation non supportée,
 * rename vers une famille upstream existante) avant que le build perde son
 * temps.
 *
 * @returns Une paire `{errors, warnings}` — la convention `--strict` du CLI
 *   transforme les warnings en errors.
 */
export function validateMapping(mapping: Mapping | null, opts: ValidateMappingOpts = {}): ValidateMappingResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const upstream = opts.upstreamFamilies ?? new Set<string>();

  if (!mapping) {
    errors.push('mapping is empty (no mapping.yml found)');
    return { errors, warnings };
  }

  if (typeof mapping.version !== 'number') warnings.push('mapping.version missing or not a number');
  if (typeof mapping.dsfr !== 'string') warnings.push('mapping.dsfr should pin a DSFR version (e.g. "1.14.4")');

  const colors = mapping.colors ?? {};
  for (const [family, cfg] of Object.entries(colors)) {
    if (!cfg) continue;
    const where = `colors.${family}`;
    if (cfg.generation && cfg.generation !== 'lch-remap' && cfg.generation !== 'manual') {
      errors.push(`${where}.generation: unsupported value "${cfg.generation}" (use lch-remap or manual)`);
    }
    if (cfg.generation === 'lch-remap' && !cfg.anchor?.hex) {
      errors.push(`${where}.anchor.hex required when generation is lch-remap`);
    }
    if (cfg.anchor?.hex && !/^#?[0-9a-f]{3}([0-9a-f]{3})?$/i.test(cfg.anchor.hex)) {
      errors.push(`${where}.anchor.hex: not a valid hex color (got "${cfg.anchor.hex}")`);
    }
    if (cfg.rename && upstream.has(cfg.rename)) {
      errors.push(`${where}.rename: target "${cfg.rename}" collides with an existing upstream family`);
    }
    if (cfg.rename === family) {
      warnings.push(`${where}.rename: same as source family — no-op`);
    }
  }

  const components = mapping.components ?? {};
  if (components.remove && !Array.isArray(components.remove)) {
    errors.push('components.remove must be an array of component names');
  }

  const post = mapping['post-process']?.rename;
  if (post && typeof post.enabled !== 'boolean') {
    warnings.push('post-process.rename.enabled should be a boolean');
  }

  return { errors, warnings };
}

/**
 * Extrait l'ensemble des noms de famille d'un contenu `_options.scss` parsé.
 * Heuristique : scanne les marqueurs `// <name>` placés au-dessus de chaque
 * bloc — DSFR maintient cette convention de commentaire.
 */
export function extractUpstreamFamilies(optionsScss: string): Set<string> {
  const set = new Set<string>();
  for (const line of optionsScss.split('\n')) {
    const m = line.match(/^\s*\/\/\s*([a-z][a-z0-9-]*)\s*$/);
    if (m && m[1]) set.add(m[1]);
  }
  return set;
}
