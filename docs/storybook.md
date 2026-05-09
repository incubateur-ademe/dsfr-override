# Storybook

Surcouche du Storybook DSFR : on réutilise tels quels les 322 stories `.stories.js` que le submodule expose dans `dsfr/src/dsfr/component/**`, et on les rend avec **notre** CSS au lieu du DSFR officiel. Aucune story copiée, aucune story patchée — quand DSFR upstream ajoute un composant, sa story arrive automatiquement.

## Lancer

```bash
pnpm storybook
# → http://localhost:6006
```

Sous le capot, `pnpm storybook` enchaîne deux choses :

1. `pnpm build` à la racine — assure que `dist/dsfr-ademe.css` et `dist/utility-ademe.css` sont à jour (~10s, instantané si rien n'a changé côté builder).
2. `pnpm --filter dsfr-override-storybook storybook` — lance `storybook dev` depuis le sous-workspace. Premier démarrage ~30s le temps que vite optimise les deps ; les suivants ~5s.

Pour une modification limitée à `mapping.yml` ou à un fichier dans `overrides/`, relancer `pnpm build` à part puis hard-reload Storybook (`cmd+shift+R`) suffit. Pas besoin de relancer `pnpm storybook` complet.

## Architecture

```
dsfr-override/
├── dist/                              ← compilé par notre builder
│   ├── dsfr-ademe.css                 (composants + scheme + core + overrides)
│   ├── utility-ademe.css              (.fr-background-action-high--blue-ate, etc.)
│   └── fonts/                         (Public Sans + Spectral)
└── storybook/                         ← workspace pnpm dédié
    ├── package.json                   (deps storybook isolées du builder)
    └── .storybook/
        ├── main.ts                    ← stories pioché dans dsfr/, staticDirs vers dist/, lit mapping.yml
        ├── preview-head.html          ← <link> vers nos CSS + <script> JS DSFR vendor
        ├── preview.ts / preview.css   (themeDecorator data-fr-theme)
        ├── manager.ts                 (UI Storybook init)
        ├── dsfr-theme.ts              (theme piloté par mapping.yml via vite define)
        └── static/                    (logos light/dark)
```

Le branding du Storybook (couleur primary / secondary / fonte du chrome) suit la palette du `mapping.yml` configuré : `main.ts` lit `mapping.yml` au boot, extrait `typography.primary['css-name']` et les anchors des deux premières familles, et injecte ces valeurs en globals via `viteFinal.define`. `dsfr-theme.ts` les consomme pour générer les variantes light + dark. Aucun branding ADEME-spécifique en dur — c'est un "DSFR override" qui adopte la palette courante.

## Comment notre CSS arrive dans les stories

Storybook sert les fichiers statiques via `staticDirs`. Notre `main.js` monte :

| Source                                               | Servi à URL              | Pourquoi                                                                  |
|------------------------------------------------------|--------------------------|---------------------------------------------------------------------------|
| `../../dist/`                                        | `/dist/`                 | Notre CSS + fonts compilés                                                |
| `../../dsfr/src/dsfr/core/icon/`                     | `/dist/icons/`           | Icons SVG (DSFR templates les chargent depuis cette URL)                  |
| `../../dsfr/src/dsfr/core/asset/artwork/`            | `/dist/artwork/`         | Pictogrammes idem                                                         |
| `../../dsfr/tool/example/img/`                       | `/img/`                  | Images d'exemple utilisées par certaines stories                          |
| `../node_modules/@gouvfr/dsfr/dist/dsfr/`            | `/vendor/`               | `dsfr.module.min.js` pour les composants interactifs (modal, accordion…)  |

`preview-head.html` injecte ensuite :

```html
<link rel="stylesheet" href="dist/dsfr-ademe.css">
<link rel="stylesheet" href="dist/utility-ademe.css">
<script type="module" src="vendor/dsfr.module.min.js"></script>
```

## Pourquoi le JS DSFR vient de `@gouvfr/dsfr` npm

Le submodule DSFR ne contient que les **sources** — ni `dist/dsfr.module.min.js`, ni les CSS minifiés. Pour les générer il faudrait `cd dsfr && yarn install && yarn build`, ce qu'on cherche à éviter (c'est tout le point de ne pas toucher au submodule).

