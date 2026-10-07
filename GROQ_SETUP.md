# Activation du récit mixte Groq
1. Vérifier que le projet Netlify cristariva est relié au dépôt chrysthale-ops/cristariva et à la branche main.
2. Fusionner la PR après validation.
3. Dans les variables d’environnement Netlify, ajouter GROQ_API_KEY avec la clé Groq, dans le contexte Production et pour les Functions. Ne jamais la placer dans GitHub ou dans un fichier public.
4. Optionnel : GROQ_MODEL (par défaut openai/gpt-oss-120b, modèle documenté avec sorties structurées).
5. Relancer un déploiement Netlify pour que les Functions reçoivent la variable.
6. Tester un tirage sur https://cristariva.netlify.app puis sur GitHub Pages. La fonction est /.netlify/functions/interpret.
Le récit local est conservé si le relais est absent, si la clé manque, si les quotas sont atteints, si la réponse est incomplète ou si une erreur survient. La clé et les erreurs du fournisseur ne sont jamais renvoyées au navigateur.
La question, le domaine, les cartes et leurs significations sont transmis à Groq. Aucun renseignement de naissance n’est envoyé par ce module.
Les réponses sont contrôlées pour le nombre et l’ordre des segments, mais cela ne garantit pas leur fidélité sémantique : une validation humaine de tirages représentatifs reste nécessaire.
Les règles Netlify limitent chaque IP et domaine à 6 appels/minute. Vérifier leur application dans le journal du déploiement. CORS n’est pas une authentification. Conserver les forfaits gratuits ; leur disponibilité et leurs quotas dépendent des fournisseurs.
