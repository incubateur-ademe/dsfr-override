# Phase 2 — Plan d'implémentation

> Lire d'abord : `phase1-poc-report.md` § "Phase 2 — Builder" pour la spec complète.
> Cible visuelle : `../visual-references/poc-ademe-v3-fullpage.png`.

## Statut

**Steps 0-10 livrés.** Step 11 (Playwright visual diff) **abandonné** au profit d'un autre angle de vérification : `example/index.html` (smoke test 5 s) + Storybook (322 stories DSFR exercées contre notre dist).

PostCSS pipeline ("plus tard") **livré** également.

| Step | Status | Commit (head) |
|---|---|---|
| 0 — Bootstrap | ✓ | `1d7115b` |
| 1 — Primitives LCh | ✓ | `b5278cf` |
| 2 — Build wrapper | ✓ | `9011eef` (+ refacto workspace au Step 3) |
| 3 — Generate palette | ✓ | `b24a185` |
| 4 — Generate font-face | ✓ | `7f77107` |
| 5 — Generate shadows + radius | ✓ | `7f77107` |
| 6 — Manual overrides + components.remove | ✓ | `d8182af` |
| 7 — Post-process rename | ✓ | `6328481` |
| 8 — Validate | ✓ | `6328481` |
| 9 — CLI + DX | ✓ | `6328481` |
| 10 — CI + automation | ✓ | `6328481` |
| 11 — Preview Playwright | ✗ abandonné | — |
| Bonus — Storybook + page témoin + utility build | ✓ | `82307e7` + `feda...` |
| Bonus — PostCSS pipeline (mqpacker + dedup + cssnano + banner ADEME) | ✓ | (head) |

**46 tests passent** (10 LCh, 4 palette, 13 build e2e, 19 validate). `pnpm validate --strict` passe sans warning.

## Principe vérifié en Phase 1

Le rendu cible est atteignable. Phase 1 l'a prouvé en patchant directement les sources DSFR. Phase 2 reproduit le même rendu via overrides, sans toucher au submodule.

## Critère de succès

Le builder, lancé avec `mapping.yml.example`, produit un `dist/dsfr-ademe.css` visuellement **identique** à la sortie Phase 1. Vérifié à la fois :

- Sur la page témoin (`example/index.html`) — palette ADEME (`--blue-ate-sun-113-625 = #001977`), fonts (Public Sans confirmée par canvas measurement), border-radius `0.75rem` partout, card-fix box-shadow inset, header/footer absents.
- Sur le storybook DSFR (`pnpm storybook`) — les 322 stories DSFR upstream rendues avec notre CSS, switcher light/dark fonctionnel, 0 erreur console hors 404 d'icônes vendor.
- Sur les ratios WCAG : matchent les valeurs Phase 1 documentées (sun-157=14.94, main-444=5.49, etc.) à ±0.02 près.

## Étapes (rétrospective)

### Step 0 — Bootstrap ✓

- `git init` + `git submodule add` DSFR pinné à v1.14.4
- `package.json` ESM + Node ≥20
- `builder/index.js` placeholder CLI
- 16 fichiers Public Sans copiés dans `assets/fonts/`

### Step 1 — Primitives LCh ✓

`builder/lch.js` — 13 fonctions exportées, chaîne sRGB → linear → XYZ(D65) → Lab → LCh, dichotomie de clamp gamut sur 30 itérations dans `lchToHex`. 10 tests via `node:test` natif (zéro dep). Anchors Phase 1 vérifiés à ±0.2 sur L*/C*/h°, ratios WCAG documentés à ±0.02.

### Step 2 — Build wrapper ✓

Évolution importante par rapport au plan initial :

- **Plan initial** : workspace tmp + mask/restore des `.package.yml` dans `dsfr/`.
- **Réalité** : workspace **physique** (`.tmp/workspace/dsfr/`, copie complète, cache invalidé sur HEAD du submodule). Le mask n'est pas nécessaire — on patche directement les fichiers du workspace puisque c'est jetable.

