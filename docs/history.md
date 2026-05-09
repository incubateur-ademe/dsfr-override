# Historique du projet

Cette page retrace **comment le projet en est arrivé à son état actuel**. Pour la spec architecturale courante, voir [`architecture.md`](./architecture.md). Pour l'usage, voir le `README.md`.

## Contexte

ADEME a besoin d'un design system dérivé du DSFR : conserver la mécanique éprouvée (composants, scheme dark/light, accessibilité RGAA AA), mais imposer une identité distincte (palette, typographie) et neutraliser les éléments réservés à l'État (Marianne, header/footer officiels). La contrainte forte : suivre les évolutions du DSFR upstream sans coût de maintenance important.

## POC v1 — Token Swap HSL (abandonné)

**Approche** : fork direct du DSFR, modification au sed des tokens dans `_options.scss`. Génération de la palette par interpolation HSL piecewise (segments linéaires sur la luminosité, teinte fixée par anchor).

**Limites identifiées** :
- HSL n'est pas perceptuellement uniforme : les écarts visuels entre grades adjacents varient selon la teinte (un bleu et un rouge avec le même `S/L` n'ont pas la même luminance perçue).
- Les noms de grade DSFR (`main-525`, etc.) encodent `L*×10`, mais HSL travaille sur la luminosité `L`. Décorrélation gênante.
- Les ratios WCAG mesurés divergeaient de la cible Phase 1 documentée.

→ Abandonné au profit d'une approche LCh.

## POC v2 — Token Swap LCh (validé)

**Approche** : même fork direct du DSFR, mais palette régénérée via remapping CIELAB. Pour chaque famille on calcule chaque grade en partant d'un anchor (luminance, chroma, teinte) et en faisant varier `L*` selon un profil DSFR-compatible. Chroma et teinte sont préservées par grade pour garder une cohérence perceptuelle.

**Bonus apporté** : renommage explicite des préfixes de famille (`blue-france` → `blue-ate`, `red-marianne` → `red-laura`) pour forcer les consommateurs à migrer consciemment plutôt que de subir un drift silencieux.

**Validations** :
- Ratios WCAG matchent la cible RGAA AA à ±0.02 près.
- Rendu visuel validé sur la page témoin et le storybook.

**Limites de l'approche fork direct** :
- À chaque release DSFR upstream, il faut rebaser les modifs. Coût de maintenance qui croît avec la divergence.
- Risque de drift silencieux si un fichier DSFR est modifié sans que le fork s'en aperçoive.

→ Le rendu cible est validé, mais le mécanisme de fork direct est trop lourd. Décision : tout réimplémenter en **builder override-based**.

## Builder override-based (état actuel)

**Approche** : DSFR reste un submodule git **intouché**. Le builder lit un `mapping.yml` (la spec utilisateur), génère des fichiers SCSS d'override depuis cette spec, lance la compilation Sass du DSFR avec ces overrides ajoutés dans la cascade, applique d'éventuels post-process (rename des préfixes, dedup PostCSS, banner).

**Mécanismes** (cf. [`architecture.md`](./architecture.md) pour les détails) :

1. Workspace physique (copie jetable du DSFR sous `.tmp/`) où on patche `_options.scss` (palette LCh) et `component/{main,legacy,print}.scss` (filter components).
2. Overrides SCSS générés depuis `mapping.yml` (`_font-face.scss`, `_radius.scss`, `_shadows.scss`, `_icons.scss`).
3. Manual overrides (fichiers SCSS curated trackés dans `overrides/`, ex : `_card-fix.scss`).
4. Pipeline PostCSS (mqpacker + dedup + banner, cssnano en `--minify`).
5. Post-process sed sur `dist/*.css|js` pour le rename des préfixes.
6. Pipeline icônes (rsync DSFR + overrides Lucide + adds custom).

**Validations** : 54 tests automatisés couvrent les primitives LCh, le calcul de palette (match Phase 1 à ±3 bytes RGB), les validators (mapping schema, drift upstream, WCAG), et le build end-to-end.

**Critère de succès** : le builder, lancé avec `mapping.yml.example`, produit un `dist/dsfr-ademe.css` visuellement et numériquement identique à la sortie POC v2.

## Outils additionnels

Au-dessus du builder CLI, le projet inclut maintenant :

- **Builder UI** (`builder-ui/`) : éditeur visuel `mapping.yml` avec preview live (palette LCh recalculée côté client, page témoin synchronisée par postMessage). Permet d'itérer sur une palette / une typo sans toucher au YAML manuellement.
- **Page témoin** (`example/index.html`) : smoke test rapide après chaque build, exerce typo + palette + composants principaux.
- **Storybook** (`storybook/`) : 322 stories DSFR rendues avec le CSS construit, branding du chrome Storybook lui-même piloté par le `mapping.yml` configuré (DSFR override generic, pas ADEME-specific).
- **Validators** (`builder/validate/`) : schema `mapping.yml`, drift upstream sur les fichiers DSFR critiques (`pnpm baseline` pour snapshot), WCAG sur la palette LCh.

## Stack

- Node.js ≥22 (ESM-first, runtime via `tsx` pour les `.ts`).
- TypeScript strict (`@tsconfig/strictest` + `@tsconfig/node22`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`).
- esbuild pour le bundle UI (dev à la volée dans `serve.ts`, prod via `pnpm build:ui`).
- pnpm workspace (racine + `storybook/` isolé).
- Aucune dépendance lourde côté builder : Sass natif du DSFR, parser YAML (js-yaml), PostCSS pour la pipeline finale.

## Critères de neutralisation légale

- Marianne (typographie État, exclue de la MIT) : jamais shippée dans `dist/`.
- Logos / branding État (réservés aux Entités Autorisées, CGU art. 2) : composants header/footer DSFR exclus du build.
- Préfixes de famille (`blue-france`, `red-marianne`) : optionnellement renommés en post-process (`mapping.post-process.rename`) pour renforcer la neutralisation.
