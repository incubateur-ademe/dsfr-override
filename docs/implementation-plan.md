# Phase 2 — Plan d'implémentation

> Lire d'abord : `phase1-poc-report.md` § "Phase 2 — Builder" pour la spec complète.
> Cible visuelle : `../visual-references/poc-ademe-v3-fullpage.png`.

## Principe vérifié en Phase 1

Le rendu cible est atteignable. Phase 1 l'a prouvé en patchant directement les sources DSFR. Phase 2 reproduit le même rendu via overrides, sans toucher au submodule.

## Critère de succès

Le builder, lancé avec `mapping.yml.example`, produit un `dist/dsfr-ademe.css` visuellement **identique** à la sortie Phase 1 (à comparer pixel-près sur les screenshots de référence).

## Étapes

### Step 0 — Bootstrap (0.5j)

- [ ] `git init` + `git submodule add https://github.com/GouvernementFR/dsfr.git dsfr`
- [ ] Pin la version : `cd dsfr && git checkout v1.14.4`
- [ ] `package.json` minimal (Node ≥20, ESM, scripts `build`, `validate`, `generate`)
- [ ] Placeholder `builder/index.js` avec parsing CLI basique
- [ ] Copier les fontes `PublicSans-*.woff{2,}` dans `assets/fonts/` (récupérables depuis `../dsfr/src/dsfr/core/asset/fonts/` après Phase 1)

### Step 1 — Primitives LCh (0.5j)

`builder/lch.js` — fonctions pures, pas de dépendance externe :

- [ ] `hexToRgb(hex)` / `rgbToHex(rgb)` (sRGB 0-1)
- [ ] `srgbToLinear(c)` / `linearToSrgb(c)` (gamma)
- [ ] `xyzFromLinearRgb(rgb)` / `linearRgbFromXyz(xyz)` (matrice D65)
- [ ] `labFromXyz(xyz)` / `xyzFromLab(lab)`
- [ ] `lchFromLab(lab)` / `labFromLch(lch)`
- [ ] `hexToLch(hex)` / `lchToHex(L, C, h)` avec dichotomie pour clamp gamut
- [ ] `relativeLuminance(hex)` (WCAG)
- [ ] `contrastRatio(hex1, hex2)` (WCAG)
- [ ] Tests unitaires (au moins valider sur les 22 valeurs de la palette Phase 1)

### Step 2 — Build wrapper minimal (1-2j)

`builder/build/` — squelette du pipeline sans transformations encore :

- [ ] `prepare.js` : crée un workspace temporaire qui inclut le dsfr/ submodule + un point d'entrée custom qui import `dsfr/src/dsfr/dsfr.scss` + `overrides/_index.scss`
- [ ] `compile.js` : invoque le build DSFR (sass + rollup) sur le workspace
- [ ] `restore.js` : try/finally garantissant que `git status dsfr/` est clean après build
- [ ] Sanity check : un build "vide" (overrides/_index.scss vide) doit produire un dsfr.css identique au DSFR original

### Step 3 — Generate palette (1j)

`builder/generate/palette.js` :

- [ ] Parser `mapping.yml` (YAML minimal)
- [ ] Parser `dsfr/src/module/color/variable/_options.scss` pour extraire la liste des grades par famille
- [ ] Pour chaque famille mappée : appliquer le profil LCh (cf. `phase1-poc-report.md` § "Étape 4 — Profil LCh")
- [ ] Émettre `overrides/_palette.scss` avec `:root { --<famille>-<grade>: <hex>; }` pour chaque grade × état (default/hover/active)
- [ ] Gérer `add-grades` (créer des grades qui n'existaient pas) et `recalibrate-grade` (émettre l'ancien ET le nouveau)
- [ ] Gérer `semantic-remap` via `@layer ademe { :root { --<token>: var(--<new-target>); } }`
- [ ] Validation WCAG en post-génération avec auto-darken si nécessaire

**Test** : la palette générée pour le mapping ADEME doit matcher celle de la Phase 1 (cf. `_options.scss` actuel dans `../dsfr/`).

### Step 4 — Generate font-face (0.5j)

`builder/generate/font-face.js` :

- [ ] Émettre `overrides/_font-face.scss` avec `@font-face` pour chaque poids × style du mapping
- [ ] Si `css-name` ≠ DSFR : émettre aussi un override `:root { --font-family-primary: ... }`
- [ ] Copier les fichiers fontes vers `dist/fonts/` au build

### Step 5 — Generate shadows + radius (0.5j)

