# Builder UI

Mini-app web pour éditer interactivement `mapping.yml` avec preview live. Sortie = un fichier `mapping.yml` qu'on récupère via "Exporter", puis `pnpm build` en CLI normal pour produire le vrai `dist/`.

## Lancer

```bash
node builder/serve.js                              # PORT=8765 par défaut
# → http://localhost:8765/builder-ui/index.html
```

Pas de step de build : HTML/CSS/JS natif, le navigateur charge directement les fichiers via `<script type="importmap">` qui pointe sur `node_modules/yaml/browser/` et sur `builder/lch.js` réutilisé tel quel.

## Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ topbar : titre + Charger / Reset / Exporter mapping.yml             │
├─────────────────────────────────────────────────────────────────────┤
│ Settings (≈22%)  │  Preview iframe (≈56%)         │ YAML brut (≈22%)│
│  Méta            │  example/index.html            │                 │
│  Typo            │  reflète le state en live :    │                 │
│  Couleurs        │   • palette LCh recalculée     │                 │
│  Border-radius   │   • shadow-color light/dark    │                 │
│  Shadows         │   • border-radius par target   │                 │
│  Composants ✶    │                                │                 │
│  Post-process ✶  │                                │                 │
└─────────────────────────────────────────────────────────────────────┘

✶ = build CLI uniquement (pas de feedback live)
```

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

### Pourquoi override les vars combinées ET les per-grade

Les composants DSFR ne lisent jamais `--blue-france-sun-157` directement, ils lisent `--blue-france-sun-113-625` (issue de la map `$sets` en SCSS). Cette var combinée est émise dans le CSS comme **valeur hex littérale** (`#001977`), pas via `var()`. Donc redéfinir uniquement les per-grade ne change rien au rendu.

Le builder UI hardcode la liste des 7 combinaisons que DSFR émet pour les familles primaires (`sun-113-625`, `850-200`, `925-125`, `950-100`, `975-75`, `main-525`, `975-sun-113`) et les override avec les valeurs LCh recalculées. Si DSFR change la structure de `_sets.scss` (drift), c'est un fix à pousser ici.

## Limites assumées

- **Familles autres que `blue-france` / `red-marianne`** : la preview live des combinaisons ne fonctionne pas (la liste DSFR_SHADE_COMBOS est hardcodée pour ces 2 familles seulement). L'export YAML reste correct, le `pnpm build` final regenérera tout.
- **Icônes** : pas encore d'éditeur d'overrides Lucide dans l'UI. Edition côté YAML uniquement pour l'instant.
- **Manual overrides** : pareil, YAML uniquement.
- **Pas de backend** : c'est intentionnel — la preview est une simulation côté client (Niveau 1). Pour un rendu 100% fidèle (avec rename, dedup, banner), exporter le YAML puis lancer `pnpm build`.

## Fichiers

```
builder-ui/
├── package.json     # dep: yaml@2 (parser + stringifier ESM)
├── index.html       # importmap pour yaml + builder/lch.js + builder/generate/palette.js
├── main.js          # state + render + sync + preview
└── style.css        # layout grid 3 colonnes, dark yaml pane
```

## Étendre

Pour ajouter une nouvelle section dans l'UI :

1. Ajouter une fonction `renderXxx()` qui retourne le HTML (toutes les valeurs interpolées passent par `esc()`).
2. L'inclure dans le tableau de `renderAll()`.
3. Ajouter les `addEventListener` dans `attachHandlers()`.
4. Étendre `buildPreviewCss()` si la section a un effet visuel reflectible côté client.
