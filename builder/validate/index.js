import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load as parseYaml } from 'js-yaml';
import { extractUpstreamFamilies, validateMapping } from './mapping.js';
import { checkUpstreamDrift } from './upstream-drift.js';
import { validateWcag } from './wcag.js';

/**
 * Run every validator and aggregate findings. Caller decides whether warnings
 * should be fatal (e.g. CLI --strict).
 *
 * @param {object} opts
 * @param {string} opts.projectRoot
 * @returns {{
 *   mapping: { errors: string[], warnings: string[] },
 *   drift: { status: string, drifts: Array<{file: string}> },
 *   wcag: { checks: Array<object>, fails: number }
 * }}
 */
export function validateAll({ projectRoot }) {
  const dsfrRoot = join(projectRoot, 'dsfr');
  const mappingPath = join(projectRoot, 'mapping.yml');
  const mapping = existsSync(mappingPath) ? parseYaml(readFileSync(mappingPath, 'utf8')) : null;

  const optionsPath = join(dsfrRoot, 'src/module/color/variable/_options.scss');
  const upstreamFamilies = existsSync(optionsPath)
    ? extractUpstreamFamilies(readFileSync(optionsPath, 'utf8'))
    : new Set();

  const mappingResult = validateMapping(mapping, { upstreamFamilies });
  const drift = checkUpstreamDrift(projectRoot, dsfrRoot);

  const wcag = mapping ? validateWcag({ mapping }) : { checks: [], fails: 0 };

  return { mapping: mappingResult, drift, wcag };
}
