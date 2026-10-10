# Réorganisation progressive du dépôt CRISTARIVA

Date de démarrage : 10 octobre 2026.

## Principes

- `main` reste la branche de production.
- `backup/before-reorganization-20261010` est le point de restauration de départ.
- Les cartes restent dans `cards/` tant que tous les chargeurs et chemins de production n'ont pas été inventoriés et testés.
- Les déplacements sont réalisés par petits lots, chacun validé par la suite de tests de non-régression.
- Les branches historiques ne sont supprimées qu'après vérification qu'elles ne contiennent plus de changement utile non intégré.
- Les configurations imposées par GitHub, Cloudflare, Netlify ou les outils de build restent à leurs emplacements requis.

## Organisation cible

- `cards/` : cartes et ressources propres aux jeux, regroupées progressivement par jeu lorsque les chargeurs auront été adaptés.
- `assets/` : fonds, logos, icônes, polices et ressources d'interface.
- `data/` : définitions, significations, traductions et données structurées.
- `scripts/` : scripts de préparation, harmonisation, migration et export encore utilisés.
- `tests/` : tests de non-régression.
- `docs/` : documentation active et archives techniques.
- `.github/workflows/` : workflows GitHub encore nécessaires.

## Phase 1 — sans impact sur la production

- déplacer la documentation Groq dans `docs/deployment/` ;
- archiver l'ancien guide d'installation dans `docs/archive/` ;
- documenter la stratégie de réorganisation ;
- conserver les chemins applicatifs et les cartes inchangés ;
- faire valider le lot par la CI avant fusion.

## Phases suivantes

1. Inventorier les fichiers racine et les classer : production, source, archive ou temporaire.
2. Identifier les images racine réellement référencées avant tout déplacement.
3. Inventorier les workflows GitHub et distinguer les workflows actifs des workflows ponctuels d'installation/harmonisation.
4. Regrouper les scripts encore utilisés sous `scripts/` et mettre à jour leurs appels.
5. Extraire progressivement les données et la logique aujourd'hui embarquées dans les pages monolithiques, sans changer le comportement fonctionnel.
6. Rationaliser `cards/` par jeu uniquement après adaptation et test de tous les chargeurs.
7. Nettoyer les branches historiques une fois les PR ouvertes et les différences avec `main` vérifiées.

## Contrôles obligatoires avant chaque fusion

- `npm test` ;
- chargement des cartes de chaque jeu ;
- tirages 1, 3 et 5 cartes ;
- cartes renversées ;
- filtrage des relations ;
- récits locaux et moteur externe ;
- traductions FR/EN ;
- astrologie et numérologie ;
- fonctionnement desktop/mobile ;
- absence de 404 sur les ressources déplacées.
