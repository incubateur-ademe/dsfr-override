import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load as parseYaml } from 'js-yaml';
import { extractUpstreamFamilies, validateMapping } from './mapping.js';
import { checkUpstreamDrift } from './upstream-drift.js';
import { validateWcag } from './wcag.js';
import type { DriftResult, Mapping, ValidateMappingResult, WcagResult } from '../types.js';

interface ValidateAllArgs {
  projectRoot: string;
}

interface ValidateAllResult {
  mapping: ValidateMappingResult;
  drift: DriftResult;
  wcag: WcagResult;
}

/**
 * Lance tous les validateurs et agrège leurs findings. C'est l'appelant qui
 * décide si les warnings sont fatals (ex : `--strict` côté CLI).
 */
export function validateAll({ projectRoot }: ValidateAllArgs): ValidateAllResult {
  const dsfrRoot = join(projectRoot, 'dsfr');
  const mappingPath = join(projectRoot, 'mapping.yml');
  const mapping = existsSync(mappingPath)
    ? (parseYaml(readFileSync(mappingPath, 'utf8')) as Mapping | null)
    : null;

  const optionsPath = join(dsfrRoot, 'src/module/color/variable/_options.scss');
  const upstreamFamilies = existsSync(optionsPath)
    ? extractUpstreamFamilies(readFileSync(optionsPath, 'utf8'))
    : new Set<string>();

  const mappingResult = validateMapping(mapping, { upstreamFamilies });
  const drift = checkUpstreamDrift(projectRoot, dsfrRoot);

  const wcag: WcagResult = mapping ? validateWcag({ mapping }) : { checks: [], fails: 0 };

  return { mapping: mappingResult, drift, wcag };
}
