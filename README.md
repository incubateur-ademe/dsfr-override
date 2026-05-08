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
pnpm install
pnpm build
```

Sortie dans `dist/` :

- `dsfr-ademe.css` (~800 KB) — composants, scheme, core + overrides ADEME
- `utility-ademe.css` (~525 KB) — classes utilitaires (`.fr-background-*--blue-ate`, etc.)
- `fonts/` — Public Sans (primary) + Spectral (alt)

Avec `--minify` :

```bash
pnpm build --minify
# → dist/*.min.css en plus
```

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
| `pnpm test`           | Tests unitaires (LCh + palette + validate + e2e build)             |
| `pnpm storybook`      | Build + lance le Storybook DSFR sur :6006                          |

## Vérifier visuellement

Deux outils complémentaires, avec deux usages différents :

**Page témoin** (`example/index.html`, sert sur `:8080` via `node builder/serve.js`) — smoke test 5 secondes, exerce les composants critiques (typographie, palette, boutons, formulaires, alertes, cards) avec un panneau de diagnostic typo intégré qui confirme que `Marianne` (nom CSS) est bien servie par les fichiers Public Sans. Aucune dépendance lourde, démarre en `node` natif. Voir `docs/example.md`.

**Storybook** (`pnpm storybook`, sert sur `:6006`) — exploration exhaustive : 322 stories DSFR + 57 docs pages avec switcher light/dark et viewports. Réutilise les stories du submodule pristine, charge nos `dist/dsfr-ademe.css` + `dist/utility-ademe.css`. Voir `docs/storybook.md`.

## Pourquoi pas un fork direct du DSFR ?

Un fork direct (= patcher la source DSFR) crée un coût d'upgrade énorme : à chaque release upstream il faut rebaser les modifs. Avec l'approche override, le DSFR reste intact et nos modifs sont des fichiers SCSS appended au build. Aucun rebase.

La Phase 1 du projet (dans `../dsfr/`) a fait un fork direct pour valider la cible visuelle. La Phase 2 (ce repo) réimplémente proprement.

## Documentation

- `CLAUDE.md` — contexte projet pour assistant IA
- `docs/phase1-poc-report.md` — rapport Phase 1 + spec architecturale Phase 2 (source de vérité)
- `docs/implementation-plan.md` — plan d'exécution séquencé, état d'avancement
- `docs/storybook.md` — comment le storybook est câblé sur le submodule DSFR
- `docs/example.md` — page témoin et serveur statique
- `visual-references/` — captures de la cible visuelle à reproduire
