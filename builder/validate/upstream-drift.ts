import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DriftEntry, DriftResult } from '../types.js';

// Fichiers DSFR critiques dont on dépend. Si l'un d'eux change de forme
// upstream, le builder peut produire silencieusement un output subtilement
// faux — mieux vaut warn tôt qu'investiguer une régression visuelle.
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
] as const;

type Snapshot = Record<string, string | null>;

function sha256(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

function snapshot(dsfrRoot: string): Snapshot {
  const map: Snapshot = {};
  for (const rel of TRACKED) {
    const abs = join(dsfrRoot, rel);
    map[rel] = existsSync(abs) ? sha256(readFileSync(abs)) : null;
  }
  return map;
}

/**
 * Compare les hashes actuels des fichiers DSFR à `.ademe-baseline.json`.
 * Le statut `no-baseline` n'est pas un échec — c'est l'état initial, ou un
 * setup qui n'a pas encore figé sa baseline.
 */
export function checkUpstreamDrift(projectRoot: string, dsfrRoot: string): DriftResult {
  const baselinePath = join(projectRoot, '.ademe-baseline.json');
  const current = snapshot(dsfrRoot);
  if (!existsSync(baselinePath)) return { status: 'no-baseline', drifts: [] };

  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')) as Snapshot;
  const drifts: DriftEntry[] = [];
  for (const file of TRACKED) {
    const was = baseline[file] ?? null;
    const now = current[file] ?? null;
    if (was !== now) {
      drifts.push({ file, was, now });
    }
  }
  return { status: drifts.length ? 'drift' : 'ok', drifts };
}

/**
 * Écrit les hashes actuels dans `.ademe-baseline.json`. À lancer après un
 * upgrade upstream validé à la main.
 */
export function updateBaseline(projectRoot: string, dsfrRoot: string): string {
  const baselinePath = join(projectRoot, '.ademe-baseline.json');
  writeFileSync(baselinePath, JSON.stringify(snapshot(dsfrRoot), null, 2) + '\n');
  return baselinePath;
}
