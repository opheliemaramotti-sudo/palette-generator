# Mood Colors — règles de travail

## Projet

Mood Colors est un générateur de palettes moodboard statique en HTML, CSS et
JavaScript vanilla. L'utilisateur saisit une émotion ou une ambiance ; la page
génère une palette de 9 couleurs avec une barre HUE, un dégradé avec grain et
des exports PNG, CSS et JSON lorsqu'ils sont présents dans le projet.

## Stack à conserver

- HTML, CSS et JavaScript vanilla uniquement.
- Aucun framework, aucune dépendance externe, aucun build et aucun serveur Node.
- Conserver les scripts classiques avec `defer`, sans modules ES.
- Ne pas renommer, déplacer ou supprimer un fichier existant sans accord préalable.
- Ne pas recréer ni réécrire le projet ; modifier uniquement la demande et les fichiers concernés.

## Style de travail

- Répondre en français avec des explications simples et pédagogiques.
- Le code et les commentaires doivent rester en français.
- Préférer des fonctions courtes et des noms explicites.
- Travailler par petites étapes : expliquer, modifier, tester, puis attendre la validation.
- Faire un commit en français à chaque étape validée.
- Ne jamais pousser sur GitHub sans demande explicite de l'utilisateur.

## Replit

Le workflow **Start application** sert le projet statique avec :

`python3 -m http.server 5000 --bind 0.0.0.0`

Le serveur démarre depuis la racine du projet et l'aperçu Replit est accessible
sur le port 5000. `index.html` charge directement les fichiers CSS et JavaScript.

La police optionnelle « Mistical Spring » n'est pas incluse dans le dépôt. Le
titre utilise donc la police de secours Georgia. Voir `fonts/LISEZMOI.txt` avant
d'ajouter une copie correctement licenciée.