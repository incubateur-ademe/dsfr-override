# Documentation — Sommaire

Point d'entrée de la doc. Cette page aide chaque profil à trouver rapidement le bon fichier, qu'il s'agisse d'un designer, d'un développeur, ou simplement d'une lectrice ou d'un lecteur curieux du projet.

> Pour tout terme inconnu, voir le **[glossaire](./glossary.md)** : il regroupe les termes design (anchor, LCh, scheme, palette…), les termes techniques (Sass, PostCSS, submodule, ESM…) et les acronymes (DSFR, ADEME, RGAA, WCAG…).

## Par où commencer selon le profil

### Découverte du projet (tout profil)

1. **[`README.md`](../README.md)** à la racine — ce que fait le projet, comment l'installer, les commandes principales.
2. **[`history.md`](./history.md)** — comment le projet en est arrivé là (POC, choix d'archi, étapes).
3. **[`glossary.md`](./glossary.md)** — pour le vocabulaire.

### Profil designer (couleurs, typographie, composants)

1. **[`README.md`](../README.md)** §« Quick start » et §« Vérifier visuellement ».
2. **[`builder-ui.md`](./builder-ui.md)** — l'éditeur visuel `mapping.yml` avec preview live. C'est l'outil de travail au quotidien : modifier un anchor, voir la palette LCh recalculée, la page témoin se mettre à jour, puis exporter le YAML.
3. **[`architecture.md`](./architecture.md)** §« Palette LCh » — pour comprendre comment chaque grade (`75`, `100`, …, `975`) est dérivé d'un anchor unique. Lecture utile pour justifier ou ajuster un choix de couleur.
4. **[`example.md`](./example.md)** — la page témoin (smoke test visuel).
5. **[`storybook.md`](./storybook.md)** — l'exploration exhaustive de tous les composants.

### Profil développeur (intégration, CI, contributions)

1. **[`README.md`](../README.md)** §« Commandes » — tous les scripts pnpm.
2. **[`architecture.md`](./architecture.md)** — pipeline complet : workspace → overrides → Sass → PostCSS → rename.
3. **[`builder-ui.md`](./builder-ui.md)** §« Étendre » — pour ajouter une section dans l'UI.
4. **[`icons.md`](./icons.md)** — pipeline d'icônes (rsync DSFR + overrides Lucide + adds).
5. **[`storybook.md`](./storybook.md)** — comment Storybook consomme `dist/` sans copier de stories.

### Profil rédaction / communication

1. **[`history.md`](./history.md)** — narration du projet, POC v1, POC v2, builder.
2. **[`glossary.md`](./glossary.md)** — définitions accessibles aux non-techs.

## Tous les fichiers

| Fichier | Sujet | Pour qui ? |
|---|---|---|
| [`README.md`](../README.md) | Vision, quick start, commandes | tout le monde |
| [`CLAUDE.md`](../CLAUDE.md) | Contexte projet pour assistant IA | dev / IA |
| [`architecture.md`](./architecture.md) | Pipeline, profil LCh, schéma `mapping.yml` | dev / designer avancé |
| [`builder-ui.md`](./builder-ui.md) | Éditeur visuel `mapping.yml` (UI) | designer / dev front |
| [`example.md`](./example.md) | Page témoin (smoke test) | tout le monde |
| [`storybook.md`](./storybook.md) | Storybook DSFR avec notre CSS | designer / dev |
| [`icons.md`](./icons.md) | Pipeline icônes (DSFR + Lucide) | designer / dev |
| [`history.md`](./history.md) | Comment on en est arrivé à l'état actuel | tout le monde |
| [`glossary.md`](./glossary.md) | Vocabulaire design + technique | tout le monde |
| `visual-references/` (à la racine) | Captures de référence pour la palette | designer |

## Structure du repo

Vue d'ensemble pour situer chaque fichier :

```
dsfr-override/
├── README.md                ← entrée principale
├── CLAUDE.md                ← contexte pour assistant IA
├── docs/                    ← cette doc
├── mapping.yml              ← la config courante (couleurs, typo, etc.)
├── mapping.yml.example      ← un exemple pré-rempli (palette ADEME)
├── dsfr/                    ← submodule git du DSFR (jamais modifié)
├── builder/                 ← le builder Node.js
├── builder-ui/              ← l'éditeur visuel `mapping.yml`
├── overrides/               ← overrides SCSS (générés ou manuels)
├── example/                 ← page témoin (smoke test visuel)
├── storybook/               ← workspace Storybook (322 stories DSFR)
├── visual-references/       ← captures de la palette ADEME
└── dist/                    ← sortie du build (ignoré par git)
```
