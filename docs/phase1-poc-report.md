# Phase 1 — POC Token Swap : Rapport et Architecture

> Statut : **Phase 1 complète**, palette migrée vers approche LCh (CIELAB) + renommage des préfixes appliqué.
>
> Versions du POC :
> - v1 (HSL piecewise, noms `blue-france`/`red-marianne` conservés) — historique, abandonnée
> - **v2 (LCh CIELAB, renommage `blue-ate`/`red-laura`) — version actuelle**

## Objectif

Valider qu'on peut produire un design system visuellement et nominalement distinct du DSFR en remplaçant les tokens directement dans le repo forké, sans casser la mécanique interne, **tout en garantissant la conformité RGAA AA**.

---

## Modifications réalisées

### 1. Typographie

**Marianne → Public Sans**

| Poids | Fichier original | Fichier remplaçant |
|-------|------------------|--------------------|
| Light 300 | `Marianne-Light.woff2` | `PublicSans-Light.woff2` |
| Light 300 italic | `Marianne-Light_Italic.woff2` | `PublicSans-LightItalic.woff2` |
| Regular 400 | `Marianne-Regular.woff2` | `PublicSans-Regular.woff2` |
| Regular 400 italic | `Marianne-Regular_Italic.woff2` | `PublicSans-Italic.woff2` |
| Medium 500 | `Marianne-Medium.woff2` | `PublicSans-Medium.woff2` |
| Medium 500 italic | `Marianne-Medium_Italic.woff2` | `PublicSans-MediumItalic.woff2` |
| Bold 700 | `Marianne-Bold.woff2` | `PublicSans-Bold.woff2` |
| Bold 700 italic | `Marianne-Bold_Italic.woff2` | `PublicSans-BoldItalic.woff2` |

