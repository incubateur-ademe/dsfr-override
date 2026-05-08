# dsfr-override — Builder Phase 2 du fork ADEME

## Contexte

Ce repo est l'implémentation de la **Phase 2** du fork ADEME du DSFR.

La **Phase 1** (POC Token Swap) a été réalisée dans `../dsfr/` en modifiant directement le fork du DSFR (sed source + ajouts SCSS). Elle a validé la cible visuelle : palette LCh (Blue ATE + Red Laura), Public Sans, border-radius 0.75rem, ombres neutres, header/footer désactivés.

La **Phase 2** réimplémente proprement la même cible avec une stratégie **override-based** : le DSFR reste un submodule git **intouché**, le builder génère des fichiers SCSS d'override depuis un `mapping.yml`, lance le build DSFR avec ces overrides ajoutés, et applique d'éventuels post-process. Quand DSFR upstream évolue, `git submodule update` suffit — aucun rebase, aucun conflit.

## Source de vérité

- **`docs/phase1-poc-report.md`** — rapport complet de la Phase 1 + spec détaillée de l'archi Phase 2 (sections § "Phase 2 — Builder" à lire en premier)
- **`docs/implementation-plan.md`** — plan d'exécution séquencé pour la Phase 2
- **`visual-references/poc-ademe-v3-*.png`** — captures de la Phase 1 = cible visuelle à reproduire avec le builder
- **`mapping.yml.example`** — mapping qui doit produire le même rendu que la Phase 1

## Principe directeur

**DSFR submodule = read-only.** Toutes les modifs passent par 6 mécanismes :
1. **Workspace physique** (`.tmp/workspace/dsfr/`, copie complète, cache invalidé sur HEAD du submodule) où le builder patche `_options.scss` (palette LCh) et `component/{main,legacy,print}.scss` (filter components). Sass ne route pas les imports relatifs via les Importers customs, donc le workspace physique est la seule voie pour faire gagner notre `_options.scss` modifié.
2. **Overrides SCSS** dans `overrides/` (générés depuis `mapping.yml` : `_font-face.scss`, `_shadows.scss`, `_radius.scss`, `_icons.scss`) émis au top level — pas dans un `@layer ademe` (essayé puis abandonné : CSS Cascade Layers fait que `unlayered > layered`, et DSFR émet ses règles unlayered, donc le layer perdait silencieusement). La cascade naturelle "dernier déclaré gagne" suffit puisque nos overrides sont `@import`és en dernier.
3. **Manual overrides** : fichiers SCSS curated tracked (ex : `overrides/_card-fix.scss`) listés dans `mapping.yml.manual-overrides` et `@import`és absolument dans `_index.scss`.
4. **PostCSS pipeline** (mqpacker + dedup + cssnano `--minify` + banner ADEME inline) — opt-out via `mapping.yml.post-css.enabled: false`.
5. **Post-process sed** sur `dist/*.css|js` pour le rename des préfixes (`blue-france` → `blue-ate`, `red-marianne` → `red-laura`), avec safety-check qui flag les occurrences isolées (commentaires/prose).
6. **Pipeline icônes** : `dsfr/src/dsfr/core/icon/**` rsync vers `dist/icons/**`, puis `mapping.icons.overrides` remplace les `fr--*` par leurs équivalents `lucide-static`, et `mapping.icons.add` ajoute des `.fr-icon-<token>` à la cascade via `_icons.scss`.

À la fin de chaque build, `git status dsfr/` doit être propre — le workspace `.tmp/` est jetable, et `.config/` du submodule est dans son propre `.gitignore`.

## Stack technique

- Node.js ≥20 (cohérence avec DSFR upstream)
- DSFR en git submodule (`./dsfr/`)
- SASS via le build DSFR existant (`tool/build` du submodule)
- Aucune dépendance lourde côté builder : Node natif + un parser YAML minimal + un parser SCSS léger pour la palette

## Architecture cible

Cf. `docs/phase1-poc-report.md` § "Architecture" pour le détail. Résumé :

```
dsfr-override/
├── dsfr/                       # submodule (à ajouter)
├── mapping.yml                 # spec utilisateur
├── assets/fonts/               # fontes custom (PublicSans, etc.)
├── overrides/                  # SCSS générés depuis mapping.yml
├── builder/                    # pipeline Node.js
│   ├── lch.js                  # primitives CIELAB
│   ├── generate/               # transforme mapping → overrides/*.scss
│   ├── build/                  # wrappe le build DSFR
│   └── validate/               # détection drift upstream
├── dist/                       # output final
└── package.json
```

## Conventions

- Code SCSS : suivre les conventions DSFR (BEM `fr-*`, `@use` modules, spacing system `Nv` = N×0.25rem)
- Code JS : ESM, pas de TypeScript pour le builder (simplicité)
- Rien dans `dsfr/` n'est jamais commité (sauf le pointeur de submodule)
- Tous les overrides générés sont reproductibles depuis `mapping.yml` + version DSFR figée

## Contraintes légales (rappel)

- DSFR est sous MIT → fork légal
- Marianne (typographie) est exclue de la MIT → ne JAMAIS shipper les fichiers Marianne dans `dist/`
- Logos/branding État réservés aux Entités Autorisées (CGU art. 2) → ne JAMAIS inclure les composants header/footer originaux
- Le `rename` des préfixes (`blue-france` → `blue-ate`) renforce la neutralisation mais reste optionnel selon l'interprétation légale retenue
