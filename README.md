# dsfr-override

Builder de design system dérivé du DSFR. L'utilisateur édite un `mapping.yml`, le builder génère les overrides SCSS correspondants, lance le build DSFR et produit un `dist/` ré-employable. Le DSFR reste un submodule git intouché ; à chaque release upstream, `git submodule update --remote dsfr` suffit.

L'exemple `mapping.yml.example` reproduit la palette ADEME (Blue ATE + Red Laura, Public Sans, border-radius 0.75 rem, ombres neutres, header/footer désactivés) — point de départ utile pour démarrer une autre déclinaison.

> 🌐 **Builder UI en ligne** : <https://incubateur-ademe.github.io/dsfr-override/builder-ui/> — édition visuelle du mapping avec preview live (palette LCh, page témoin, validation utilitaires). Build prod déployée à chaque push sur `main`.

## Quick start

```bash
git clone <this-repo>
cd dsfr-override
git submodule update --init --recursive
pnpm install
pnpm build
```

Sortie dans `dist/` :

- `dsfr-ademe.css` (~800 KB) — composants, scheme, core + overrides
- `utility-ademe.css` (~525 KB) — classes utilitaires (`.fr-background-*--blue-ate`, etc.)
- `fonts/` — Public Sans (primary) + Spectral (alt)

> Le repo est un **pnpm workspace** : la racine contient le builder, l'orchestration et les tests ; `storybook/` est un sous-package isolé (~500 MB de deps Storybook). `pnpm install` à la racine installe les deux.

## Commandes

| Commande                  | Effet                                                              |
|---------------------------|--------------------------------------------------------------------|
| `pnpm build`              | Génère overrides → compile sass → PostCSS → rename → écrit `dist/` |
| `pnpm build --minify`     | Idem + cssnano → `dist/*.min.css`                                  |
| `pnpm build --sourcemap`  | Idem + `dist/*.css.map` linkés via `sourceMappingURL`              |
| `pnpm generate`           | N'émet que `overrides/_*.scss` (pas de compilation sass)           |
| `pnpm palette <famille>`  | Affiche la palette LCh calculée pour une famille du mapping        |
| `pnpm validate`           | Mapping schema + drift upstream + WCAG sur la palette LCh          |
| `pnpm validate -- --strict` | Idem, mais les warnings deviennent des erreurs                   |
| `pnpm baseline`           | Snapshot SHA-256 des fichiers DSFR critiques → `.ademe-baseline.json` |
| `pnpm upgrade`            | `git submodule update --remote dsfr` puis `validate`               |
| `pnpm typecheck`          | `tsc --noEmit` (strictest + node22)                                |
| `pnpm test`               | 54 tests : LCh primitives + palette match cible + validate + build e2e |
| `pnpm serve`              | Serveur statique (port 8080 par défaut) pour `example/` et `builder-ui/` |
| `pnpm build:ui`           | Bundle prod statique du builder-ui vers `builder-ui/dist/`         |
| `pnpm storybook`          | `pnpm build` + lance le Storybook DSFR sur :6006                   |

`--minify` et `--sourcemap` sont des flags CLI réservés au build (release / CI). Ils n'ont pas d'équivalent dans `mapping.yml` : ce sont des décisions opérationnelles, pas des décisions de design system. La section `post-css:` du mapping contrôle uniquement les passes appliquées en mode normal (mqpacker + dedup + banner) ; elles s'enchaînent automatiquement en mode `--minify`.

## Vérifier visuellement

| Quand | Outil | Démarrage | URL |
|---|---|---|---|
| Smoke test rapide après `pnpm build` (« rien n'a cassé d'évident ? ») | Page témoin | < 1 s, zéro dep | `pnpm serve` → `:8080/example/index.html` |
| Explorer un composant DSFR particulier ou démontrer le rendu | Storybook | ~30 s premier démarrage, ~5 s ensuite | `pnpm storybook` → `:6006` |
| Éditer le mapping en live (local) | Builder UI | < 1 s | `pnpm serve` → `:8080/builder-ui/index.html` |
| Éditer le mapping en ligne | Builder UI prod | aucun setup | <https://incubateur-ademe.github.io/dsfr-override/builder-ui/> |

**Page témoin** : un seul HTML qui exerce typo / palette / boutons / formulaires / alertes / cards / classes utilitaires renommées. Diagnostic typographie qui confirme via canvas measurement que la fonte primary est bien rendue par les fichiers déclarés. Voir `docs/example.md`.

**Storybook** : 322 stories DSFR + 57 docs pages avec switcher light/dark et viewports. Stories piochées dans le submodule pristine (zéro copie). Le branding du Storybook lui-même (couleurs des chrome / fonte) suit la palette du `mapping.yml`. Voir `docs/storybook.md`.

**Builder UI** : éditeur visuel du `mapping.yml`. Layout 3 colonnes (réglages | preview live | YAML brut), sync bidirectionnel UI ↔ YAML, palette LCh recalculée côté client. La page témoin reflète live le rename des familles, la fonte CSS et le thème (auto/light/dark, sync bidirectionnel). Édition complète : couleurs (24 familles + utilitaires), border-radius, ombres, icônes (overrides Lucide + adds), manual-overrides, post-process. Voir `docs/builder-ui.md`.

## Pourquoi pas un fork direct du DSFR ?

Un fork direct (= patcher la source DSFR) crée un coût d'upgrade énorme : à chaque release upstream il faut rebaser les modifs. Avec l'approche override, le DSFR reste intact et nos modifs sont des fichiers SCSS appended au build. Aucun rebase.

## Licence

[MIT](./LICENSE) — © ADEME and contributors. Le projet dérive du DSFR (lui-même MIT). Voir le fichier `LICENSE` pour les notes sur les assets tiers expédiés dans `dist/` (typographies SIL OFL, icônes Lucide ISC) et les éléments expressément exclus du build (Marianne, branding État).

## Documentation

- `CLAUDE.md` — contexte projet pour assistant IA
- `docs/architecture.md` — spec architecturale détaillée (pipeline, profil LCh, schéma `mapping.yml`)
- `docs/builder-ui.md` — UI web pour éditer mapping.yml en live
- `docs/storybook.md` — comment le storybook est câblé sur le submodule DSFR
- `docs/example.md` — page témoin et serveur statique
- `docs/icons.md` — pipeline d'icônes (rsync DSFR + Lucide overrides + adds)
- `docs/history.md` — comment le projet en est arrivé à son état actuel (POC, choix d'archi)
- `visual-references/` — captures de référence pour la palette ADEME
