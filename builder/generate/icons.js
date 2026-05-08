import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * Icon pipeline (run once per build):
 *
 *   dsfr/src/dsfr/core/icon/**             →   dist/icons/**           (rsync)
 *   lucide-static + mapping.icons.overrides →  dist/icons/<dsfr-cat>/<dsfr-name>.svg  (overlay)
 *   lucide-static + mapping.icons.add      →   dist/icons/lucide/<token>.svg  (new)
 *
 * After this runs, dist/icons/ holds the canonical icon set DSFR components and
 * utility classes will resolve to (via `mask-image: url('icons/...')`).
 *
 * The base copy is unconditional: dist/icons/ is wiped and re-rsynced from the
 * pristine submodule each build, so removing an entry from `overrides` reverts
 * cleanly to the upstream icon. Cost ≈ 100-200 ms for the 1036-file copy.
 *
 * @returns {{
 *   overridesApplied: number,
 *   addsApplied: number,
 *   addEntries: Array<{ token: string, lucideName: string }>
 * }}
 */
export function applyIconMapping({ projectRoot, mapping, distDir }) {
  const dsfrIconRoot = join(projectRoot, 'dsfr/src/dsfr/core/icon');
  const distIconRoot = join(distDir, 'icons');
  const lucideRoot = join(projectRoot, 'node_modules/lucide-static/icons');

  // Step 1: pristine rsync from the submodule.
  if (existsSync(distIconRoot)) rmSync(distIconRoot, { recursive: true, force: true });
  mkdirSync(distIconRoot, { recursive: true });
  cpSync(dsfrIconRoot, distIconRoot, { recursive: true });

  const cfg = mapping?.icons ?? {};
  let overridesApplied = 0;
  let addsApplied = 0;
  const addEntries = [];

  // Step 2: overrides (replace 1-1).
  // We need to find each dsfr-name's category to know where to drop the
  // replacement. Walk the freshly-copied tree once and build the index.
  const categoryByName = indexByName(distIconRoot);
  for (const [dsfrName, lucideName] of Object.entries(cfg.overrides ?? {})) {
    const category = categoryByName.get(dsfrName);
    if (!category) {
      throw new Error(`icons.overrides: '${dsfrName}' is not an existing DSFR icon (category not found in dsfr/src/dsfr/core/icon/)`);
    }
    const src = join(lucideRoot, `${lucideName}.svg`);
    if (!existsSync(src)) {
      throw new Error(`icons.overrides: lucide icon '${lucideName}' not found at ${src} (try a name from https://lucide.dev/icons/)`);
    }
    const dst = join(distIconRoot, category, `${dsfrName}.svg`);
    cpSync(src, dst);
    overridesApplied++;
  }

  // Step 3: adds (new utility classes).
  if (cfg.add?.length) {
    const lucideOutDir = join(distIconRoot, 'lucide');
    if (!existsSync(lucideOutDir)) mkdirSync(lucideOutDir, { recursive: true });
    for (const entry of cfg.add) {
      const { token, name } = normalizeAddEntry(entry);
      const src = join(lucideRoot, `${name}.svg`);
      if (!existsSync(src)) {
        throw new Error(`icons.add: lucide icon '${name}' not found at ${src}`);
      }
      cpSync(src, join(lucideOutDir, `${token}.svg`));
      addEntries.push({ token, lucideName: name });
      addsApplied++;
    }
  }

  return { overridesApplied, addsApplied, addEntries };
}

/**
 * Generate the `.fr-icon-<token>` utility classes for every entry in icons.add.
 * The DSFR `generate-icons` mixin only iterates over its hardcoded categories,
 * so we emit the new lucide tokens through our overrides cascade instead.
 *
 * @returns {string} SCSS content for overrides/_icons.scss (empty string if no adds)
 */
export function generateIconAddsScss(addEntries) {
  if (!addEntries?.length) return '';
  const lines = [];
  for (const { token } of addEntries) {
    // Mirrors what DSFR's generate-icons mixin produces: ::before / ::after
    // pseudo-elements, vendor-prefixed mask, source from icons/lucide/.
    lines.push(`.fr-icon-${token}::before, .fr-icon-${token}::after {`);
    lines.push(`  -webkit-mask-image: url('icons/lucide/${token}.svg');`);
    lines.push(`  mask-image: url('icons/lucide/${token}.svg');`);
    lines.push('}');
  }
  return lines.join('\n') + '\n';
}

function indexByName(root) {
  const index = new Map();
  for (const category of readdirSync(root)) {
    const catPath = join(root, category);
    if (!statSync(catPath).isDirectory()) continue;
    for (const file of readdirSync(catPath)) {
      if (file.endsWith('.svg')) {
        index.set(file.slice(0, -4), category);
      }
    }
  }
  return index;
}

function normalizeAddEntry(entry) {
  if (typeof entry === 'string') return { token: entry, name: entry };
  if (entry && typeof entry === 'object' && entry.token && entry.name) return entry;
  if (entry && typeof entry === 'object' && entry.name) return { token: entry.name, name: entry.name };
  throw new Error(`icons.add: invalid entry ${JSON.stringify(entry)} (expect string or {token?, name})`);
}
