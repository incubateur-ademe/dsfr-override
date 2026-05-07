import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Critical DSFR files we depend on. If any of these change shape upstream,
 * our builder may silently produce subtly wrong output — better to warn early.
 */
const TRACKED = [
  'src/module/color/variable/_options.scss',
  'src/module/color/variable/_sets.scss',
  'src/module/color/variable/_decisions.scss',
  'src/module/color/variable/_static.scss',
  'src/dsfr/component/main.scss',
  'src/dsfr/component/legacy.scss',
  'src/dsfr/component/print.scss',
  'src/dsfr/core/style/typography/setting/_font-face.scss',
  'src/module/elevation/variable/_shadows.scss'
];

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

function snapshot(dsfrRoot) {
  const map = {};
  for (const rel of TRACKED) {
    const abs = join(dsfrRoot, rel);
    map[rel] = existsSync(abs) ? sha256(readFileSync(abs)) : null;
  }
  return map;
}

/**
 * Compare current DSFR file hashes against .ademe-baseline.json.
 *
 * @param {string} projectRoot
 * @param {string} dsfrRoot
 * @returns {{ status: 'ok' | 'no-baseline' | 'drift', drifts: Array<{file: string, was: string, now: string}> }}
 */
export function checkUpstreamDrift(projectRoot, dsfrRoot) {
  const baselinePath = join(projectRoot, '.ademe-baseline.json');
  const current = snapshot(dsfrRoot);
  if (!existsSync(baselinePath)) return { status: 'no-baseline', drifts: [] };

  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  const drifts = [];
  for (const file of TRACKED) {
    if (baseline[file] !== current[file]) {
      drifts.push({ file, was: baseline[file], now: current[file] });
    }
  }
  return { status: drifts.length ? 'drift' : 'ok', drifts };
}

/**
 * Write current hashes to .ademe-baseline.json. Run after a manually-validated
 * upstream upgrade.
 */
export function updateBaseline(projectRoot, dsfrRoot) {
  const baselinePath = join(projectRoot, '.ademe-baseline.json');
  writeFileSync(baselinePath, JSON.stringify(snapshot(dsfrRoot), null, 2) + '\n');
  return baselinePath;
}
