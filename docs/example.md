# Page témoin (`example/`)

Smoke test visuel du builder, sans dépendance lourde. Une seule page HTML qui exerce les composants DSFR critiques avec notre `dist/`, plus un panneau de diagnostic typo intégré.

## Lancer

```bash
node builder/serve.js
# → http://localhost:8080/example/index.html
```

(`PORT=xxxx node builder/serve.js` pour changer de port.)

Le serveur est ~50 lignes de Node natif (`node:http` + `node:fs`), zéro dépendance. Sert tout le projet à la racine, MIME types gérés pour CSS / JS / fonts / SVG.

## Page témoin vs Storybook

- **Page témoin** : démarre en <1 s, charge un seul HTML statique. Bonne pour vérifier "est-ce que mon dernier `pnpm build` n'a rien cassé d'évident" en 5 secondes chrono. Inclut un diagnostic typographie automatique.
- **Storybook** : démarre en ~30 s (pré-bundling vite), recharge à chaque modif. Bon pour explorer 322 composants × variantes ou démontrer le rendu ADEME à un tiers.

Surcoût négligeable (~250 lignes HTML + 50 lignes Node), usage complémentaire.

## Ce que la page teste

| Section                | Vérifie                                                                                  |
|------------------------|------------------------------------------------------------------------------------------|
| Diagnostic typographie *(meta-test, voir § dédié plus bas)* | `Marianne` (nom CSS) résout bien vers Public Sans, pas vers une Marianne du système |
| Typographie            | Public Sans Light / Regular / Medium / Bold + italiques + Spectral pour `fr-text--alt`   |
| Palette Blue ATE       | Les 11 grades (75 → 975 + sun-157 + main-444) en swatches HEX-codés                      |
| Palette Red Laura      | Idem (sun-157 ajouté via `add-grades`, main-560 via `recalibrate-grade`)                 |
| Boutons                | Primary / Secondary / Tertiary / Tertiary-no-outline / Disabled, tailles SM/MD/LG        |
| Formulaires            | `.fr-input` / `.fr-select` à 4 angles arrondis 0.75rem, addon avec coins asymétriques    |
| Badges                 | Success / Info / Warning / Error / Default arrondis                                      |
| Alertes                | Info / Succès / Warning / Erreur arrondis                                                |
| Cards                  | Default (border via box-shadow inset du card-fix) / shadow / no-border                   |
| Consent banner         | Pattern DSFR `fr-consent-banner` — exerce le JS interactif (`dsfr.module.min.js`)        |
| Vérification rename    | Classes utilitaires `.fr-background-action-high--blue-ate` (utility-ademe.css)           |
| Variables CSS          | Auto-check : `--background-action-high-blue-ate = #001977` et 0 occurrence blue-france   |

## DSFR JavaScript

Plusieurs composants DSFR (modal, accordion, toggle, consent banner, navigation, …) ont besoin de `dsfr.module.min.js` chargé en haut de la page. Le submodule DSFR ship juste les sources, pas les bundles compilés — donc on tire le JS pré-buildé depuis `@gouvfr/dsfr@1.14.4` (même version que celle pinned du submodule), et le builder le copie dans `dist/dsfr.module.min.js` à chaque `pnpm build`. La page témoin charge `<script type="module" src="../dist/dsfr.module.min.js"></script>`.

Lors d'un changement de version DSFR (`mapping.yml.dsfr`), penser à bumper `@gouvfr/dsfr` dans `package.json` à la même version pour que le JS ne diverge pas du CSS.

## Le panneau de diagnostic typographie

C'est l'élément le plus utile : confirme que la fonte effectivement rendue est bien Public Sans, pas Marianne du système (Public Sans et Marianne se ressemblent visuellement, l'œil est mauvais juge).

Méthode : on mesure la largeur d'une chaîne de référence avec trois `font-family` :

```js
const w1 = measure(`'Marianne', monospace`)   // notre @font-face
const w2 = measure(`monospace`)                // fallback
const w3 = measure(`'NoSuchFont', monospace`)  // fallback aussi
```

Si `w1 ≠ w2` et `w1 ≠ w3`, c'est qu'une fonte custom est chargée sous le nom `Marianne` — donc nos `@font-face` PublicSans gagnent. Le panneau affiche le verdict en clair (`✓ Marianne → PublicSans` ou `✗ fallback`) plus la liste complète des fontes chargées (`document.fonts`) et toutes les règles `@font-face` du CSS avec leur src effectif.

## Ajouter un cas

`example/index.html` est édité à la main. Pour ajouter une vérification :

1. Ajouter une `<section class="ademe-section">` avec le composant à tester.
2. Si la vérif doit être automatisée, lui donner un `id` et l'inspecter dans le `<script>` final (ex : `getComputedStyle` puis assertion + affichage du résultat dans `#font-debug` ou un nouveau placeholder).

Pas de framework, pas de build étape — c'est intentionnel : on teste le CSS final tel qu'un consommateur ADEME le verra.
