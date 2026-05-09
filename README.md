# dsfr-override

Builder de design system dérivé du DSFR pour l'ADEME.

> **Statut** : Phase 2 implémentée (Steps 0-10). Voir `docs/implementation-plan.md`.

## Vision

Prend le DSFR en submodule git (sans le toucher), génère des overrides SCSS depuis un `mapping.yml`, build, et produit un design system dérivé. Quand DSFR upstream évolue, `git submodule update` et c'est tout — aucun rebase.

## Quick start

```bash
git clone <this-repo>
cd dsfr-override
git submodule update --init --recursive
pnpm install        # installe la racine + le workspace storybook
pnpm build
```

Sortie dans `dist/` :

- `dsfr-ademe.css` (~800 KB) — composants, scheme, core + overrides ADEME
- `utility-ademe.css` (~525 KB) — classes utilitaires (`.fr-background-*--blue-ate`, etc.)
- `fonts/` — Public Sans (primary) + Spectral (alt)

Avec `--minify` :

```bash
pnpm build --minify
# → dist/*.min.css en plus (cssnano)
```

> Le repo est un **pnpm workspace** : la racine (`./`) contient le builder, l'orchestration et les tests ; `storybook/` est un sous-package isolé (~500 MB de deps Storybook qu'on ne veut pas dans la racine). `pnpm install` à la racine installe les deux. Pour ne travailler que sur le builder, ignore `storybook/node_modules/`.

## Commandes

| Commande              | Effet                                                              |
|-----------------------|--------------------------------------------------------------------|
| `pnpm build`          | Génère overrides → compile sass → PostCSS → rename → écrit `dist/` |
| `pnpm build --minify` | Idem + cssnano → `dist/*.min.css`                                  |
| `pnpm generate`       | N'émet que `overrides/_*.scss` (pas de compilation sass)           |
| `pnpm validate`       | Mapping schema + drift upstream + WCAG sur la palette LCh          |
| `pnpm validate --strict` | Idem, mais les warnings deviennent des erreurs                  |
| `pnpm baseline`       | Snapshot SHA-256 des fichiers DSFR critiques → `.ademe-baseline.json` |
| `pnpm upgrade`        | `git submodule update --remote dsfr` puis `validate`               |
| `pnpm test`           | 46 tests : LCh primitives + palette match Phase 1 + validate + build e2e |
| `pnpm storybook`      | `pnpm build` + lance le Storybook DSFR sur :6006                   |
| `node builder/serve.js` | Serveur statique (port 8080 par défaut) pour `example/index.html` |

`--minify` est un flag CLI réservé au build (release / CI). Il n'a pas d'équivalent dans `mapping.yml` : la minification est une décision opérationnelle, pas une décision de design system. La section `post-css:` du mapping contrôle uniquement les passes appliquées en mode normal (mqpacker + dedup + banner ADEME) ; elle s'enchaîne automatiquement en mode `--minify`.

## Vérifier visuellement

| Quand | Outil | Démarrage | URL |
|---|---|---|---|
| Smoke test rapide après `pnpm build` ("rien n'a cassé d'évident ?") | Page témoin | <1 s, zéro dep | `node builder/serve.js` → `:8080/example/index.html` |
| Explorer un composant DSFR particulier ou démontrer le rendu ADEME | Storybook | ~30 s premier démarrage, ~5 s ensuite | `pnpm storybook` → `:6006` |

**Page témoin** : un seul HTML, exerce typo / palette / boutons / formulaires / alertes / cards / classes utilitaires renommées. Inclut un diagnostic typographie qui confirme via canvas measurement que `Marianne` (nom CSS) est bien rendue par les fichiers Public Sans. Voir `docs/example.md`.

**Storybook** : 322 stories DSFR + 57 docs pages avec switcher light/dark et viewports. Stories pioché dans le submodule pristine (zéro copie). Voir `docs/storybook.md`.

**Builder UI** (`http://localhost:8080/builder-ui/index.html`) : éditeur visuel du `mapping.yml`. Layout 3 colonnes (réglages | preview live | YAML brut), sync bidirectionnel UI ↔ YAML, palette LCh recalculée côté client en temps réel quand on bouge un anchor. La page témoin de la preview reflète live le rename des familles, la fonte CSS et le thème (auto/light/dark, sync bidirectionnel). Export du `mapping.yml` final, le build CLI reste un `pnpm build` après coup. Voir `docs/builder-ui.md`.

## Pourquoi pas un fork direct du DSFR ?

Un fork direct (= patcher la source DSFR) crée un coût d'upgrade énorme : à chaque release upstream il faut rebaser les modifs. Avec l'approche override, le DSFR reste intact et nos modifs sont des fichiers SCSS appended au build. Aucun rebase.

La Phase 1 du projet (dans `../dsfr/`) a fait un fork direct pour valider la cible visuelle. La Phase 2 (ce repo) réimplémente proprement.

## Documentation

- `CLAUDE.md` — contexte projet pour assistant IA
- `docs/phase1-poc-report.md` — rapport Phase 1 + spec architecturale Phase 2 (source de vérité)
- `docs/implementation-plan.md` — plan d'exécution séquencé, état d'avancement
- `docs/icons.md` — pipeline d'icônes (rsync DSFR + Lucide overrides + adds)
- `docs/storybook.md` — comment le storybook est câblé sur le submodule DSFR
- `docs/example.md` — page témoin et serveur statique
- `docs/builder-ui.md` — UI web pour éditer mapping.yml en live
- `visual-references/` — captures de la cible visuelle à reproduire
