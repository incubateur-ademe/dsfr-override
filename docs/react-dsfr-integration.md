# Intégration avec react-dsfr

`react-dsfr` (`@codegouvfr/react-dsfr`) embarque sa propre copie du DSFR officiel
dans son package npm. Le client charge le CSS via `assets/dsfr_plus_icons.scss`
(Next AppDir) ou via la CLI `copy-dsfr-to-public` qui matérialise le dossier
`dsfr/` dans `public/` (Vite/CRA). Le JS est chargé dynamiquement par
`@codegouvfr/react-dsfr/start` depuis ce même dossier.

Notre builder propose trois cibles pour s'intégrer à cet écosystème, avec des
tradeoffs différents.

## Comparatif des cibles

| Dimension | `bundle` (existant) | `overlay` (recommandé) | `forked` (préplan) |
|---|---|---|---|
| **Status** | implémenté | implémenté | non implémenté |
| **Taille CSS livrée au client** | ~700 KB | ~74 KB | ~700 KB |
| **Drop-in côté app** | oui (1 fichier qui remplace `dsfr.min.css`) | non (chargement additionnel après le DSFR upstream) | oui (package npm `@ademe/react-dsfr`) |
| **Rename `blue-france` → `blue-ate`** | possible mais à désactiver pour react-dsfr | impossible (incompatible MUI/charts) | oui (patches sed sur runtime + types régénérés) |
| **Compat MUI / charts react-dsfr** | OK si rename désactivé | OK | OK après patches |
| **Filtrage Header/Footer côté CSS** | oui (composants exclus du SCSS compilé) | non (CSS upstream chargé tel quel) | oui + suppression du JS/TS exporté |
| **Filtrage Header/Footer côté React** | au choix de l'app (composants react-dsfr stock) | au choix de l'app | forcé (exports retirés du package) |
| **Types TS adaptés** | non (l'app garde les types react-dsfr stock avec `blue-france`) | non (idem) | oui (`cssToTs` régénère depuis notre CSS) |
| **DevTools : noms de tokens neutralisés** | oui si rename activé (mais incompatible react-dsfr) | non (`--blue-france-*` restent visibles) | oui |
| **Effort upgrade DSFR upstream** | trivial (`git submodule update`) | trivial | trivial |
| **Effort upgrade react-dsfr upstream** | n/a (l'app gère sa version) | n/a | non-trivial : re-test patches sed, drift detector, re-build complet |
| **Distribution** | fichiers CSS/JS dans `dist/` | fichiers CSS/JS dans `dist/` | package npm versionné |
| **Build time** | ~14 s | ~13 s | estimé ~60-90 s (DSFR + react-dsfr) |
| **Surface de maintenance** | ~1× | ~1× | ~3-5× |

### Que gagne-t-on / que perd-on

**Bundle** — *gagne :* drop-in trivial (un fichier remplace l'autre), filtrage
CSS des composants Header/Footer. *Perd :* taille (~700 KB côté client),
incompatibilité native avec MUI/charts si on garde le rename actif (donc
neutralisation des tokens et compat react-dsfr deviennent mutuellement
exclusifs).

**Overlay** — *gagne :* taille minimale (~74 KB), zéro friction avec
l'écosystème react-dsfr (MUI, charts, types tous OK), pipeline simple, ratio
maintenance/valeur excellent. *Perd :* pas de neutralisation visuelle des
tokens dans les DevTools (`--blue-france-*` reste le nom interne, seule la
valeur est ADEME), responsabilité de ne pas utiliser `<Header/>`/`<Footer/>`
laissée au consommateur, deux fichiers CSS à charger côté app au lieu d'un.

**Forked** — *gagne :* neutralisation complète (rename, types, Header/Footer
retirés du package), drop-in via un seul `import`, types TS cohérents avec le
rename. *Perd :* coût d'upgrade non-trivial (à chaque release react-dsfr
re-tester les patches sed), surface de maintenance ~3-5× plus grande, build
plus lent, package npm à publier et versionner.

## Mode `overlay` — recommandé

Produit un seul `dist/ademe-overlay.css` qui ne contient que :

- les `:root` blocks (palette LCh ADEME sous les noms de tokens upstream
  `--blue-france-*`, `--red-marianne-*`, decisions DSFR),
- les `@font-face` Public Sans déclarés sous l'identité `Marianne`,
- nos overrides class-based (radius 0.75 rem, icons custom Lucide,
  fixes alert/card).

Le bundle DSFR upstream (shippé par react-dsfr) reste le source des
composants — l'overlay redéfinit uniquement les variables et les classes
modifiées. Cascade naturelle : l'overlay est chargé après le DSFR upstream et
gagne sur les sélecteurs en commun.

### Build

```sh
pnpm build --target=overlay --minify
```

Sortie : `dist/ademe-overlay.css` (~74 KB) et `dist/ademe-overlay.min.css`
(~68 KB). Fonts et icons sont émis dans `dist/fonts/` et `dist/icons/` par le
pipeline `generate/` (réutilisés pour les deux targets).

### Intégration côté app — Next AppDir

Dans `app/layout.tsx`, après l'import du CSS DSFR de react-dsfr :

```tsx
import "@codegouvfr/react-dsfr/assets/dsfr_plus_icons.scss";
import "./ademe-overlay.css"; // copié depuis dist/, ou servi à part
```

L'ordre est critique : l'overlay doit être chargé **après** le DSFR upstream
pour que les redéfinitions de variables prennent effet.

### Intégration côté app — Vite / CRA

Après `npx react-dsfr copy-dsfr-to-public`, ajouter dans `index.html` :

```html
<link rel="stylesheet" href="%PUBLIC_URL%/dsfr/dsfr.min.css" />
<link rel="stylesheet" href="%PUBLIC_URL%/dsfr/utility/icons/icons.min.css" />
<link rel="stylesheet" href="%PUBLIC_URL%/ademe-overlay.min.css" />
```

Copier `dist/ademe-overlay.min.css`, `dist/fonts/` et `dist/icons/` dans
`public/` au build de l'app.

### Contraintes du mode overlay

**Pas de rename des préfixes.** `react-dsfr` hardcode des références aux
variables CSS upstream dans son JS/TSX runtime — notamment
`src/mui/mui.tsx:516-558` (~21 occurrences) qui écrit
`--blue-france-sun-113-625`, `--background-action-high-blue-france`,
`--text-active-blue-france`, etc. directement sur des éléments DOM. Si on
renommait `blue-france` → `blue-ate` dans le CSS, ces écritures pointeraient
vers des variables inexistantes (fallback `unset`) et MUI/charts cassent
silencieusement. L'overlay garde donc les noms upstream — la valeur visuelle
est ATE/Laura, c'est ce qui compte au rendu.

**Composants `<Header />` / `<Footer />`.** `react-dsfr` expose ces composants
qui rendent les classes `fr-header`/`fr-footer`. Les styles existent dans le
DSFR upstream chargé par react-dsfr (l'overlay ne les retire pas). Côté
ADEME, ces composants ne doivent pas être utilisés (CGU art. 2). C'est au
consommateur de les éviter ou de les remplacer par une version ADEME custom.

**Sets light / dark.** L'overlay porte les `:root` light et `:root[data-fr-theme=dark]`
extraits du CSS compilé. Le toggle de thème react-dsfr (`fr-theme`) fonctionne
sans changement.

## Mode `bundle` (existant) avec react-dsfr

Pour remplacer entièrement `dsfr.min.css` upstream par notre bundle :

1. Éditer `mapping.yml` et passer `post-process.rename.enabled: false`
   (sinon les hardcodes JS de react-dsfr cassent).
2. `pnpm build --minify` produit `dist/dsfr-ademe.min.css`.
3. Côté app : remplacer le chargement de `@codegouvfr/react-dsfr/dsfr/dsfr.min.css`
   par `dsfr-ademe.min.css` (renommé en `dsfr.min.css` si on passe par
   `copy-dsfr-to-public`).

Tradeoff : on embarque ~700 KB de CSS pour appliquer ce qui revient à un
diff de ~74 KB. À choisir si on a besoin que ce soit un drop-in (un seul
fichier) plutôt qu'une couche additionnelle.

## Mode `forked` — préplan, non implémenté

Cible : avoir un `@ademe/react-dsfr` qui ship react-dsfr + nos modifs avec
**rename complet** des préfixes (`blue-ate` partout, `red-laura`, types TS
régénérés) et **suppression physique** des composants Header/Footer
upstream. C'est le seul chemin si la neutralisation visuelle au niveau des
DevTools est non-négociable.

### Coût net (à valider avant d'engager)

- Upgrade react-dsfr non-trivial : à chaque release upstream, re-applique-r
  les patches sed sur `mui.tsx`, `Chart/chartWrapper.tsx`,
  `picto/utils/PictoWrapper.tsx` (et tout nouveau fichier qui hardcoderait
  `--blue-france-*`).
- Surface de maintenance ~3-5x plus grande que le mode overlay.
- Nécessité de publier et versionner un package npm (sous `@ademe/...` ou en
  monorepo privé).
- Drift detector à ajouter pour flagger tout nouveau hardcode upstream.

### Arborescence cible

```
react-dsfr/                          # submodule (read-only, comme dsfr/)
react-dsfr-patches/                  # patches versionnés appliqués au workspace
  mui-rename.patch
  chart-rename.patch
  picto-rename.patch
.tmp/workspace/react-dsfr/           # copie writable, patches appliqués
dist/react-dsfr/                     # output : package npm publishable
  dsfr/                              # notre bundle DSFR-ademe en place
  *.{js,d.ts}                        # composants react-dsfr patchés
```

### Étapes du pipeline

1. **Add submodule** : `git submodule add https://github.com/codegouvfr/react-dsfr.git ./react-dsfr`
   épinglé sur une release stable (`v1.31.1` au moment de cette doc).
2. **Workspace** : `ensureWorkspace` (réutiliser le pattern de
   `builder/build/workspace.ts`) → `.tmp/workspace/react-dsfr/`.
3. **Substitution DSFR source** : avant `yarn build`, remplacer le contenu de
   `node_modules/@gouvfr/dsfr/dist/` (résolu depuis le workspace react-dsfr)
   par notre `dist/dsfr-ademe.*`. Le `scripts/build/build.ts:30` fera
   `cp -r node_modules/@gouvfr/dsfr/dist → dsfr/` qui copie nos fichiers.
4. **Patches sed** : appliquer `react-dsfr-patches/*.patch` sur le workspace
   pour rename `blue-france` → `blue-ate`, `red-marianne` → `red-laura` dans :
   - `src/mui/mui.tsx` (21 occurrences blue-france)
   - `src/Chart/chartWrapper.tsx` (1 occurrence red-marianne dans typing)
   - `src/picto/utils/PictoWrapper.tsx` (1 occurrence red-marianne)
   Format `.patch` plutôt que sed inline pour avoir des diffs reviewables et
   un fail loud si le contexte upstream a bougé.
5. **Build react-dsfr** : `cd .tmp/workspace/react-dsfr && yarn install && yarn build`.
   Le pipeline interne `cssToTs` (`scripts/build/cssToTs/colorOptions.ts`,
   `colorDecisions.ts`, `colorDecisionAndCorrespondingOptions.ts`) régénère
   automatiquement les types TS depuis NOTRE CSS — ils contiendront
   `blue-ate` / `red-laura` partout.
6. **Filtrage Header/Footer** : retirer les exports correspondants via un
   patch additionnel sur `src/index.ts` (ou stub-out les composants pour
   throw "Use ademe Header instead" en runtime).
7. **Output package** : copier `.tmp/workspace/react-dsfr/dist/` vers
   `dist/react-dsfr/`, écraser le `package.json` avec `name: "@ademe/react-dsfr"`
   et un `version` calé sur la version upstream + suffix ADEME.

### Validation

- Drift detector style `builder/validate/` qui scan les sources upstream
  pour `blue-france|red-marianne` ; si une occurrence apparaît hors des
  fichiers patchés, fail le build.
- Test smoke : monter une app vite minimale qui importe
  `@ademe/react-dsfr` (link local), monter un `<Button color="primary"/>` et
  un MUI `ThemeProvider`, vérifier que la couleur effectivement appliquée est
  `#4950fb` (Blue ATE) et pas la couleur upstream.

### CLI envisagé

```sh
pnpm build --target=forked --minify
# ou en deux étapes :
pnpm build --target=bundle --minify       # produit dist/dsfr-ademe.*
pnpm build --target=forked --skip-bundle  # consomme dist/, ne rebuild pas DSFR
```

### Décision

Engager le mode `forked` seulement si l'overlay révèle une limitation
fonctionnelle bloquante côté ADEME (typiquement : exigence juridique sur la
neutralisation visuelle des tokens CSS dans les DevTools). Sinon, l'overlay
suffit pour 95 % des cas et l'effort de maintenance est dérisoire en
comparaison.
