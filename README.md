# dsfr-override

Builder de design system dérivé du DSFR pour l'ADEME.

> **Statut** : Phase 2 (en cours d'implémentation). Voir `docs/implementation-plan.md`.

## Vision

Prend le DSFR en submodule git (sans le toucher), génère des overrides SCSS depuis un `mapping.yml`, build, et produit un design system dérivé. Quand DSFR upstream évolue, `git submodule update` et c'est tout.

## Quick start (à venir)

```bash
git clone <this-repo>
cd dsfr-override
git submodule update --init --recursive
npm install
npx ademe-ds build
```

## Pourquoi pas un fork direct du DSFR ?

Un fork direct (= patcher la source DSFR) crée un coût d'upgrade énorme : à chaque release upstream il faut rebaser nos modifs. Avec l'approche override, le DSFR reste intact et nos modifs sont des fichiers SCSS appended au build. Aucun rebase.

La Phase 1 du projet (dans `../dsfr/`) a fait un fork direct pour valider la cible visuelle. La Phase 2 (ce repo) réimplémente proprement.

## Documentation

- `CLAUDE.md` — contexte projet pour assistant IA
- `docs/phase1-poc-report.md` — rapport Phase 1 + spec architecturale Phase 2 (source de vérité)
- `docs/implementation-plan.md` — plan d'exécution séquencé
- `visual-references/` — captures de la cible visuelle à reproduire