- [ ] `builder/generate/shadows.js` → `overrides/_shadows.scss` avec `:root { --raised-shadow-color: ... }` (light + dark)
- [ ] `builder/generate/radius.js` → `overrides/_radius.scss` avec `@layer ademe { ... }` pour chaque cible

### Step 6 — Manual overrides + components.remove (1j)

- [ ] `builder/generate/manual-overrides.js` : lit `manual-overrides:` du mapping et copie les fichiers SCSS curés (ex : card-fix) dans le workspace
- [ ] `builder/build/filter-packages.js` : pour chaque composant dans `components.remove`, mask `dsfr/src/dsfr/component/<name>/.package.yml` → `.disabled` AVANT compile
- [ ] Scanner les autres `.package.yml` et patcher les dépendances vers les composants exclus (en écrivant des fichiers patchés dans le workspace, pas dans `dsfr/`)
- [ ] `restore.js` : restaurer les `.package.yml` à la fin (try/finally)
- [ ] Sanity check : `git status dsfr/` clean après build

### Step 7 — Post-process rename (1j)

`builder/build/post-process.js` :

- [ ] Si `post-process.rename.enabled: true`, sed sur `dist/*.css` et `dist/*.js`
- [ ] Si `safety-check: true` : avant le sed, scanner les fichiers pour vérifier que `blue-france` et `red-marianne` n'apparaissent que dans des contextes attendus (noms de classes `\.fr-[a-z-]*--blue-france`, noms de var `--[a-z-]*-blue-france`, identifiants JS). Si une occurrence inattendue → error
- [ ] Vérifier qu'après rename, plus aucune occurrence des anciens noms

### Step 8 — Validate (2j)

`builder/validate/` :

- [ ] `mapping.js` : structure du mapping (schéma minimal)
- [ ] `upstream-drift.js` : maintenir un `.ademe-baseline.json` avec hashs SHA des fichiers DSFR critiques (`_options.scss`, `_sets.scss`, `_decisions.scss`, `_font-face.scss` setting, et chaque `.package.yml` des composants exclus). Au build, comparer et warn si drift
- [ ] Détecter les tokens manquants/en trop (le mapping référence des tokens qui n'existent pas, ou inversement)
- [ ] Détecter les renaming collisions (rename vers un nom déjà existant en upstream)
- [ ] `wcag.js` : valider les ratios sur le CSS final (post-rename)

### Step 9 — CLI + DX (1j)

- [ ] Sous-commandes : `build`, `generate`, `validate`, `upgrade`, `palette <famille>`, `baseline --update`, `preview`
- [ ] Option `--strict` (error sur les warns)
- [ ] Logs lisibles (couleur, structure)
- [ ] `npm scripts` qui mappent dessus

### Step 10 — CI + automation (1j)

- [ ] GitHub Action : build + validate à chaque push
- [ ] Cron hebdo : `git submodule update --remote && npx ademe-ds validate` → ouvre une issue si drift
- [ ] Tests (au moins : LCh primitives + comparaison palette POC)

### Step 11 — Preview (optionnel, 2j)

- [ ] `builder/preview.js` : Playwright qui rend `example/poc-ademe.html` avant/après et fait un diff visuel
- [ ] Seuil de tolérance configurable

## Estimation totale

| Phase | Effort |
|---|---|
| Bootstrap → Generate palette (Steps 0-3) | 3-3.5j |
| Font/shadows/radius/manual-overrides/components (Steps 4-6) | 2j |
| Post-process + Validate + CLI (Steps 7-9) | 4j |
| CI + Preview (Steps 10-11) | 1-3j |
| **Total** | **10-12.5j** |

## Ordre suggéré pour démarrer

1. **Step 0 + 1 + 2** en premier : on a le squelette + les primitives + un build "vide" qui marche. Indispensable pour itérer.
2. **Step 3** ensuite : c'est le cœur. Une fois la palette générée correctement, on peut comparer au CSS Phase 1 pour valider l'algo LCh.
3. **Steps 4-6** en parallèle : ils sont indépendants l'un de l'autre.
4. **Step 7** seulement quand 4-6 sont solides (le rename est destructif, on veut une base stable d'abord).
5. **Steps 8-11** en finition.

## Garde-fous à mettre en place tôt

- **Test end-to-end** : `npx ademe-ds build && diff dist/dsfr.css ../dsfr/dist/dsfr.css | wc -l` doit converger vers 0 (modulo l'ordre des règles)
- **`git status dsfr/` est clean** : à valider après chaque build dans les tests
- **Reproductibilité** : 2 builds successifs avec le même mapping doivent produire des bytes identiques
