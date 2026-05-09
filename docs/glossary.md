# Glossaire

Définitions des termes design, techniques, et des acronymes utilisés dans cette doc et dans le code. Pensé pour rester accessible, même sans bagage dev ou design system. Pour les liens entre concepts, voir la rubrique « voir aussi » à la fin de chaque entrée pertinente.

## Sommaire

- [Design](#design)
- [Technique](#technique)
- [Acronymes](#acronymes)

---

## Design

### Anchor (anchor color)
Couleur de référence d'une famille. À partir d'un seul hex (par ex. `#4950FB` pour la famille bleue), le builder calcule automatiquement les 11 grades (`75`, `100`, `125`, `200`, `sun-XXX`, `main-XXX`, `625`, `850`, `925`, `950`, `975`) en faisant varier la luminance tout en conservant la teinte et la saturation. Un anchor sert donc à définir une famille entière en touchant un seul curseur.

### Border-radius
Arrondi des coins d'un élément (boutons, cards, inputs…). Mesuré en `rem`, `px` ou `%`. Le mapping permet de définir la valeur par sélecteur CSS.

### Brand / Branding
Identité visuelle d'un produit (logo, couleurs, typo). Dans ce projet, on parle plus précisément de neutralisation du branding État (Marianne, logos officiels, header/footer DSFR) pour produire une déclinaison.

### Cascade CSS
Règle CSS classique qui définit quelle propriété l'emporte quand plusieurs règles s'appliquent au même élément : « la dernière déclarée gagne, à spécificité égale ». C'est la base sur laquelle le builder s'appuie pour faire passer ses overrides après ceux du DSFR.

### Cascade Layers (`@layer`)
Mécanisme CSS récent permettant de classer des règles dans des couches. Une couche peut être prioritaire ou non. **Important** : les règles « non layered » battent toujours les règles « layered », ce qui rend l'utilisation de `@layer` délicate quand on veut overrider du code qui n'utilise pas de layer (cas du DSFR).

### Chroma (C*)
Saturation perçue d'une couleur dans l'espace LCh. Plus c'est haut, plus la couleur est vive. C'est l'une des trois coordonnées LCh (avec luminance et teinte).

### CIELAB / Lab
Espace colorimétrique défini par la CIE (Commission Internationale de l'Éclairage). Conçu pour être perceptuellement uniforme : deux couleurs séparées par la même distance numérique paraissent visuellement aussi distinctes. Utilisé en interne par le builder pour calculer les palettes.

### CIELCh / LCh
Variante de CIELAB exprimée en coordonnées polaires : Luminance (L*), Chroma (C*), Hue (h°). Plus intuitive que Lab pour ajuster une couleur (« même teinte, plus claire » ↔ « augmenter L*»).

### Contrast ratio (ratio de contraste)
Mesure WCAG du contraste entre deux couleurs (entre 1 et 21). 4.5 est le seuil AA pour le texte courant, 7 le seuil AAA, 3 le seuil AA pour les UI components et le grand texte. Utilisé pour valider qu'un texte reste lisible sur son fond.

### Decisions (DSFR)
Couche d'abstraction du DSFR : `--text-default-error` est une *decision*, pas une couleur directe. Elle pointe vers une variante d'une famille (ex : `error-main-525`). Le builder ne touche pas aux decisions ; en changeant la famille (ou son anchor), on change automatiquement toutes les decisions qui en dérivent.

### Design system
Bibliothèque cohérente de composants, styles et règles, partagée entre plusieurs produits. Le DSFR est le design system de l'État français ; ce projet en produit une déclinaison.

### Design token
Variable atomique (couleur, espacement, taille de fonte…) qu'on consomme partout dans une UI. Dans le DSFR, ce sont les variables CSS (`--blue-france-main-525`, `--text-default-grey`, etc.).

### Drift (upstream)
Mot anglais pour « dérive » : le DSFR upstream a changé et notre baseline ne le reflète plus. Le builder détecte ces changements (`pnpm validate`) et alerte si un fichier surveillé a changé de hash, pour qu'on puisse vérifier que rien d'important n'a cassé. Voir [`baseline`](#baseline).

### DSFR
Système de Design de l'État français. Ensemble de règles de design, composants, et code CSS/JS maintenu par DINUM, utilisé par les sites publics français. Voir [`acronymes`](#acronymes).

### Family (famille de couleurs)
Ensemble de 11 grades de la même teinte qui composent une famille. Exemples DSFR : `blue-france`, `red-marianne`, `info`, `success`. Chaque famille est calculée à partir d'un anchor.

### Fork
Copie d'un projet open source qu'on modifie pour l'adapter. Un *fork direct* du DSFR voudrait dire patcher la source ; ce projet adopte une approche *override* qui évite ça.

### Gamut (sRGB)
Ensemble des couleurs représentables dans un espace donné. Quand un calcul LCh produit une couleur trop saturée pour le sRGB (l'espace standard du Web), elle est *clampée* : la saturation est réduite jusqu'à entrer dans le gamut.

### Grade (de couleur)
Une valeur numérique d'une famille (par exemple `main-525`). Le numéro représente la luminance perçue × 10 (`525` ≈ luminance L*=52.5). Les grades couvrent du très sombre (`75`) au très clair (`975`).

### HSL
Espace colorimétrique simple (Hue, Saturation, Lightness). Plus intuitif que RGB mais **pas** perceptuellement uniforme : un bleu HSL `60% L` peut paraître bien plus clair qu'un rouge avec la même valeur. Le builder a un POC HSL abandonné au profit de LCh (voir [`history.md`](./history.md)).

### Hue (h°)
Teinte d'une couleur, exprimée en degrés autour d'un cercle (0° rouge, 120° vert, 240° bleu). C'est l'une des trois coordonnées LCh.

### Light/Dark mode
Schéma de couleurs clair ou sombre. DSFR fournit les deux ; les composants se basent sur l'attribut `data-fr-theme="light|dark"` du `<html>`.

### Luminance / Lightness (L*)
Clarté perçue d'une couleur, entre 0 (noir) et 100 (blanc). Coordonnée LCh la plus utile pour piloter la lisibilité d'une famille.

### Marianne (police)
Typographie officielle de l'État français. Exclue de la licence MIT du DSFR : on ne peut pas la redistribuer dans une déclinaison. Le builder remplace par défaut Marianne par Public Sans.

### Override
Règle CSS (ou fichier SCSS) qui en remplace une autre. Le pivot architectural de ce projet : on ne modifie pas le code DSFR, on ajoute des overrides à la fin de la cascade pour faire « gagner » nos valeurs.

### Palette
L'ensemble des couleurs d'une famille, dans tous ses grades. Une palette LCh est une palette générée par le profil CIELAB du builder à partir d'un anchor.

### Public Sans (police)
Typographie open source (US Web Design System), utilisée par défaut comme remplacement de Marianne dans le mapping ADEME.

### Recalibrate (grade)
Mécanisme du mapping qui crée un alias entre deux noms de grade. Exemple : `main-525: main-444` veut dire « le grade DSFR original `main-525` n'existe plus en tant que tel, il s'appelle maintenant `main-444` (parce que la luminance LCh recalculée est 44.4 au lieu de 52.5) ». Le builder émet alors les deux noms avec la même valeur, donc rien ne casse.

### Rename (préfixe)
Post-process qui renomme les préfixes des familles dans les fichiers `dist/*.css|js`. Exemple : `blue-france` → `blue-ate`. Sert à neutraliser la référence État. Optionnel mais recommandé.

### RGAA
Référentiel Général d'Amélioration de l'Accessibilité. Norme française qui s'applique aux sites publics. La conformité RGAA AA exige notamment des contrastes de texte ≥ 4.5 (WCAG).

### Scheme (DSFR)
Mécanisme DSFR qui distribue les couleurs entre light et dark mode. Une *scheme rule* est une règle CSS qui dit « en light, utilise telle couleur ; en dark, utilise l'autre ».

### Sets (DSFR `_sets.scss`)
Fichier DSFR qui définit les *combinaisons* de grades émises sous forme `--<famille>-<lightGrade>-<darkGrade>`. Par exemple, `blue-france-sun-113-625` veut dire « `sun-113` en mode light, `625` en mode dark ». Le builder UI lit ce fichier au démarrage pour piloter sa preview live de toutes les familles.

### Shade combo
Une combinaison de grades issue de `_sets.scss`. Voir [`Sets`](#sets-dsfr-_setsscss).

### Shadow / Elevation
Ombre portée des composants (cards, modals…). Le DSFR utilise une variable `--shadow-color` pilotable via `mapping.elevation.shadow-color.{light,dark}`.

### Sun grade / Moon grade (DSFR)
Grades spéciaux ajoutés aux familles primaires pour gérer les cas où un grade « normal » serait trop sombre/clair. Exemples : `sun-157` (très sombre, lisible sur fond blanc), `moon-XXX` (très clair, lisible sur fond sombre).

### Token
Voir [`Design token`](#design-token).

### Typography
Section du mapping qui pilote la police principale (`primary`, par défaut Marianne) et alternative (`alt`, par défaut Spectral).

### Utilitaires (couleurs)
Familles DSFR à sémantique fixe : `info` (bleu), `success` (vert), `warning` (orange), `error` (rouge). Le builder UI valide qu'un anchor utility tombe bien dans la zone de teinte attendue (par ex. on bloque un anchor vert pour `error`).

---

## Technique

### API
Application Programming Interface. Surface programmatique d'un module, d'un service ou d'un endpoint réseau. Dans le projet, le serveur expose des `/__api/...` pour la complétion d'icônes, la liste des combinaisons DSFR, etc.

### Background-image (gradient)
Truc CSS où une image (souvent un gradient) est mise en fond d'élément. DSFR utilise des `linear-gradient` pour dessiner les barres latérales d'alertes, callouts, etc. Ces gradients ne se clippent pas avec `border-radius`, d'où la présence de `manual-overrides` qui les redessinent en `box-shadow: inset`.

### Bundle / Bundler
Un *bundle* est un fichier JS unique produit en regroupant plusieurs modules. Un *bundler* (esbuild, Vite, webpack…) fait ce regroupement. Le builder UI est bundlé par esbuild en dev (à la volée dans `serve.ts`) et en prod (`pnpm build:ui`).

### CDN
Content Delivery Network. Réseau de serveurs qui sert un fichier proche de l'utilisateur. Dans ce projet, `highlight.js` est chargé depuis le CDN `esm.sh` parce que la version locale est CJS-only.

### CJS / ESM
Deux formats de modules JavaScript. **CJS** (CommonJS, `require`) — historique de Node. **ESM** (ECMAScript Modules, `import`) — moderne, standard, utilisé partout dans ce projet.

### CLI
Command-Line Interface. Programme qu'on lance dans un terminal (`pnpm build`, `pnpm validate`…).

### compileStringAsync (Sass)
Fonction Sass qui transforme du SCSS en CSS, en mode async. Utilisée par `builder/build/compile.ts`.

### cssnano
Outil PostCSS qui minifie le CSS (suppression des espaces, raccourcis des couleurs, dédup des règles…). Activé via `pnpm build --minify`.

### esbuild
Bundler JS très rapide. Le projet l'utilise pour bundler le builder UI en dev (à la volée) et en prod.

### ESM
Voir [`CJS / ESM`](#cjs--esm).

### Fork
Voir [`Fork`](#fork) dans la section Design.

### Git submodule
Référence d'un dépôt git à l'intérieur d'un autre. Le repo `dsfr-override` contient `dsfr/` comme submodule, ce qui permet de pointer une version exacte du DSFR sans en copier le code.

### Hex (couleur)
Notation CSS d'une couleur sous forme `#RRGGBB` (ou `#RGB`). Convertie en interne en triplet RGB normalisé `[0..1]` puis en LCh par `builder/lch.ts`.

### HTTP middleware
Petit composant qui s'insère dans le pipeline d'un serveur HTTP, intercepte les requêtes et les modifie avant ou après réponse. `serve.ts` a un middleware esbuild qui transforme `/builder-ui/main.js` en bundle TS à la volée.

### importmap
Mécanisme HTML qui mappe des noms de modules à des URLs. Permet d'écrire `import { foo } from 'bar'` dans le navigateur sans bundler.

### lucide-static
Bibliothèque d'icônes open source utilisée pour fournir les remplacements `fr--*-fill` (anciennement Remix Icons État-flavored). Voir [`docs/icons.md`](./icons.md).

### Mapping (au sens YAML)
Le fichier `mapping.yml` qui décrit ce que le builder doit produire : couleurs, typo, border-radius, ombres, icônes, post-process.

### mqpacker
Plugin PostCSS qui regroupe les `@media` queries éparpillées dans le CSS final pour réduire sa taille.

### Node.js
Runtime JS côté serveur. Le builder tourne dessus (≥22).

### pnpm / pnpm workspace
Gestionnaire de paquets npm-compatible mais plus efficace (un seul store local, deduplication agressive). Un *workspace* permet de gérer plusieurs packages dans le même repo (ici : racine + `storybook/` + `builder-ui/`).

### Polyfill
Bout de code qui ajoute le support d'une API absente dans certains environnements. Pas utilisé dans le projet, mention pour référence.

### PostCSS
Pipeline de transformation du CSS (plugins en chaîne). Le projet utilise mqpacker, combine-duplicated-selectors, discard-duplicates, cssnano (en `--minify`).

### postMessage (Web API)
API DOM qui permet à deux contextes (parent ↔ iframe) de s'échanger des messages. Utilisée pour synchroniser le builder UI et la page témoin.

### Sass / SCSS
Préprocesseur CSS (`@use`, mixins, variables…). Le DSFR est écrit en SCSS, le builder appelle Sass pour le compiler.

### sed (post-process)
Outil unix de remplacement texte. Le builder applique un `sed` JS sur les fichiers CSS finaux pour renommer les préfixes (`blue-france` → `blue-ate`).

### sed safety-check
Garde-fou ajouté au post-process : si le mot à renommer apparaît dans un contexte ambigu (commentaire, prose), le rename est refusé pour éviter un dégât silencieux.

### Source map
Fichier qui mappe une ligne de CSS final vers la ligne SCSS d'origine, lue par les devtools navigateur pour le debug. Activable via `pnpm build --sourcemap`.

### Storybook
Outil pour explorer les composants UI en isolation, story par story. Dans ce projet, on rend les 322 stories DSFR avec notre CSS.

### TypeScript / strict mode
Surcouche typée de JavaScript. Le projet utilise `@tsconfig/strictest` pour le mode le plus strict (refus des `any` implicites, accès indexé `T | undefined`, options optionnelles distinctes de `T | undefined`…).

### tsx
Runtime qui exécute des fichiers `.ts` directement avec Node, sans étape de compilation. Utilisé par tous les scripts pnpm de ce projet.

### Vite
Bundler / dev-server moderne (sous-jacent à Storybook 8). Le projet utilise sa fonctionnalité `define` pour injecter le branding mapping dans le thème Storybook.

### WCAG
Web Content Accessibility Guidelines. Norme W3C de l'accessibilité Web. RGAA s'aligne dessus. Voir [`Contrast ratio`](#contrast-ratio-ratio-de-contraste).

### Workspace (TS / pnpm / physique du builder)
Trois sens dans ce projet :
- **pnpm workspace** : configuration du repo qui gère plusieurs packages.
- **TS workspace** : un dossier surveillé par TypeScript via `include` dans `tsconfig.json`.
- **Workspace physique** : copie jetable du DSFR sous `.tmp/workspace/dsfr/` que le builder patche pour la durée d'un build.

### YAML
Format de fichier texte humain-friendly utilisé pour `mapping.yml`. Plus lisible que JSON (commentaires, indentation à la place des crochets).

---

## Acronymes

### ADEME
Agence de l'environnement et de la maîtrise de l'énergie. Établissement public commanditaire de cette déclinaison du DSFR.

### API
Voir [`API`](#api).

### CDN
Voir [`CDN`](#cdn).

### CIE
Commission Internationale de l'Éclairage. Définit les espaces colorimétriques de référence (CIELAB, CIELCh).

### CIELAB
Voir [`CIELAB / Lab`](#cielab--lab).

### CJS
Voir [`CJS / ESM`](#cjs--esm).

### CLI
Voir [`CLI`](#cli).

### CSS
Cascading Style Sheets. Langage de mise en forme du Web.

### DSFR
Voir [`DSFR`](#dsfr) dans la section Design.

### ESM
Voir [`CJS / ESM`](#cjs--esm).

### HSL
Voir [`HSL`](#hsl) dans la section Design.

### LCh
Voir [`CIELCh / LCh`](#cielch--lch).

### MIT
License open source permissive. Le DSFR est sous MIT — on peut donc en faire un fork légalement.

### POC
Proof of Concept. Une preuve de faisabilité technique. Le projet a eu une POC v1 (HSL, abandonnée) et une POC v2 (LCh, validée). Voir [`history.md`](./history.md).

### POSTCSS
Voir [`PostCSS`](#postcss).

### RGAA
Voir [`RGAA`](#rgaa) dans la section Design.

### RGB / sRGB
RGB est l'espace colorimétrique « brut » du Web (Rouge, Vert, Bleu). sRGB est sa variante standardisée pour l'affichage écran. Toutes les conversions LCh ↔ hex passent par sRGB.

### SASS / SCSS
Voir [`Sass / SCSS`](#sass--scss).

### TS
TypeScript. Voir [`TypeScript / strict mode`](#typescript--strict-mode).

### W3C
World Wide Web Consortium. Organisme qui maintient les standards du Web (HTML, CSS, WCAG, etc.).

### WCAG
Voir [`WCAG`](#wcag).
