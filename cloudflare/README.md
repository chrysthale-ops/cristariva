# Relais Cloudflare Groq

Dans Workers & Pages, créer une application et importer chrysthale-ops/cristariva depuis GitHub.
Branche : main après fusion de cette PR.
Répertoire racine : cloudflare.
Commande de build : vide.
Commande de déploiement : npx wrangler deploy.
Nom : cristariva-groq.

Après création, ouvrir Settings > Variables and Secrets > Add, choisir Secret, nom GROQ_API_KEY et valeur la clé Groq. Déployer.
Communiquer seulement l’URL publique workers.dev pour raccorder le client. Le client utilise encore Netlify tant que cette URL n’est pas connue.

/health indique seulement si la clé est configurée ; cela ne prouve pas son bon fonctionnement.
Le relais conserve la validation de couverture et des erreurs Groq. GROQ_LIMITER limite à 6 requêtes par minute par IP et par localisation Cloudflare (compteur approximatif, pas un plafond global de dépenses). CORS n’est pas une authentification.
Tests locaux avec fournisseur simulé ; le test réel nécessite le déploiement et le secret.
