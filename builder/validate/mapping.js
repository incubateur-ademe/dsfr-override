/**
 * Minimal structural checks on the parsed mapping.yml. Catches obvious
 * misconfigurations (missing anchor, unsupported generation, rename to
 * an upstream-existing family) before the build wastes time.
 *
 * @param {object | null} mapping
 * @param {object} [opts]
 * @param {Set<string>} [opts.upstreamFamilies]  Names found in dsfr/_options.scss; used to
 *                                                detect rename-collision.
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateMapping(mapping, opts = {}) {
  const errors = [];
  const warnings = [];
  const upstream = opts.upstreamFamilies ?? new Set();

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
 * Extract the set of family names from a parsed _options.scss content.
 * Heuristic: scan for `// <name>` markers above each block.
 */
export function extractUpstreamFamilies(optionsScss) {
  const set = new Set();
  for (const line of optionsScss.split('\n')) {
    const m = line.match(/^\s*\/\/\s*([a-z][a-z0-9-]*)\s*$/);
    if (m) set.add(m[1]);
  }
  return set;
}