Plutôt que reproduire le pipeline JS du DSFR, on tire le JS pré-buildé depuis le package `@gouvfr/dsfr@1.14.4` (même version que celle pinned du submodule). C'est en `dependencies` du workspace `storybook/`. Cohérence assurée tant que `mapping.yml.dsfr === storybook/package.json.@gouvfr/dsfr`.

### Upgrade DSFR

Quand le submodule passe à une nouvelle version (ex : 1.14.4 → 1.15.0) :

1. `git -C dsfr checkout v1.15.0`
2. Mettre à jour `mapping.yml` : `dsfr: "1.15.0"`
3. **Mettre à jour `storybook/package.json`** : `"@gouvfr/dsfr": "1.15.0"`, puis `pnpm install`
4. `pnpm baseline` puis `pnpm validate` pour détecter et acter le drift

Sans le step 3, le JS Storybook reste sur l'ancienne version et peut diverger de la palette / des composants. Aucun check automatique pour le moment — à ajouter dans `validate/` plus tard si nécessaire.

## Pièges connus + leurs fixes

**Docs pages vides (autodocs)** : Storybook 8.4 charge `@mdx-js/react` + `react/jsx-runtime` à la demande au moment du rendu docs, ce qui déclenche un re-bundle vite et vide l'iframe. Fix dans `main.js` :

```js
viteFinal: (config) => {
  config.optimizeDeps = {
    ...config.optimizeDeps,
    include: [
      ...(config.optimizeDeps?.include ?? []),
      '@mdx-js/react',
      'react/jsx-runtime'
    ]
  };
  return config;
}
```

**`react-dom: undefined ReactCurrentDispatcher`** : symptôme d'un mismatch React 19 (transitif via storybook) / React-DOM 18 (deps storybook). Pin explicite à `react@^18.3.1` + `react-dom@^18.3.1` dans `storybook/package.json`.

**`ejs4b/ejs` ou `yaml` introuvable** : ces deps sont importées par `dsfr/src/dsfr/core/template/stories/ejs-renderer.js`. Vite résout par chaining depuis le file source (`dsfr/`) → racine du projet, pas vers `storybook/node_modules/`. D'où leur présence en **devDependencies du workspace racine** (pas de storybook/).

**`.config/pictogram.json` ou `i18n.json` manquants** : les stories DSFR importent ces fichiers de config eagerly. Ils sont générés par notre `builder/build/dsfr-config.js` (registres icon + pictogram, stubs `{}`/`[]` pour i18n + colors). `prepare()` du builder les seed à la fois dans le workspace et **dans le submodule directement** (`dsfr/.config/`, gitignored par DSFR donc git status reste clean).

## Ajouter une story custom ADEME

Deux options :

1. **Story dans le submodule** (mauvaise idée) — pollue git, perdue au prochain `git submodule update`.
2. **Story dans `storybook/`** (recommandé) — créer `storybook/stories/` + l'ajouter au pattern `stories:` de `main.js`. Pas encore mis en place car les stories DSFR existantes couvrent déjà les composants.

## Build statique

```bash
pnpm build-storybook
# → ../storybook-static/  (relatif à storybook/)
```

Sortie déployable telle quelle. Le `--minify` du builder n'est PAS appliqué automatiquement ici — appeler `pnpm build --minify` avant si voulu pour un build prod.

## Trade-offs assumés

- **Deps lourdes (~500 MB de node_modules pour le workspace storybook)** : isolées dans le sous-package, n'impactent pas le builder. Un dev qui ne veut que générer le CSS n'a jamais besoin d'`pnpm install` à la racine si seul `builder/` l'intéresse — mais en pratique pnpm workspaces install tout en une fois.
- **Pas d'addon-themes ADEME custom** : le branding (logos, palette de la chrome Storybook) garde celui du DSFR. À adapter dans `dsfr-theme.js` quand le branding ADEME final est défini.
- **Pas d'introduction.mdx ADEME** : seul `dsfr/dsfr-sb/introduction.mdx` est exposé, qui parle du DSFR officiel. À remplacer par une intro ADEME dans `storybook/` quand pertinent.
