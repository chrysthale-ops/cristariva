# Plateforme administrateur CRISTARIVA

La plateforme est servie directement par le Worker Cloudflare sur `/admin`.

## Sécurité

Les données du tableau de bord sont protégées par le secret Cloudflare `ADMIN_TOKEN`. Ce secret ne doit jamais être ajouté au dépôt GitHub.

Avant le premier déploiement en production, créer `ADMIN_TOKEN` dans les secrets/variables du Worker Cloudflare avec une valeur longue et aléatoire. Le tableau de bord demande ensuite cette valeur et la conserve uniquement dans `sessionStorage` pour la durée de l'onglet.

L'API privée `/admin/metrics` refuse tout accès sans `Authorization: Bearer <ADMIN_TOKEN>`. La page d'administration elle-même ne contient aucune donnée avant authentification.

## Données conservées

Le stockage Durable Object conserve uniquement des compteurs agrégés : accès au site, demandes au moteur, succès, anomalies, limites atteintes, indisponibilités fournisseur, rejets qualité, latence moyenne et historique journalier sur 60 jours. Les 50 dernières anomalies conservent uniquement date, code HTTP, catégorie technique et identifiant de requête.

Aucune question, aucun contexte de consultation, aucune carte, aucune adresse IP et aucun contenu personnel ne sont stockés dans ces métriques.

## Préparation facturation

Les champs `transactions` et `revenueCents` existent déjà dans le modèle de données et le tableau de bord, mais aucun paiement ni aucune transaction financière ne sont traités par cette version. Ils serviront de base à une future intégration de facturation.

## Accès au site

`groq-hybrid-story.js` envoie une requête anonyme sans corps vers `/telemetry/access` au chargement. Le Worker n'accepte cette télémétrie que depuis les origines CRISTARIVA autorisées.

## Déploiement

Les branches de prévisualisation utilisent la configuration Preview de Cloudflare ; la production reste déployée depuis `main`.