Chaque poids est fourni en woff + woff2. Source : [uswds/public-sans](https://github.com/uswds/public-sans).

**Spectral** conservée telle quelle (déjà open source, SIL OFL).

**Fichiers modifiés :**
- `src/dsfr/core/asset/fonts/` — suppression Marianne, ajout Public Sans
- `src/dsfr/core/style/typography/setting/_font-face.scss` — nom `'Marianne'` → `'Public Sans'`, noms de fichiers ajustés

**Point d'attention :** le nom de la fonte est défini uniquement dans `_font-face.scss`. Tout le reste du système utilise les tokens `primary` / `alt`, jamais le nom en dur.

---

### 2. Palette de couleurs

**Renommage des préfixes (rupture explicite)**

| Avant | Après |
|-------|-------|
| `blue-france` | `blue-ate` |
| `red-marianne` | `red-laura` |

Le renommage est appliqué partout (SCSS, YML, EJS, MD). Les classes CSS publiques deviennent `.fr-background-action-high--blue-ate`, `.fr-text-title-red-laura`, etc. Cette rupture nominale est volontaire : elle force les consommateurs du fork à migrer consciemment plutôt que de subir un drift silencieux.

**Anchors et grades pivots**

| Famille | Avant (DSFR) | Après (ADEME) |
|---------|--------------|---------------|
| `blue-ate-sun-157` | `blue-france-sun-113 #000091` | `#001977` |
| `blue-ate-main-444` | `blue-france-main-525 #6a6af4` | `#4950FB` |
| `blue-ate-625` | `blue-france-625 #8585F6` | `#907FFF` |
| `red-laura-sun-157` | `red-marianne-425 #c9191e` (pas de sun explicite) | `#560200` |
| `red-laura-main-560` | `red-marianne-main-472 #e1000f` | `#FF3333` |
| `red-laura-625` | `red-marianne-625 #f95c5e` | `#F95C4E` |

Les **grades changent** parce que dans le DSFR le grade encode `L*×10`. Les nouvelles anchors ont des luminances différentes, donc les noms de grade sont recalculés (`main-525` → `main-444`, `main-472` → `main-560`, `sun-113` → `sun-157`). Avantage : aucun import existant ne casse silencieusement, tout casse explicitement.

**Génération de la palette : remapping LCh (CIELAB)**

L'approche v1 (HSL piecewise) a été remplacée par un remapping CIELAB qui préserve la cohérence perceptuelle. Pour chaque famille, on calcule chaque grade avec :

```
LCh_target = (L_target_grade, C_anchor × C_factor_grade, h_anchor)
```

avec un profil par grade (cf. §4 de l'analyse complémentaire) qui définit `(L_target, C_factor, ΔL_hover, ΔL_active, C_factor_hover, C_factor_active)`. Si la couleur cible sort du gamut sRGB, on réduit C\* par dichotomie jusqu'à rentrer.

Le profil reproduit la hiérarchie tonale du DSFR officiel :

| Grade | L* cible | C* factor | Rôle |
|-------|---------|-----------|------|
| 75    | 11.0    | 0.24      | Tons sombres |
| 100   | 14.2    | 0.27      | Tons sombres |
| 125   | 17.2    | 0.28      | Tons sombres |
| 200   | 24.3    | 0.59      | Tons sombres saturés |
| sun   | 15.7    | 1.10      | Texte light mode (cible 4.5:1 sur blanc) |
| main  | L₀      | 1.00      | UI bidirectionnelle (cible 3:1) |
| 625   | 60.3    | 0.80      | Texte dark mode (cible 4.5:1 sur fond sombre) |
| 850   | 82.8    | 0.33      | Tons clairs |
| 925   | 90.9    | 0.17      | Tons très clairs |
| 950   | 93.9    | 0.12      | Tons très clairs |
| 975   | 96.8    | 0.06      | Tons très clairs |

**Conformité RGAA AA vérifiée**

| Token | Hex | /blanc | /noir | Niveau |
|---|---|---:|---:|---|
| `blue-ate-sun-157`   | `#001977` | 14.94 | 1.41 | AAA texte light |
| `blue-ate-main-444`  | `#4950FB` |  5.49 | 3.82 | AA texte light + AA UI dark |
| `blue-ate-625`       | `#907FFF` |  3.15 | 6.67 | AA UI light + AA texte dark |
| `red-laura-sun-157`  | `#560200` | 14.95 | 1.40 | AAA texte light |
| `red-laura-main-560` | `#FF3333` |  3.64 | 5.77 | AA UI light + AA texte dark |
| `red-laura-625`      | `#F95C4E` |  3.15 | 6.67 | AA UI light + AA texte dark |

Décision : on ne durcit **pas** AA-texte sur les `sun-157` (impossible mathématiquement de satisfaire 4.5:1 sur blanc ET sur noir). Ces tokens sont light-mode-only par construction, comme dans le DSFR officiel.

**Fichiers modifiés :**
- `src/module/color/variable/_options.scss` — blocs `blue-ate-*` et `red-laura-*` en remplacement
- `src/module/color/variable/_static.scss` — variables Sass `$blue-ate` / `$red-laura`
- `src/module/color/variable/_sets.scss` — mapping shades light/dark, dont remap `red-marianne-425` → `red-laura-sun-157`
- 48 fichiers SCSS (composants/scheme), 2 EJS, plusieurs MD, via sed global

#### Architecture du système de couleurs DSFR

Le système est en 4 couches :

```
_options.scss          Valeurs hex brutes par grade
       ↓
_sets.scss             Paires light/dark mode par famille
       ↓
_decisions.scss        Rôles sémantiques (background, text, border...)
       ↓
function/_colors.scss  Résolution SCSS → CSS custom properties
```

**Format des options :**

```scss
// 3 valeurs : default / hover / active
blue-ate-625: #907FFF #BDACFF #D0C2FF,

// 5 valeurs pour les grades main : default / hover-light / active-light / hover-dark / active-dark
blue-ate-main-444: #4950FB #8C7CFF #A492FF #8C7CFF #A492FF,
```

**Rôles fonctionnels (3 niveaux) :**

| Rôle | L* typique | Usage prescrit | Cible RGAA |
|------|-----------|----------------|------------|
| `sun-XXX` | 15–25 (sombre saturé) | Texte/icônes en **light mode** | 4.5:1 sur blanc |
| `XXX` (625, ou `moon-XXX`) | 60–70 (clair saturé) | Texte/icônes en **dark mode** | 4.5:1 sur fond sombre |
| `main-XXX` | 44–56 (médian) | UI bidirectionnelle (boutons, fonds, bordures) | 3:1 dans les deux modes |

Aucune couleur seule ne satisfait 4.5:1 sur blanc ET noir simultanément (impossibilité mathématique). Le système utilise donc 3 tokens distincts pour couvrir les besoins.

---

### 3. Ombres

**Fichier modifié :** `src/module/elevation/variable/_colors.scss`

| Contexte | Ancien | Nouveau |
|----------|--------|---------|
| Light | `rgba(0, 0, 18, 16%)` | `rgba(0, 0, 0, 16%)` |
| Dark | `rgba(0, 0, 18, 32%)` | `rgba(0, 0, 0, 32%)` |

Suppression de la teinte bleu marine (#000012) héritée du DSFR. Les niveaux d'élévation (raised, overlap, lifted) restent identiques.

---

### 4. Border-radius

**Valeur cible :** `0.75rem` (12px), soit `spacing.space(3v)` dans le système DSFR.

Le DSFR n'a pas de token centralisé pour le border-radius. Chaque composant définit le sien. Modifications composant par composant :

| Composant | Fichier | Avant | Après |
|-----------|---------|-------|-------|
| Input | `component/input/style/_module.scss` | `1v 1v 0 0` | `3v 3v 0 0` |
| Input addon | idem | `1v 0 0 0` / `0 1v 0 0` | `3v 0 0 0` / `0 3v 0 0` |
| Select | `component/select/style/_module.scss` | `1v 1v 0 0` | `3v 3v 0 0` |
| Search input | `component/search/style/_module.scss` | `1v 0 0` | `3v 0 0` |
| Search button | idem | `0 1v 0 0` | `0 3v 0 0` |
| Badge | `component/badge/style/module/_default.scss` | `1v` | `3v` |
| Segmented | `component/segmented/style/module/_default.scss` | `1v` | `3v` |
| Follow | `component/follow/style/_module.scss` | `1v` | `3v` |
| **Card** | `component/card/style/module/_default.scss` | aucun | `3v` + `overflow: hidden` |
| **Alert** | `component/alert/style/_module.scss` | aucun | `3v` |

**Modifications POC complémentaires :**

| Composant | Fichier | Avant | Après |
|-----------|---------|-------|-------|
| Input | `component/input/style/_module.scss` | `3v 3v 0 0` (top corners) | `3v` (4 coins) |
| Input addon (first) | idem | `3v 0 0 0` | `3v 0 0 3v` |
| Input addon (last)  | idem | `0 3v 0 0` | `0 3v 3v 0` |
| Select | `component/select/style/_module.scss` | `3v 3v 0 0` | `3v` (4 coins) |
| Search input | `component/search/style/_module.scss` | `3v 0 0` | `3v 0 0 3v` |
| Search button | idem | `0 3v 0 0` | `0 3v 3v 0` |

**Bug corrigé : bordures de card qui ne suivent pas le radius**

Le DSFR simule les bordures de card via 4 `linear-gradient` en `background-image` (un par côté). Les gradients sont des lignes droites positionnées en absolu, ce qui ne suit pas `border-radius` — les coins arrondis créent des trous visibles entre les lignes.

**Solution override SCSS** (sans modifier `_default.scss` ni `_scheme.scss`) :

Fichier : `src/dsfr/component/card/style/module/_radius-fix.scss`

```scss
#{ns(card)}:not(#{ns(card)}--no-border):not(#{ns(card)}--shadow) {
  background-image: none;
  padding: 0;
  box-shadow: inset 0 0 0 1px var(--border-default-grey);
}
```

Importé via 1 ligne ajoutée à `_module.scss` :

```scss
@import 'module/radius-fix';
```

Le `box-shadow: inset` respecte naturellement `border-radius`, ce qui produit une bordure continue sur les coins arrondis. Ce pattern (override SCSS isolé + import unique) est le modèle à reproduire pour le builder Phase 2 via le mécanisme `overrides/`.

**Non modifiés (intentionnel) :**
- Radio (`50%`, `6v`, `2v`) — géométrie sémantique
- Toggle (`3v`, `50%`) — déjà arrondi
- Range (`1.5v`, `50%`) — contrôles natifs
- Checkbox (`1v`) — carré attendu
- `border-radius: 0` — resets intentionnels
- Buttons/Tags — déjà en pill shape (`$min-height * 0.5`)

---

### 5. Header / Footer

**Supprimés du build.** L'utilisateur du DS ADEME doit construire ses propres header/footer.

**Mécanisme :** le build auto-génère les fichiers d'import (`main.scss`, `legacy.scss`, `print.scss`, `main.js`) via `tool/generate/concatenate.js`, qui scanne les dossiers ayant un `.package.yml`. Commenter/supprimer les imports est inutile — ils sont régénérés.

**Méthode appliquée :**
1. Renommage `.package.yml` → `.package.yml.disabled` dans `component/header/` et `component/footer/`
2. Suppression du `config.json` en cache (`.config/config.json`) pour forcer la régénération
3. Nettoyage des dépendances dans 7 fichiers `.package.yml` :

| Fichier | Dépendance retirée |
|---------|-------------------|
| `scheme/.package.yml` | example: header, footer |
| `analytics/.package.yml` | script: header / example: header, footer |
| `component/display/.package.yml` | example: header, footer |
| `component/notice/.package.yml` | example: header |
| `component/skiplink/.package.yml` | example: header, footer |
| `layout/page/response/not-found/.package.yml` | example: header, footer |
| `layout/page/response/unexpected/.package.yml` | example: header, footer |
| `layout/page/register/.package.yml` | example: header, footer |
| `layout/page/login/.package.yml` | example: header, footer |

---

### 6. Page témoin

Fichier : `example/poc-ademe.html`

Page HTML qui charge `dsfr.css` + `utility/utility.css` et présente :
- Typographie Public Sans + Spectral
- Palettes Blue ATE et Red Laura (11 grades chacune)
- Tokens sémantiques (action-high, alt, contrast)
- Composants : boutons, cards, formulaires, badges, alertes, tags, liens
- Tableau récapitulatif des modifications POC
- Vérification contraste RGAA AA

Validation visuelle OK via Playwright (screenshot `poc-ademe-v2-fullpage.png`).

---

## Mapping complet POC v2

Spec d'entrée pour le builder Phase 2.

```yaml
version: 1
dsfr: "1.14.4"

typography:
  primary:
    name: "Public Sans"
    fallback: "arial, sans-serif"
    source: "https://github.com/uswds/public-sans"
    weights:
      300: { normal: "PublicSans-Light", italic: "PublicSans-LightItalic" }
      400: { normal: "PublicSans-Regular", italic: "PublicSans-Italic" }
      500: { normal: "PublicSans-Medium", italic: "PublicSans-MediumItalic" }
      700: { normal: "PublicSans-Bold", italic: "PublicSans-BoldItalic" }
  alt: keep                           # Spectral conservée

colors:
  blue-france:
    rename: blue-ate                  # rupture explicite des noms publics
    anchor:
      hex: "#4950FB"                  # main, sert aussi de pivot LCh
    generation: lch-remap             # CIELAB-based, profil DSFR strict
    grades:
      sun: { L: 15.7, c-factor: 1.10 }
      main: { L: auto, c-factor: 1.00 }     # auto = L* de l'anchor
      "625": { L: 60.3, c-factor: 0.80 }
      # 75/100/125/200/850/925/950/975 : valeurs par défaut du profil
    wcag:
      sun:  { min: 4.5, against: "#ffffff" }
      main: { min: 3.0, against: "#ffffff" }
      "625": { min: 4.5, against: "#1e1e1e" }

  red-marianne:
    rename: red-laura
    anchor:
      hex: "#FF3333"
    generation: lch-remap
    # red n'avait pas de sun-XXX explicite dans DSFR : on en crée un
    add-grades:
      sun: { L: 15.7, c-factor: 1.10 }
    # red-marianne-425 → red-laura-sun-157 dans _sets.scss (semantic remap)
    semantic-remap:
      "425": "sun-157"
    grades:
      main: { L: auto, c-factor: 1.00 }
      "625": { L: 60.3, c-factor: 0.80 }
    wcag:
      sun:  { min: 4.5, against: "#ffffff" }
      main: { min: 3.0, against: "#ffffff" }
      "625": { min: 4.5, against: "#1e1e1e" }

elevation:
  shadow-color:
    light: "rgba(0, 0, 0, 0.16)"
    dark: "rgba(0, 0, 0, 0.32)"

border-radius:
  base: "0.75rem"                    # 3v dans le système spacing DSFR
  base-spacing: "3v"
  targets:
    - { selector: input, value: "3v 3v 0 0" }
    - { selector: select, value: "3v 3v 0 0" }
    - { selector: search-input, value: "3v 0 0" }
    - { selector: search-button, value: "0 3v 0 0" }
    - { selector: badge, value: "3v" }
    - { selector: segmented, value: "3v" }
    - { selector: follow, value: "3v" }
  add:                               # composants sans radius natif
    - { selector: card, value: "3v", overflow: true }
    - { selector: alert, value: "3v" }
  preserve:
    - "50%"
    - "0"
    - "$min-height * 0.5"

components:
  remove:
    - header
    - footer
```

---

## Phase 2 — Builder

### Vision

Le builder prend le **DSFR en submodule sans le toucher**, génère des fichiers d'override depuis `mapping.yml`, lance le build DSFR avec les overrides ajoutés, et produit un design system dérivé. Quand le DSFR upstream évolue, `git submodule update` suffit — aucun patch à rebaser, aucun conflit de merge.

**Principe directeur** : DSFR submodule = source de vérité immuable. Toutes les modifs passent par 4 mécanismes d'override propres :

| Mécanisme | Pour quoi | Où dans le pipeline |
|---|---|---|
| **`:root {}` override** | Valeurs (palette hex, couleurs ombres, font-family) | SCSS appended au build |
| **`@layer ademe`** | Overrides ciblés (border-radius par composant, card-fix box-shadow) | SCSS appended au build, layer prioritaire |
| **Build wrapper** | Exclure header/footer du bundle | Filtre les `.package.yml` avant `tool/build` |
| **Post-process regex** | Rename (`blue-france` → `blue-ate`) si activé | Sed sur `dist/dsfr.css` après build |

Le rename est **optionnel** dans le mapping. Sans rename, les classes publiques restent `fr-background-action-high--blue-france` mais avec les valeurs ADEME — c'est suffisant si la lecture légale tolère que les classes CSS internes contiennent "blue-france". Avec rename, le bundle final n'a plus aucune trace de la terminologie État.

### Architecture

```
dsfr-ademe/
├── dsfr/                          # git submodule → upstream DSFR (READ-ONLY)
├── mapping.yml                    # spec de transformation
├── assets/
│   └── fonts/
│       └── PublicSans-*.woff2     # fontes custom (copiées dans dist/)
├── overrides/                     # SCSS générés depuis mapping.yml
│   ├── _palette.scss              # :root { --blue-france-sun-113: ...; }
│   ├── _shadows.scss              # :root { --raised-shadow-color: ...; }
│   ├── _font-face.scss            # @font-face Marianne → PublicSans files
│   ├── _radius.scss               # @layer ademe { .fr-input { ... } }
│   ├── _card-fix.scss             # @layer ademe { box-shadow inset trick }
│   └── _index.scss                # @forward all overrides
├── builder/
│   ├── index.js                   # orchestrateur CLI
│   ├── lch.js                     # primitives sRGB ↔ XYZ ↔ Lab ↔ LCh
│   ├── generate/
│   │   ├── palette.js             # mapping → _palette.scss (LCh)
│   │   ├── shadows.js             # mapping → _shadows.scss
│   │   ├── font-face.js           # mapping → _font-face.scss
│   │   ├── radius.js              # mapping → _radius.scss
│   │   └── manual-overrides.js    # copie overrides/_*.scss curés (card-fix, etc.)
│   ├── build/
│   │   ├── prepare.js             # symlinke dsfr/ + injecte overrides/_index.scss
│   │   ├── filter-packages.js     # masque temporairement les .package.yml exclus
│   │   ├── compile.js             # invoque tool/build du DSFR
│   │   └── post-process.js        # sed rename + strip JS si nécessaire
│   └── validate/
│       ├── mapping.js             # validation mapping vs DSFR upstream
│       ├── wcag.js                # vérification contraste AA sur la palette générée
│       └── upstream-drift.js      # détecte les changements upstream qui cassent les overrides
├── dist/                          # output final
└── package.json
```

### Pipeline de build

```
1. VALIDATE          mapping.yml cohérent avec dsfr/ ?
                     → check tokens, hashs des fichiers critiques, WCAG cibles
2. GENERATE          mapping.yml → overrides/*.scss
                     (palette LCh, shadows, font-face, radius)
3. PREPARE           Symlink dsfr/ vers workspace + ajoute overrides/_index.scss
                     comme dernier @import du dsfr.scss principal
4. FILTER            Masque les .package.yml des composants exclus
                     (renomme temporairement en .package.yml.disabled)
5. COMPILE           Invoque le build DSFR standard (sass + rollup)
6. POST-PROCESS      Sed rename sur dist/*.css (si mapping.colors.*.rename)
                     + strip JS modules pour composants exclus
7. RESTORE           Restaure les .package.yml.disabled (le submodule reste clean)
8. CHECK             Vérifie WCAG AA sur les ratios cibles dans le CSS final
9. OUTPUT            Copie dist/ + assets/fonts/ vers le répertoire publié
```

**Garantie** : à la fin du pipeline, `git status` dans `dsfr/` doit être propre. Le submodule n'est jamais réellement modifié, juste enrichi temporairement.

### Étape 1 — Validate : détection de mapping cassé

Le point le plus critique. Le builder doit détecter avant le build :

#### Tokens manquants dans le mapping

Le DSFR upstream a ajouté un nouveau token que le mapping ne couvre pas.

```
⚠ WARN: blue-france-moon-XXX exists in DSFR v1.16.0 but has no mapping rule
  → Le grade gardera la valeur DSFR originale dans le bundle
  → Action : ajouter une règle dans mapping.yml ou marquer "keep: true"
```

**Implémentation** : parser `dsfr/src/module/color/variable/_options.scss` pour extraire toutes les clés, comparer avec ce que le mapping couvre.

#### Tokens en trop dans le mapping

Le mapping référence un token qui n'existe plus dans le DSFR (supprimé ou renommé en upstream).

```
✗ ERROR: mapping.colors.blue-france.semantic-remap references "425"
         but blue-france-425 no longer exists in DSFR v1.16.0
  → Le build échoue
  → Action : mettre à jour mapping.yml
```

#### Drift sur fichiers DSFR critiques

Certains fichiers DSFR sont structurellement référencés par le builder (parsing). Si leur structure change, l'override peut devenir incorrect.

```
⚠ WARN: dsfr/src/module/color/variable/_options.scss structure changed
        (hash mismatch with last successful build)
  → La parsing du mapping pourrait échouer
  → Action : régénérer la baseline avec `ademe-ds baseline --update`
```

**Implémentation** : stocker dans `.ademe-baseline.json` un SHA des fichiers DSFR critiques (options, sets, font-face setting, package.yml de chaque composant exclu). Au build suivant, comparer.

#### Composants exclus avec dépendances scripts

Si header/footer devient une dépendance `script` (pas juste `example`) d'un composant qu'on garde, exclure le composant casse le build.

```
✗ ERROR: analytics/.package.yml depends on 'header' as script (DSFR v1.16.0)
         but components.remove includes 'header'
  → Le build échoue
  → Action : retirer 'header' de remove ou patcher analytics
```

#### Renaming collisions

Le mapping renomme une famille vers un nom qui existe déjà dans le DSFR.

```
✗ ERROR: mapping renames "blue-france" → "blue-ecume" but blue-ecume
         already exists in DSFR (palette accent)
  → Le build échoue
  → Action : choisir un autre nom
```

### Étape 2 — Transform : stratégie par type

Toutes les transforms produisent des fichiers SCSS dans `overrides/` qui sont injectés au build. **Aucune écriture dans `dsfr/`**.

#### Typographie

Génère `overrides/_font-face.scss` :

```scss
// Override @font-face Marianne pour pointer vers les fichiers PublicSans
@font-face {
  font-family: 'Marianne';
  src: url('../assets/fonts/PublicSans-Regular.woff2') format('woff2'),
       url('../assets/fonts/PublicSans-Regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
}
// ... autres poids
```

Stratégie : on **garde le nom CSS `Marianne`** pour ne pas casser les `font-family: var(--font-family-primary, Marianne)` du DSFR. Les fichiers physiques sont remplacés. Si le mapping demande aussi un nom CSS différent, on override `--font-family-primary`.

**Détection de casse** : vérifier que les poids du mapping correspondent au `$font-settings` DSFR.

#### Couleurs

Pipeline ordonné en 3 étapes claires :

**Étape A — Génération de palette LCh par famille**

Pour chaque famille mappée, calculer toute la palette à partir de l'anchor :
- Convertir l'anchor en LCh : `(L₀, C₀, h₀)`
- Pour chaque grade DSFR cible, calculer `LCh = (L_target, C₀ × C_factor, h₀)`
- Si hors gamut sRGB → réduire C\* par dichotomie
- Pour hover/active : appliquer `ΔL_hover` / `ΔL_active` + atténuation C\*
- Le grade `main` recale son numéro à `round(L₀ × 10)`

**Étape B — Émission de `_palette.scss`**

```scss
// overrides/_palette.scss (généré)
:root {
  // blue-france (DSFR émet ces vars dans :root, on les redéfinit)
  --blue-france-sun-113: #001977;
  --blue-france-sun-113-hover: #0036db;
  --blue-france-sun-113-active: #2b3dd7;
  --blue-france-625: #907fff;
  // ...
  --blue-france-main-525: #4950fb;
  // ...
}

// Si mapping demande add-grades pour une famille (ex : red-marianne-sun)
// alors on émet aussi les nouvelles vars + un override des sets
:root {
  --red-marianne-sun-157: #560200;
  --red-marianne-sun-157-hover: #a20013;
  --red-marianne-sun-157-active: #ab0015;
}

// Semantic-remap : redéfinir les vars sémantiques pour pointer vers les nouvelles
@layer ademe {
  :root {
    --background-action-high-red-marianne: var(--red-marianne-sun-157-625);
  }
}
```

**Étape C — Vérif WCAG**

Pour chaque entrée `wcag:` dans le mapping, calculer le ratio sur la palette générée et auto-darken si nécessaire (en post sur la palette LCh). Émet un warning si auto-ajustement appliqué.

**Note importante sur les grades recalculés** (ex : `main-525` → `main-444`) : si le mapping demande de recaler le numéro de grade, le builder émet **deux jeux de vars** :
- L'ancien (`--blue-france-main-525`) avec la nouvelle valeur, pour ne casser aucune référence DSFR existante
- Le nouveau (`--blue-france-main-444`) avec la même valeur, pour exposer le nom correct

Plus simple en l'état que de tracer toutes les références au grade dans le DSFR et de les renommer en post-process. Coût : 2 lignes CSS de plus par grade recalculé. Acceptable.

**Détection de casse** :
- Nouvelles familles de couleurs upstream → warn
- Changement du nombre de grades → warn
- Hash de `_sets.scss` ou `_decisions.scss` modifié → warn (le builder dépend de leur structure)

#### Ombres

Génère `overrides/_shadows.scss` :

```scss
:root {
  --raised-shadow-color:           rgba(0, 0, 0, 0.16);
  --raised-shadow-color-elevated:  rgba(0, 0, 0, 0.16);
  --raised-shadow-color-overlap:   rgba(0, 0, 0, 0.16);
  // ...
}

// Dark mode
:root[data-fr-theme="dark"] {
  --raised-shadow-color:           rgba(0, 0, 0, 0.32);
  // ...
}
```

Trivial. Aucune détection de casse spécifique.

#### Border-radius

Génère `overrides/_radius.scss` dans le layer `ademe` :

```scss
@layer ademe {
  .fr-input  { border-radius: 0.75rem; }
  .fr-select { border-radius: 0.75rem; }
  .fr-badge  { border-radius: 0.75rem; }
  .fr-card   { border-radius: 0.75rem; overflow: hidden; }
  .fr-alert  { border-radius: 0.75rem; }
  // input addons : préserver le pattern coins externes
  .fr-input-wrap--addon > *:first-child:not(:last-child) { border-radius: 0.75rem 0 0 0.75rem; }
  .fr-input-wrap--addon > *:last-child:not(:first-child) { border-radius: 0 0.75rem 0.75rem 0; }
}
```

**Détection de casse** : vérifier que les sélecteurs ciblés existent encore dans le CSS compilé du DSFR (sed grep sur `dist/dsfr.css` pré-override).

#### Card border fix (override curé)

Le card-fix box-shadow n'est pas généré depuis `mapping.yml` — c'est un fichier statique dans `overrides/_card-fix.scss` :

```scss
@layer ademe {
  .fr-card:not(.fr-card--no-border):not(.fr-card--shadow) {
    background-image: none;
    padding: 0;
    box-shadow: inset 0 0 0 1px var(--border-default-grey);
  }
}
```

Copié tel quel à chaque build. Listé dans `manual-overrides:` du mapping pour traçabilité.

#### Composants (exclude)

**Méthode build wrapper** (pas un override SCSS) :

1. Lire `mapping.components.remove`
2. Pour chaque composant à exclure : renommer `dsfr/src/dsfr/component/<name>/.package.yml` → `.package.yml.disabled`
3. Scanner les autres `.package.yml` et retirer les dépendances vers les composants exclus (en générant des fichiers patchés dans le workspace, pas dans `dsfr/`)
4. Supprimer le `.config/config.json` (cache du build) si présent
5. Lancer le build
6. **Restaurer** les `.package.yml.disabled` → `.package.yml` à la fin (try/finally pour garantir un submodule clean)

**Détection de casse** :
- Nouveau composant qui dépend d'un composant exclu en `script` → error
- Composant exclu qui n'existe plus dans le DSFR → warn (déjà absent, pas de cleanup nécessaire)

#### Rename (post-process optionnel)

Si `mapping.colors.<famille>.rename` est défini, après le build :

```bash
sed -i '' 's/blue-france/blue-ate/g' dist/dsfr.css dist/dsfr.module.js dist/dsfr.nomodule.js
sed -i '' 's/red-marianne/red-laura/g' dist/dsfr.css dist/dsfr.module.js dist/dsfr.nomodule.js
```

**Sécurité du regex** : avant de l'appliquer, le builder vérifie que `blue-france` / `red-marianne` n'apparaissent que dans les contextes attendus (noms de classes, noms de var CSS, noms de modules JS) et pas dans des chaînes texte arbitraires. Si une occurrence inattendue est trouvée → error.

**Migration des consumers** : un mapping `rename:` doit s'accompagner d'une note de release indiquant que les classes ont changé de nom.

### Étape 3 — Format du `mapping.yml`

```yaml
version: 1                    # version du schéma de mapping
dsfr: "1.14.4"                # version DSFR attendue (semver range : "^1.14.0")

typography:
  primary:
    css-name: "Marianne"      # nom CSS conservé (pas d'override de @font-face name)
                              # OU custom-name pour aussi changer le nom CSS
    files-source: "./assets/fonts/"
    weights:
      "300": { normal: "PublicSans-Light", italic: "PublicSans-LightItalic" }
      "400": { normal: "PublicSans-Regular", italic: "PublicSans-Italic" }
      "500": { normal: "PublicSans-Medium", italic: "PublicSans-MediumItalic" }
      "700": { normal: "PublicSans-Bold", italic: "PublicSans-BoldItalic" }
  alt: keep                   # ou définition similaire à primary

colors:
  <famille-dsfr>:             # ex : blue-france, red-marianne
    rename: string             # OPTIONNEL : déclenche post-process sed sur dist/
                              # Sans rename : valeurs override mais classes restent blue-france
    anchor:
      hex: hex                 # couleur principale (anchor LCh)
    generation: lch-remap | manual
    grades:                    # surcharges du profil par défaut
      <grade-key>:
        L: number | "auto"     # L* CIELAB cible (auto = L₀ de l'anchor)
        c-factor: number       # facteur sur C₀
    add-grades:                # grades qui n'existaient pas en upstream
      <grade-key>: { L, c-factor }
    semantic-remap:            # vars sémantiques à rediriger via @layer ademe
      <old-token>: <new-token> # ex : red-marianne-425 → red-marianne-sun-157
    recalibrate-grade:         # OPTIONNEL : émet l'ancien et le nouveau numéro
      <old-grade>: <new-grade> # ex : main-525 → main-444
    wcag:                      # contraintes de contraste par grade
      <grade>:
        min: number
        against: hex
        auto-darken: bool

elevation:
  shadow-color:
    light: rgba(...)
    dark: rgba(...)

border-radius:                # tous les overrides via @layer ademe { ... }
  base: string                # valeur CSS (ex : "0.75rem")
  targets:                    # sélecteurs CSS à overrider
    - selector: ".fr-input"
      value: "0.75rem"
    - selector: ".fr-card"
      value: "0.75rem"
      overflow: true          # ajoute overflow: hidden
    - selector: ".fr-input-wrap--addon > *:first-child:not(:last-child)"
      value: "0.75rem 0 0 0.75rem"

manual-overrides:             # fichiers SCSS curés à inclure tels quels
  - "./overrides/_card-fix.scss"

components:
  remove:                     # masque les .package.yml temporairement avant build
    - header
    - footer

post-process:
  rename:                     # sed sur dist/*.css et dist/*.js
    enabled: true             # si false, valeurs override mais noms inchangés
    safety-check: true        # vérifie que les anciens noms n'apparaissent que
                              # dans les contextes attendus avant d'appliquer
```

### Étape 4 — Profil LCh par défaut

Profil reproductible (fichier `builder/profile-lch.js`), équivalent du `PROFILE` Python en §4.2 de l'analyse :

```js
// (grade, L_target, C_factor, ΔL_hover, ΔL_active, C_factor_hover, C_factor_active)
export const DEFAULT_PROFILE = [
  ["75",  11.0, 0.24,  15.4,  24.0, 0.70, 0.55],
  ["100", 14.2, 0.27,  16.0,  24.5, 0.70, 0.55],
  ["125", 17.2, 0.28,  16.5,  24.7, 0.70, 0.55],
  ["200", 24.3, 0.59,  16.6,  24.5, 0.75, 0.60],
  ["sun", 15.7, 1.10,  17.8,  19.8, 0.95, 0.85],
  ["625", 60.3, 0.80,  14.3,  21.2, 0.65, 0.45],
  ["850", 82.8, 0.33, -13.4, -20.6, 0.85, 0.95],
  ["925", 90.9, 0.17, -11.1, -17.7, 1.40, 1.90],
  ["950", 93.9, 0.12,  -9.8, -15.9, 1.40, 1.90],
  ["975", 96.8, 0.06,  -8.1, -13.7, 1.40, 1.90],
];

export const MAIN_DLH = 14.7;
export const MAIN_DLA = 21.9;
export const MAIN_C_FACTOR_H = 0.85;
export const MAIN_C_FACTOR_A = 0.78;
```

### Étape 5 — CLI

```bash
# Build standard (read submodule, generate overrides, compile, post-process)
npx ademe-ds build

# Build avec vérification stricte (CI) : error sur les warns
npx ademe-ds build --strict

# Génère seulement les overrides/*.scss sans compiler
npx ademe-ds generate

# Vérifier que le mapping est compatible avec dsfr/ actuel
npx ademe-ds validate

# Mettre à jour le submodule et vérifier la compatibilité
npx ademe-ds upgrade              # git submodule update + validate

# Régénérer la palette d'une famille (itération rapide sur l'anchor)
npx ademe-ds palette blue-france --anchor "#4950FB" --preview

# Mettre à jour la baseline des hashs DSFR (après upgrade validé manuellement)
npx ademe-ds baseline --update

# Générer un diff visuel avant/après (Playwright)
npx ademe-ds preview
```

### Étape 6 — Intégration CI

```yaml
# .github/workflows/build.yml
on:
  push:
  schedule:
    - cron: '0 8 * * 1'           # check upstream chaque lundi

jobs:
  build:
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
      - run: npm ci
      - run: npx ademe-ds build --strict
      - run: npx ademe-ds validate

  upstream-check:
    if: github.event_name == 'schedule'
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
      - run: git submodule update --remote
      - run: npx ademe-ds validate
      # Crée une issue si le mapping est cassé
```

### Priorités d'implémentation

L'effort est globalement plus faible que dans la version source-modification parce que les transforms produisent des fichiers SCSS d'override (concaténation simple) au lieu de patcher les sources DSFR.

| Priorité | Composant | Effort | Impact |
|----------|-----------|--------|--------|
| P0 | LCh primitives (`builder/lch.js`) | 0.5j | Fondation de la palette |
| P0 | Build wrapper (prepare + filter-packages + compile + restore) | 1-2j | Pipeline de base |
| P0 | Generate palette (LCh → `_palette.scss`) | 1j | Cœur fonctionnel |
| P0 | Validate mapping vs DSFR (parsing + diff) | 2j | Détection drift upstream |
| P1 | Generate font-face (mapping → `_font-face.scss`) | 0.5j | Trivial |
| P1 | Generate shadows | 0.25j | Trivial |
| P1 | Generate radius (`@layer ademe`) | 0.5j | Trivial |
| P1 | Filter packages (`.package.yml` masquage temporaire + restore) | 1j | Mécanique try/finally |
| P2 | Post-process rename + safety check | 1j | Optionnel |
| P2 | WCAG validator sur le CSS final | 1j | Qualité |
| P2 | CLI + config | 1j | DX |
| P3 | CI workflow + upstream drift detector | 1j | Automatisation |
| P3 | Preview (diff visuel via Playwright) | 2j | Nice to have |

**Total P0+P1** : ~7-8 jours pour un builder fonctionnel de bout en bout.

---

## Annexe — Coordonnées LCh des anchors POC

Si la palette doit être régénérée (variations futures, ajustement chromatique), partir de ces coordonnées + le profil §4 :

```
Blue ATE:   #4950FB → L*=44.40  C*=99.70  h°=301.00
Red Laura:  #FF3333 → L*=55.95  C*=89.25  h°= 34.27
```
