# ClaviTempo

ClaviTempo est une école de piano en français conçue pour faire progresser un débutant pas à pas. Son cursus associe clavier, solfège, rythme, harmonie, écoute, histoire, styles, technique, répertoire et création. Les 40 leçons sont réparties en six étapes progressives et ponctuées de bilans.

## Lancer avec Docker Desktop

Depuis ce dossier, lance :

```bash
docker compose up --build -d
```

Ouvre **http://localhost:3000**, puis crée ton compte ou connecte-toi. La plateforme accepte plusieurs comptes. Les autres personnes sur le même réseau peuvent ouvrir `http://ADRESSE-DE-CET-ORDINATEUR:3000`.

Le déploiement comprend un frontend React/Vite, une API FastAPI et une base SQLite. Les données restent dans le volume Docker `tempo_data` : reconstruire ou arrêter le conteneur ne supprime ni les comptes ni la progression.

Pour arrêter l’application sans effacer les données :

```bash
docker compose down
```

## Parcours pédagogique

Chaque leçon suit le cycle **comprendre → regarder et écouter → pratiquer**. Les évaluations sont réservées aux jalons du parcours. Les prérequis sont des recommandations pédagogiques : aucune leçon n’est verrouillée.

Les leçons contiennent des lectures guidées, des vidéos originales animées avec Remotion et narrées en français par Kokoro, ainsi que des exercices au clavier virtuel ou de rythme. Chaque capsule suit une progression guidée : introduction et objectif, plan, chapitres illustrés, pratique, repères « À retenir » et conclusion reliée à la suite. Les contrôles vidéo proposent le plein écran, le volume et la vitesse ; en plein écran, les contrôles restent accessibles. L’élève peut partager ses réglages entre toutes les capsules ou les conserver par vidéo. L’espace **Playlist** propose une file distincte par matière (Solfège, Piano, Rythme, etc.) et n’enchaîne que les capsules de la matière choisie, dans l’ordre du cursus. Un compte à rebours annulable de cinq secondes précède la vidéo suivante.

Les vidéos sont accessibles aux comptes connectés, avec une barre de progression déplaçable et une transcription complète ; le lecteur masque les commandes de téléchargement usuelles. Comme pour tout contenu lisible dans un navigateur, ces mesures ne peuvent pas empêcher une récupération technique par un utilisateur déterminé. En développement Vite, les requêtes `/media` sont également transmises à l’API protégée. Les MP4 sont générés localement et servis par l’application ; aucun compte ni clé d’API externe n’est nécessaire. Voir [video/README.md](./video/README.md) pour régénérer les capsules et [CLAUDE.md](./CLAUDE.md) pour le guide de reprise développeur.

Chaque leçon propose aussi des vidéos gratuites et des lectures/partitions complémentaires sélectionnées pour sa matière. Ces liens externes sont facultatifs : ils ne remplacent pas le cours, qui reste complet dans ClaviTempo. Les vidéos YouTube peuvent comporter des publicités. La disponibilité des ressources et le statut des éditions numérisées peuvent varier selon le pays.

## API

- `GET /api/health` — état du service ;
- `GET /api/v1/courses` et `GET /api/v1/courses/tempo-foundations` — parcours, leçons, catégories et niveaux ;
- `GET /api/v1/lessons` et `GET /api/v1/lessons/{lessonId}` — contenus des cours ;
- `GET /api/v1/progress` — progression du compte connecté ;
- `POST /api/v1/progress/steps` — enregistrer une étape de leçon ;
- `POST /api/v1/progress/lessons/{lessonId}/complete` — valider une leçon ;
- `POST /api/v1/assessments/{lessonId}/attempt` — soumettre un bilan, corrigé côté serveur.

L’authentification se fait par inscription et connexion. Les mots de passe sont hachés avec bcrypt et les comptes possèdent chacun leur progression. Le schéma SQLite et les sessions existants sont conservés par la migration.

## Sécurité

La configuration par défaut est destinée à un essai local ou sur un réseau de confiance. Avant toute exposition à un réseau public, définir un `SESSION_SECRET` aléatoire, placer l’application derrière un reverse proxy HTTPS et définir `HTTPS=true` pour activer les cookies sécurisés. Ne pas exposer directement le port HTTP public.
