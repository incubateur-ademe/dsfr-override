# Icônes

Le DSFR ship 1036 SVG dans `dsfr/src/dsfr/core/icon/<category>/<name>.svg`. Deux familles :

- **999 en famille `remix`** — viennent de [Remix Icon](https://remixicon.com/), MIT, déjà open source. Pas État-spécifique. On les garde telles quelles.
- **37 préfixées `fr--*`** — créées par/pour l'État (accessibility, capslock, fr--success-fill, etc.). Analogues "Marianne" côté icônes — à neutraliser dans un fork ADEME.

Notre builder gère ça via une section `icons:` dans `mapping.yml`, alimentée par le package npm [`lucide-static`](https://www.npmjs.com/package/lucide-static) (~1500 icônes Lucide en SVG, MIT).

## Pipeline

À chaque `pnpm build`, dans cet ordre :

1. **Rsync** : `dsfr/src/dsfr/core/icon/**` → `dist/icons/**` (1036 fichiers, ~150 ms). `dist/icons/` est wipée puis remplie depuis le submodule pristine — supprimer une entrée du mapping revient au fichier upstream tout seul.
2. **Overrides** : pour chaque `mapping.icons.overrides.<dsfr-name>: <lucide-name>`, copie `node_modules/lucide-static/icons/<lucide-name>.svg` par-dessus `dist/icons/<dsfr-category>/<dsfr-name>.svg`. La catégorie DSFR est trouvée automatiquement en indexant l'arborescence.
3. **Adds** : pour chaque `mapping.icons.add` entry, copie le SVG Lucide vers `dist/icons/lucide/<token>.svg` ET génère une règle dans `overrides/_icons.scss` :
   ```css
   .fr-icon-<token>::before, .fr-icon-<token>::after {
     -webkit-mask-image: url('icons/lucide/<token>.svg');
     mask-image: url('icons/lucide/<token>.svg');
   }
   ```

Les composants DSFR utilisent toujours `mask-image: url('icons/<category>/<name>.svg')`, donc remplacer le SVG sous le même path suffit — pas de modif côté CSS.

## Format de mapping

```yaml
icons:
  overrides:                            # remplace 1-1, garde le nom DSFR
    fr--success-fill: circle-check       # → dist/icons/system/fr--success-fill.svg = lucide circle-check
    fr--warning-fill: triangle-alert
    fr--error-fill:   circle-x
    fr--info-fill:    info
    fr--accessibility-fill: accessibility

  add:                                  # nouvelles classes utilitaires
    - flame                             # → .fr-icon-flame, source = lucide flame.svg
    - leaf
    - { token: ademe-pin, name: map-pin }   # alias custom
```

Format `add` accepté :

- **String** : `flame` → token et nom Lucide identiques (`.fr-icon-flame`, `flame.svg`)
- **Objet `{token, name}`** : `{ token: 'ademe-pin', name: 'map-pin' }` → classe `.fr-icon-ademe-pin` qui charge `lucide map-pin.svg`. Utile quand tu veux un nom métier qui ne match pas le nom Lucide.

## Garde-fous

- **Nom DSFR inconnu** dans `overrides` → erreur au build (`'fr--xxx' is not an existing DSFR icon`). Pas de typo silencieuse qui produirait un mask-image-404.
- **Nom Lucide inconnu** dans `overrides` ou `add` → erreur idem (`lucide icon 'xxx' not found`). Cherche sur [lucide.dev/icons](https://lucide.dev/icons/).

## Caveat visuel : stroke vs fill

Lucide est **stroke-based** (lignes fines, `fill="none" stroke="currentColor"`). Remix DSFR est **fill-based** (formes pleines).

En `mask-image`, l'alpha du SVG détermine où la couleur s'applique :

- **Remix DSFR** → fill noir → alpha plein sur tout le shape → icône colorée pleine
- **Lucide** → fill none → alpha zéro à l'intérieur, alpha 1 sur le stroke (~2 px) → icône colorée en silhouette

Les `fr--success-fill`, `fr--warning-fill`, etc., qui étaient des disques pleins en DSFR, deviennent des cercles en contour avec un pictogramme en stroke quand on les remplace par leur équivalent Lucide. **Fonctionnellement OK et visuellement cohérent avec le design Lucide** — mais c'est un changement notable de l'aspect des composants d'alerte. À valider avec l'équipe design avant de mapper les 33 autres `fr--*` qui restent en TODO dans le mapping.

Si on veut conserver le look "plein" pour certaines icônes, deux options :

1. Choisir une variante Lucide existante en mode rempli (peu nombreuses : `square-check-big`, etc.).
2. Pré-traiter les SVG Lucide à la copie pour transformer `fill="none" stroke="currentColor"` en `fill="currentColor"`. Donne une silhouette pleine mais perd la finesse Lucide. Pas implémenté ; décision design à prendre d'abord.

## État actuel des `fr--*`

| `fr--` original | Mapping ADEME | Statut |
|---|---|---|
| success-fill / -line | `circle-check` | ✓ |
| warning-fill / -line | `triangle-alert` | ✓ |
| error-fill / -line | `circle-x` | ✓ |
| info-fill / -line | `info` | ✓ |
| accessibility-fill / -line | `accessibility` | ✓ |
| bold, highlight, quote-fill / -line | — | À mapper |
| alert-warning-fill, alert-warning-2-fill | — | À mapper |
| ear-off-*, sign-language-*, mental-disabilities-* | — | À mapper |
| avalanches-*, submersion-*, capslock-line, equal-circle-fill, theme-fill | — | À mapper |
| dailymotion-*, tiktok-* | — | À mapper |
| arrow-left-s-first-line, arrow-left-s-line-double, arrow-right-s-last-line, arrow-right-s-line-double | — | À mapper |

Au total : **10 mappées sur 37**. Les 27 restantes ne sont pas critiques (peu utilisées dans les composants core), mais à mapper si on veut une neutralisation 100%.

## Tests

8 tests dans `builder/generate/icons.test.js` :

- mapping vide → DSFR pristine
- override applique bien le Lucide à la bonne category
- override sur nom DSFR inconnu → throw
- override sur nom Lucide inconnu → throw
- add string → token = name
- add objet → alias respecté
- `generateIconAddsScss` produit les règles CSS attendues
- `generateIconAddsScss` retourne `''` sur entrée vide
