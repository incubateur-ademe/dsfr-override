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

**DSFR submodule = read-only.** Toutes les modifs passent par 4 mécanismes :
1. `:root {}` override pour les valeurs (palette hex, ombres, font-family)
2. `@layer ademe { ... }` pour les overrides ciblés (radius, card-fix box-shadow)
3. Build wrapper pour exclure header/footer (mask `.package.yml` puis restore en try/finally)
4. Post-process sed optionnel sur `dist/*.css` pour le rename des préfixes (`blue-france` → `blue-ate`)

À la fin de chaque build, `git status dsfr/` doit être propre.

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
