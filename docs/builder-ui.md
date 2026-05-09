# Builder UI

Mini-app web pour éditer interactivement `mapping.yml` avec preview live. Sortie = un fichier `mapping.yml` qu'on récupère via "Exporter", puis `pnpm build` en CLI normal pour produire le vrai `dist/`.

## Lancer

### Mode dev

```bash
pnpm serve                                         # PORT=8080 par défaut
# → http://localhost:8080/builder-ui/index.html
```

Le serveur intercepte la requête `/builder-ui/main.js` et la sert via `esbuild` à la volée (bundle ESM + sourcemap inline). Le bundle inclut `yaml`, `builder/lch.ts`, `builder/generate/palette.ts`, `builder/generate/profile-lch.ts` ; seul `highlight.js@11.11.1` reste externe via `esm.sh` (la version locale est CJS-only). Le cache du bundle est invalidé sur le `mtime` des sources, donc l'édition est instantanée.

### Mode prod (déployable)

```bash
pnpm build:ui
# → builder-ui/dist/{main.js, index.html, style.css, gallery.html}
```

Bundle statique (`scripts/build-ui.ts`, esbuild) servi tel quel par n'importe quel hébergement statique. L'`importmap` du `index.html` ne porte plus que les deux références CDN ; le reste est inliné.

## Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ topbar : titre + Charger / Reset / Exporter mapping.yml             │
├─────────────────────────────────────────────────────────────────────┤
│ Settings (≈22%)  │  Preview (≈56%)                │ YAML brut (≈22%)│
│  Méta            │  segmented Vue : Témoin |      │                 │
│  Typo            │   Galerie | Palette LCh        │                 │
│  Couleurs        │  segmented Thème : Auto |      │                 │
│  Border-radius   │   Light | Dark                 │                 │
│  Shadows         │  reflète le state en live :    │                 │
│  Composants ✶    │   • palette LCh recalculée     │                 │
│  Post-process ✶  │   • shadow-color light/dark    │                 │
│                  │   • border-radius par target   │                 │
│                  │   • rename familles + font     │                 │
│                  │   • theme bidirectionnel       │                 │
└─────────────────────────────────────────────────────────────────────┘

✶ = build CLI uniquement (pas de feedback live)
```

Trois vues commutables via `data-mode` :

- **Témoin** (`example/index.html` en iframe) : page exhaustive (typo / palette / boutons / formulaires / alertes / cards / consent banner / icônes). Reçoit du builder le state via `postMessage` et ré-écrit live le titre des sections palette, les swatches recalculés, le diagnostic typo, et le thème (radio Auto/Light/Dark sync).
- **Galerie** (`gallery.html`) : variantes des composants DSFR (tags, alerts complètes, etc.). Pas de theme switcher local — le thème est piloté depuis le builder.
- **Palette LCh** (DOM dans le builder, hors iframe) : grille de swatches par famille avec ratios WCAG sur `sun-157` / `main` / `625`, tagués AAA / AA / fail. Recompute à chaque édition.

Tous les boutons d'aide `?` ouvrent un singleton `#help-popup` (position fixed) qui échappe à n'importe quel `overflow: auto` parent. Les backticks dans le texte d'aide sont rendus en `<code>` monospace via un mini-parser markdown.

## Sync UI ↔ YAML

Source de vérité unique : un objet `state` JS qui mirror le schéma `mapping.yml`. Les deux panneaux sont des vues sur cet objet.

- **Édition côté UI** : un widget mute `state[path]` → re-sérialise YAML (immédiat, pas de debounce) → re-injecte les overrides CSS dans l'iframe.
- **Édition côté YAML brut** : parse au `input` event avec debounce 600ms. Si OK → remplace `state` → re-render tous les widgets. Si KO → fond rouge sur le textarea + message d'erreur sous le titre, état précédent intact.

## Preview live — ce qui est reflété

