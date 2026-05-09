# dsfr-override

Builder de design system dérivé du DSFR. Le DSFR reste un submodule git **intouché** ; le builder génère des fichiers SCSS d'override depuis un `mapping.yml`, lance le build DSFR avec ces overrides ajoutés, et applique d'éventuels post-process. Quand DSFR upstream évolue, `git submodule update` suffit — aucun rebase, aucun conflit.

L'exemple de configuration `mapping.yml.example` reproduit la palette ADEME (Blue ATE + Red Laura, Public Sans, border-radius 0.75 rem, ombres neutres, header/footer désactivés).

## Source de vérité

- **`mapping.yml.example`** — schéma cible avec un branding ADEME prêt-à-l'emploi
- **`docs/architecture.md`** — spec architecturale détaillée (pipeline, profil LCh, schéma `mapping.yml`)
- **`docs/builder-ui.md`** — éditeur visuel `mapping.yml` avec preview live

## Principe directeur

**DSFR submodule = read-only.** Toutes les modifs passent par 6 mécanismes :

1. **Workspace physique** (`.tmp/workspace/dsfr/`, copie complète, cache invalidé sur HEAD du submodule) où le builder patche `_options.scss` (palette LCh) et `component/{main,legacy,print}.scss` (filter components). Sass ne route pas les imports relatifs via les Importers customs, donc le workspace physique est la seule voie pour faire gagner notre `_options.scss` modifié.
2. **Overrides SCSS** dans `overrides/` (générés depuis `mapping.yml` : `_font-face.scss`, `_shadows.scss`, `_radius.scss`, `_icons.scss`) émis au top level — pas dans un `@layer ademe` (essayé puis abandonné : CSS Cascade Layers fait que `unlayered > layered`, et DSFR émet ses règles unlayered, donc le layer perdait silencieusement). La cascade naturelle « dernier déclaré gagne » suffit puisque nos overrides sont `@import`és en dernier.
3. **Manual overrides** : fichiers SCSS curated trackés (ex : `overrides/_card-fix.scss`, `overrides/_alert-fix.scss`) listés dans `mapping.yml.manual-overrides` et `@import`és absolument dans `_index.scss`.
4. **PostCSS pipeline** (mqpacker + dedup + cssnano `--minify` + banner inline) — opt-out via `mapping.yml.post-css.enabled: false`.
5. **Post-process sed** sur `dist/*.css|js` pour le rename des préfixes (`blue-france` → `blue-ate`, `red-marianne` → `red-laura`), avec safety-check qui flag les occurrences isolées (commentaires/prose).
6. **Pipeline icônes** : `dsfr/src/dsfr/core/icon/**` rsync vers `dist/icons/**`, puis `mapping.icons.overrides` remplace les `fr--*` par leurs équivalents `lucide-static`, et `mapping.icons.add` ajoute des `.fr-icon-<token>` à la cascade via `_icons.scss`.

À la fin de chaque build, `git status dsfr/` doit être propre — le workspace `.tmp/` est jetable, et `.config/` du submodule est dans son propre `.gitignore`.

## Stack technique

- Node.js ≥22 (`.nvmrc`), pnpm workspace
- TypeScript strict (`@tsconfig/strictest` + `@tsconfig/node22`), runtime via `tsx`
- DSFR en git submodule (`./dsfr/`)
- SASS via le build DSFR existant (`tool/build` du submodule)
- esbuild pour le bundle UI (dev à la volée dans `serve.ts`, prod via `pnpm build:ui`)

## Architecture

```
dsfr-override/
├── dsfr/                       # submodule (read-only)
├── mapping.yml                 # spec utilisateur
├── assets/fonts/               # fontes custom (PublicSans, etc.)
├── overrides/                  # SCSS curated (.scss trackés) + générés (gitignored)
├── builder/                    # pipeline Node.js (TS)
│   ├── lch.ts                  # primitives CIELAB
│   ├── types.ts                # schema Mapping + I/O des étapes
│   ├── generate/               # transforme mapping → overrides/*.scss
│   ├── build/                  # wrappe le build DSFR
│   ├── validate/               # détection drift upstream + WCAG + schema
│   ├── serve.ts                # serveur statique + APIs builder-UI
│   └── index.ts                # CLI (build / generate / validate / palette / baseline / upgrade)
├── builder-ui/                 # éditeur visuel mapping.yml (TS, esbuild)
├── scripts/build-ui.ts         # bundle prod statique vers builder-ui/dist/
├── storybook/                  # workspace pnpm dédié (theme piloté par mapping)
├── example/index.html          # page témoin (smoke test)
├── dist/                       # output final (gitignored)
└── tsconfig.json               # strictest + node22 + lib DOM
```

## Conventions

- Code SCSS : suivre les conventions DSFR (BEM `fr-*`, `@use` modules, spacing system `Nv` = N×0.25rem)
- Code TS : ESM, NodeNext, `verbatimModuleSyntax`, imports avec extension `.js`
- Rien dans `dsfr/` n'est jamais commité (sauf le pointeur de submodule)
- Tous les overrides générés sont reproductibles depuis `mapping.yml` + version DSFR figée

## Contraintes légales (rappel)

- DSFR est sous MIT → fork légal
- Marianne (typographie) est exclue de la MIT → ne JAMAIS shipper les fichiers Marianne dans `dist/`
- Logos/branding État réservés aux Entités Autorisées (CGU art. 2) → ne JAMAIS inclure les composants header/footer originaux
- Le `rename` des préfixes (`blue-france` → `blue-ate`) renforce la neutralisation mais reste optionnel selon l'interprétation légale retenue