Raison de la bascule : Sass ne route **pas** les imports relatifs (`@use 'options'` depuis `_static.scss`) via les Importers customs — ils sont résolus via le filesystem du fichier parent. Donc l'idée d'un Importer custom pour intercepter `_options.scss` ne marche pas, le workspace physique est le seul levier propre. Documenté dans le commit `b24a185`.

### Step 3 — Generate palette ✓

`builder/generate/palette.js` + `profile-lch.js` — `computeFamilyPalette({anchor, recalibrate, addGrades, semanticRemap})` reproduit le profil LCh Phase 1 sur les 11 grades canoniques (75 → 975 + sun + main). 22 hex de référence Phase 1 matchent à **±3 bytes** par canal RGB (test exhaustif).

### Steps 4-5 — font-face / shadows / radius ✓

3 générateurs SCSS purs dans `builder/generate/`, orchestrateur dans `index.js`. Le `@layer ademe` initialement prévu pour les radius a été **retiré** : CSS Cascade Layers spec dit "unlayered > layered", or DSFR émet ses propres `.fr-input { border-radius: ... }` non-layered, donc notre `@layer ademe` perdait silencieusement. Émission au top level + late dans le fichier = cascade naturelle, on gagne.

### Step 6 — Manual overrides + components.remove ✓

`build/filter-components.js` strip les `@import` des composants exclus dans `component/{main,legacy,print}.scss` du workspace. Pour DSFR v1.14.4, **aucun** composant non-exemple ne référence header/footer dans son `style:` block, donc le strip suffit — pas besoin de patcher d'autres `.package.yml` comme prévu initialement.

`overrides/_card-fix.scss` et `overrides/_alert-fix.scss` sont des fichiers user-curated trackés (pas générés) ; référencés via `manual-overrides:` du mapping et `@import` en absolu dans `_index.scss`. `_alert-fix.scss` redessine la barre 40 px gauche de `.fr-alert` en `box-shadow: inset` pour qu'elle respecte `border-radius` (les linear-gradients DSFR ne se clippent pas avec `background-clip: border-box`). Le pattern peut être étendu à `.fr-callout` (gradient 4 px gauche) si le rendu accentué l'exige.

### Step 7 — Post-process rename ✓

`build/post-process.js` — sed sur `dist/*.css|js` avec safety-check : un token isolé (sans préfixe ni suffixe alpha-num) déclenche une erreur — protège des renames accidentels en commentaires/prose.

449 occurrences `blue-france → blue-ate` + 191 `red-marianne → red-laura` renommées proprement sur 2 fichiers (dsfr-ademe.css + utility-ademe.css).

### Step 8 — Validate ✓

3 sous-modules dans `builder/validate/` :

- `mapping.js` — schéma minimal + détection collision rename.
- `upstream-drift.js` — SHA-256 de 9 fichiers DSFR critiques dans `.ademe-baseline.json`.
- `wcag.js` — passe par `computeFamilyPalette` re-computed (pas par CSS scraping) parce que DSFR n'émet que les vars **combinées** (`sun-113-625`), pas les per-grade en standalone.

19 tests dédiés.

### Step 9 — CLI + DX ✓

`builder/index.js` réécrit : sous-commandes `build`/`generate`/`validate`/`baseline --update`/`upgrade`. Logs ANSI colorés (✓/⚠/✗/·), `--strict` transforme les warnings en erreurs, codes de sortie clairs. `--minify` ajouté avec PostCSS pipeline. Les scripts `pnpm` pointent dessus.

`palette <famille>` et `preview` du plan initial **non implémentés** — pas de besoin observé.

### Step 10 — CI + automation ✓

- `.github/workflows/build.yml` — build + test + `validate --strict` sur push/PR, dist en artifact (14j).
- `.github/workflows/upstream-drift.yml` — cron hebdo, pull `dsfr/` upstream, validate, ouvre une issue dédupliquée si drift.

### Step 11 — Preview (Playwright visual diff) ✗

Abandonné. Raison : Playwright ajoute ~200 MB de browsers binaries pour un usage marginal. Remplacé par :