| Section | Live ? | Méthode |
|---|---|---|
| Métadonnées | non | informatif |
| Typo `css-name` / fonts | partiel | set `--font-family-primary` ; les fichiers ne sont pas servis donc fallback système |
| Couleurs (anchor / rename / recalibrate) | **oui** | recompute la palette LCh via `builder/lch.js` côté navigateur, override les vars per-grade ET les vars combinées DSFR (`sun-113-625`, `925-125`, etc. — hardcodées d'après `_sets.scss` v1.14.4) |
| Border-radius | **oui** | injection de règles CSS ciblées dans `<style>` de l'iframe |
| Shadows | **oui** | set `--shadow-color` sur `:root` light + `:root[data-fr-theme=dark]` |
| Composants à exclure | non | uniquement appliqué au `pnpm build` |
| Post-process / PostCSS / manual-overrides | non | idem |
| `post-css.banner-text` (textarea) | non | string custom écrasant le banner par défaut, vide → fallback (`data-strip-empty` sur le textarea retire la clé du YAML quand vide) |
| Rename famille (`cfg.rename`) | **oui** | propagé à la page témoin via postMessage → titres palette + swatches reflètent le rename live |
| `typography.primary.css-name` | **oui** | propagé idem → diagnostic font de la page témoin reflète le nom CSS |
| Thème de l'iframe | **bidirectionnel** | builder → témoin via postMessage à chaque switch ; témoin → builder via postMessage sur change humain (pas de loop : `radio.checked = true` programmatique ne déclenche pas `change`) |

### Pourquoi override les vars combinées ET les per-grade

Les composants DSFR ne lisent jamais `--blue-france-sun-157` directement, ils lisent `--blue-france-sun-113-625` (issue de la map `$sets` en SCSS). Cette var combinée est émise dans le CSS comme **valeur hex littérale** (`#001977`), pas via `var()`. Donc redéfinir uniquement les per-grade ne change rien au rendu.

Le builder UI hardcode la liste des 7 combinaisons que DSFR émet pour les familles primaires (`sun-113-625`, `850-200`, `925-125`, `950-100`, `975-75`, `main-525`, `975-sun-113`) et les override avec les valeurs LCh recalculées. Si DSFR change la structure de `_sets.scss` (drift), c'est un fix à pousser ici.

## Toutes les familles DSFR

L'éditeur de couleurs propose les 24 familles connues de `dsfr/src/module/color/variable/_options.scss` (sauf `grey`, qui suit son propre régime DSFR). Chaque famille s'ajoute via un dropdown footer ou les raccourcis utility (info / success / warning / error). L'input « Nom DSFR (clé) » est un `<select>` fermé sur cette liste — il renomme la clé dans `state.colors` en préservant l'ordre.

La preview live des combinaisons fonctionne pour toute famille : au boot, le builder fetch `/__api/dsfr-shade-combos`, qui parse `_sets.scss` côté serveur et renvoie `{ family: [{ name, light, dark }, ...] }`. La liste hardcodée pour `blue-france` / `red-marianne` reste comme fallback si l'endpoint est indispo.

## Couleurs utilitaires (`info` / `success` / `warning` / `error`)

Les utilitaires ont une UX de validation dédiée :

- **Zones de teinte** (LCh, h°) larges : `error` 340–40°, `warning` 20–80°, `success` 90–180°, `info` 180–280°. Un anchor hors zone affiche un bandeau d'alerte sous la famille.
- **Sanity checks supplémentaires** : `L* < 35` rejeté (trop sombre), round-trip `lchToHex` qui dévie de >12 bytes (saturation hors gamut sRGB).
- **Dropdown « Preset »** : raccourcis pré-validés.
  - `secondary` : reprend l'anchor de la 2ᵉ famille primaire (par convention `red-marianne` → `red-laura`). Activé seulement si sa teinte tombe dans la zone — sinon affiché en `disabled`.
  - `DSFR <utility>` : valeur historique DSFR (continuité), ex `#CE0500` pour error.
  - 2 alternatives "web standards" par utility (Crimson, Coral, Emerald, etc.).

## Icônes & manual-overrides

L'éditeur expose les sections `icons` (overrides + add) et `manual-overrides` directement.

Pour les icônes, deux APIs serveur alimentent l'expérience :

- `/__api/icons/dsfr` → liste des `~1036` icônes du submodule (avec leur groupe), peuplée dans un `<datalist>` autocomplete.
- `/__api/icons/lucide` → liste des `~1952` icônes Lucide.
- `/__api/icons/{dsfr,lucide}/svg/<name>.svg` → résolution de chaque SVG, utilisée pour l'aperçu `<img>` 24×24 affiché à gauche (DSFR origin) et à droite (Lucide cible) de chaque ligne d'override. L'aperçu est mis à jour chirurgicalement à chaque frappe (pas de re-render global).

## Limites assumées

- **Pas de backend live pour le rename / dedup / banner** : c'est intentionnel — la preview reste une simulation côté client (Niveau 1). Pour un rendu 100% fidèle (avec rename, dedup, banner CSS), exporter le YAML puis lancer `pnpm build`.

## Fichiers

```
builder-ui/
├── package.json         # deps: yaml + highlight.js (browser CDN-only)
├── index.html           # importmap pour hljs CDN ; main.js servi par esbuild en dev
├── gallery.html         # vue Galerie (composants DSFR exhaustifs)
├── main.ts              # state + render + sync + preview + postMessage
├── types/hljs.d.ts      # stub minimal pour les imports CDN (hljs/core, hljs/yaml)
└── style.css            # layout grid 3 colonnes, dark yaml pane, popup help
```

`example/index.html` (à la racine du repo) est l'autre vue chargée en iframe ; il fonctionne aussi en standalone via `pnpm serve`.

## Étendre

Pour ajouter une nouvelle section dans l'UI :

1. Étendre le type `Mapping` dans `builder/types.ts` avec la nouvelle clé.
2. Ajouter une fonction `renderXxx(): string` qui retourne le HTML (toutes les valeurs interpolées passent par `esc()`).
3. L'inclure dans le tableau de `renderAll()`.
4. Ajouter les `addEventListener` dans `attachHandlers()`.
5. Étendre `buildPreviewCss()` si la section a un effet visuel reflectible côté client.
