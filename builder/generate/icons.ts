import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { IconAddEntry, IconAddEntryOutput, IconAddNormalized, IconMappingResult, Mapping } from '../types.js';

interface ApplyIconMappingArgs {
  projectRoot: string;
  mapping: Mapping;
  distDir: string;
}

/**
 * Pipeline icônes complète (1 passe par build) : rsync DSFR → dist, overrides
 * Lucide 1-1, et ajouts via `icons.add`.
 *
 *   dsfr/src/dsfr/core/icon/**              →  dist/icons/**                          (rsync)
 *   lucide-static + mapping.icons.overrides →  dist/icons/<dsfr-cat>/<dsfr-name>.svg  (overlay)
 *   lucide-static + mapping.icons.add       →  dist/icons/lucide/<token>.svg          (nouveau)
 *
 * Après cette passe, `dist/icons/` héberge le set canonique vers lequel les
 * composants DSFR et les utility classes pointent (via `mask-image: url('icons/...')`).
 *
 * La copie de base est inconditionnelle : `dist/icons/` est wipé puis re-rsync
 * depuis le submodule à chaque build, donc supprimer une entrée d'`overrides`
 * revient proprement à l'icône upstream. Coût ≈ 100-200 ms pour la copie de 1036 fichiers.
 *
 * @throws si une override pointe vers un nom DSFR inexistant ou un nom Lucide inconnu.
 */
export function applyIconMapping({ projectRoot, mapping, distDir }: ApplyIconMappingArgs): IconMappingResult {
  const dsfrIconRoot = join(projectRoot, 'dsfr/src/dsfr/core/icon');
  const distIconRoot = join(distDir, 'icons');
  const lucideRoot = join(projectRoot, 'node_modules/lucide-static/icons');

  // Étape 1 : rsync depuis le submodule pristine.
  if (existsSync(distIconRoot)) rmSync(distIconRoot, { recursive: true, force: true });
  mkdirSync(distIconRoot, { recursive: true });
  cpSync(dsfrIconRoot, distIconRoot, { recursive: true });

  const cfg = mapping?.icons ?? {};
  let overridesApplied = 0;
  let addsApplied = 0;
  const addEntries: IconAddEntryOutput[] = [];

  // Étape 2 : overrides (remplacement 1-1).
  // Il faut connaître la catégorie DSFR de chaque nom pour savoir où déposer le
  // remplacement. On indexe l'arbre fraîchement copié une fois.
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

  // Étape 3 : adds (nouvelles utility classes).
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
 * Génère les utility classes `.fr-icon-<token>` pour chaque entrée d'`icons.add`.
 * La mixin DSFR `generate-icons` ne parcourt que ses catégories hardcodées —
 * on émet donc les tokens Lucide via notre cascade d'overrides à la place.
 */
export function generateIconAddsScss(addEntries: IconAddEntryOutput[] | null | undefined): string {
  if (!addEntries?.length) return '';
  const lines: string[] = [];
  for (const { token } of addEntries) {
    // Reproduit la sortie de la mixin DSFR `generate-icons` : pseudo-éléments
    // ::before / ::after, mask vendor-préfixé, source dans icons/lucide/.
    lines.push(`.fr-icon-${token}::before, .fr-icon-${token}::after {`);
    lines.push(`  -webkit-mask-image: url('icons/lucide/${token}.svg');`);
    lines.push(`  mask-image: url('icons/lucide/${token}.svg');`);
    lines.push('}');
  }
  return lines.join('\n') + '\n';
}

function indexByName(root: string): Map<string, string> {
  const index = new Map<string, string>();
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

// Trois formes acceptées en YAML pour une entrée `icons.add` : un string brut
// (token = nom Lucide), un objet `{token, name}` complet, ou `{name}` seul
// (token implicite = name).
function normalizeAddEntry(entry: IconAddEntry): IconAddNormalized {
  if (typeof entry === 'string') return { token: entry, name: entry };
  if (entry && typeof entry === 'object' && 'token' in entry && 'name' in entry && entry.token && entry.name) {
    return { token: entry.token, name: entry.name };
  }
  if (entry && typeof entry === 'object' && 'name' in entry && entry.name) {
    const name = entry.name;
    const token = ('token' in entry && entry.token) ? entry.token : name;
    return { token, name };
  }
  throw new Error(`icons.add: invalid entry ${JSON.stringify(entry)} (expect string or {token?, name})`);
}