- **Page témoin `example/index.html`** : smoke test ~5 s, 0 dépendance lourde, panneau de diagnostic typo intégré (canvas measurement). Cf. `docs/example.md`.
- **Storybook** (`pnpm storybook`) : 322 stories DSFR upstream + 57 docs autodocs avec switcher dark/light. Cf. `docs/storybook.md`.

Si un vrai diff visuel pixel-près devient nécessaire en CI, l'ajouter est encore possible — la doc storybook explique comment.

### Bonus — PostCSS pipeline ✓

`build/postcss-process.js` reproduit le pipeline DSFR officiel (mqpacker `sort:false` + combine-duplicated-selectors + discard-duplicates + banner ADEME inline). cssnano en mode `--minify`. Réduit `dsfr-ademe.css` de 33342 → **25445 lignes** (−24%, fewer than Phase 1 official build). Banner ADEME est la première ligne du fichier.

`build/write-results.js` extrait l'I/O disque pour que `compile()` et `postcssProcess()` restent purement transformationnels (string in / string out — testable trivialement).

Opt-out via `mapping.yml`:

```yaml
post-css:
  enabled: false      # défaut: true
  banner: false       # défaut: true
  banner-text: "..."  # texte custom, sinon default
```

### Bonus — Build du package `utility` ✓

`prepare()` retourne un array de **targets** au lieu d'un seul entry. Aujourd'hui : `dsfr` (composants + scheme + core + overrides) et `utility` (classes utilitaires `.fr-background-action-high--blue-ate` etc., consomme les vars de `dsfr-ademe.css`).

## Garde-fous en place

- **Test end-to-end** : `pnpm test` (46 tests) — palette match Phase 1, dsfr/ submodule reste clean après build, reproductibilité bit-pour-bit, banner ADEME unique.
- **`git status dsfr/` clean** : assertion explicite dans `build.test.js`. Verifié à chaque test e2e.
- **Reproductibilité** : 2 builds successifs produisent des bytes identiques (mqpacker, dedup et cssnano sont déterministes).
- **Drift upstream** : workflow GitHub hebdo + commande `pnpm validate` qui flag les changements de SHA sur 9 fichiers DSFR critiques.

## Stack finale

```
dsfr-override/
├── dsfr/                    # submodule v1.14.4 (read-only)
├── builder/
│   ├── lch.js               # primitives CIELAB
│   ├── index.js             # CLI
│   ├── serve.js             # serveur statique pour example/
│   ├── build/               # prepare / compile / restore / postcss / write-results / post-process / workspace / dsfr-config / filter-components / transform-options
│   ├── generate/            # palette / font-face / shadows / radius / index
│   └── validate/            # mapping / upstream-drift / wcag / index
├── overrides/               # _card-fix.scss (manuel) + générés (gitignored)
├── assets/fonts/            # PublicSans (16 fichiers)
├── example/index.html       # page témoin (smoke test)
├── storybook/               # workspace pnpm dédié (storybook 8.4 + addons)
├── dist/                    # output (gitignored)
├── mapping.yml              # source de vérité ADEME
├── .ademe-baseline.json     # SHA-256 des fichiers DSFR critiques
└── .github/workflows/       # build + upstream-drift cron
```

## Prochaines étapes possibles

- **Sourcemaps** : `compile()` accepte déjà `sourceMap: true` mais ce n'est pas câblé dans le CLI. Trivial à ajouter quand on en a besoin pour debug en navigateur.
- **`palette <famille>` CLI** : preview standalone d'une palette LCh donnée (anchor + profile). Utile pour l'itération design avant de toucher au mapping.
- **Branding Storybook ADEME** : `storybook/.storybook/dsfr-theme.js` reprend les couleurs DSFR (#000091, etc.) — à adapter quand le branding ADEME final est défini.
- **Stories ADEME custom** : ajouter `storybook/stories/*.stories.js` pour les composants ou patterns spécifiques ADEME (header/footer remplacements, cards spécifiques, etc.).
