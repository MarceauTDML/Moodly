# Moodly — manager et collaborateur dans le même front

Application React Native / TypeScript avec Expo, API Node.js / Express / TypeScript et PostgreSQL via Prisma. Le code conserve les dossiers `frontend/` et `backend/` et la séparation écrans, navigation, composants, services et dépôts de données.

Les deux espaces utilisent **un seul front sur http://localhost:8081**. L’API écoute séparément sur http://localhost:3000. L’accueil propose « Vous êtes collaborateur ? » et « Vous êtes manager ? ». Le serveur vérifie le rôle du compte après validation du mot de passe ; le choix de l’accueil ne donne aucun droit supplémentaire.

Les écrans reprennent les maquettes de Marie : couleurs lavande et bleu, typographie Inter, cartes arrondies, saisie du mood et gestion des collaborateurs.

## Démarrer en local

Prérequis : Node.js 22.13 ou plus récent et Docker Desktop. Les deux projets ont chacun leur `package.json` : ne lancez pas `npm ci` à la racine.

Première installation uniquement, depuis la racine :

```bash
docker compose up -d
```

Créez ensuite `backend/.env` et `frontend/.env` à partir des `.env.example` et renseignez vos secrets JWT locaux.

Dans le premier terminal, depuis la racine :

```bash
cd backend
npm ci
npm run prisma:generate
npm run prisma:deploy
npm run dev
```

L’API écoute sur http://localhost:3000. Les migrations n’effacent aucune donnée existante.

Dans le deuxième terminal, depuis la racine :

```bash
cd frontend
npm ci
npm run web
```

Ouvrez http://localhost:8081.

### Tester sur téléphone avec Expo Go

Le téléphone et l’ordinateur doivent être sur le même réseau Wi-Fi. Dans `frontend/.env`, remplacez `localhost` par l’adresse IP locale de l’ordinateur (par exemple `EXPO_PUBLIC_API_URL=http://192.168.1.14:3000/api/v1`), puis lancez `npm start` dans `frontend/` et scannez le QR code avec Expo Go. Sous Windows, autorisez Node.js sur les réseaux privés quand le pare-feu le demande. Expo Go doit prendre en charge le SDK Expo du projet (SDK 57).

`APP_URL` (dans `backend/.env`) est l’adresse ouverte par les invitations et les liens de réinitialisation.

## Créer un compte collaborateur

1. Connectez-vous dans l’espace manager avec un compte responsable d’une équipe.
2. Ouvrez **Paramètres → Collaborateurs → Ajouter un collaborateur**.
3. Renseignez prénom, nom, e-mail professionnel et équipe. Le rôle reste Collaborateur.
4. Sur sa fiche, cliquez sur **Activer le compte** pour préparer/envoyer son invitation.
5. Le collaborateur ouvre son lien personnel, définit son mot de passe, puis se connecte depuis l’espace collaborateur.

Le compte reste **en attente d’activation** jusqu’à la création du mot de passe. Le lien expire après 24 heures, ne peut être utilisé qu’une fois, et un nouvel envoi remplace l’ancien lien. L’activation par simple connaissance de l’e-mail est refusée.

La liste affiche les comptes réels, les compteurs actifs/en attente, une recherche par nom ou e-mail et les fiches modifiables. Un manager peut gérer uniquement les collaborateurs de ses équipes ; l’administrateur peut gérer ceux de son entreprise. La gestion des comptes n’affiche aucune réponse individuelle au mood.

## Données personnelles (RGPD)

Dans **Mon profil → Mes données**, chaque utilisateur peut :

- **télécharger ses données** (droit à la portabilité) : profil, entreprise, équipes, préférences et jours de participation, au format JSON, via le partage du téléphone ;
- **supprimer son compte** (droit à l’effacement), après confirmation par mot de passe. Le compte, les équipes, les préférences et les jours de participation sont supprimés. Les réponses au mood restent dans les statistiques d’équipe : elles n’ont jamais été reliées à leur auteur.

Le dernier administrateur d’une entreprise ne peut pas supprimer son compte tant qu’un autre administrateur n’a pas été nommé.

## Historique personnel

Le collaborateur retrouve ses 30 derniers jours dans **Mon espace → Mon historique**. Cet historique est enregistré **uniquement sur son téléphone**, dans le stockage chiffré (SecureStore), au moment où il envoie son mood : le serveur ne reçoit rien de plus et ne peut toujours pas relier une réponse à son auteur. Il conserve 12 mois, sans les commentaires, et reste séparé pour chaque compte utilisé sur le téléphone. Il est ajouté à l’export des données, effacé avec le compte, et peut être effacé à tout moment. Sur le web, rien n’est conservé.

## Ressources d’aide

L’écran **Besoin d’aide ?** est accessible à tous depuis les Paramètres, et depuis le menu du collaborateur. Il présente le 3114 (numéro national de prévention du suicide), la santé au travail et, si vous les renseignez, les contacts propres à l’entreprise dans `backend/.env` :

```dotenv
SUPPORT_RESOURCES=[{"label":"Psychologue d'entreprise","phone":"01 23 45 67 89","description":"Consultation confidentielle"}]
```

Chaque contact accepte `label`, `description`, `phone` et `url` (HTTPS uniquement), cinq au maximum. Une valeur invalide empêche le serveur de démarrer, avec un message explicite.

Après un vote, si au moins 3 des 5 derniers votes des 14 derniers jours sont « Stressé », la confirmation propose d’ouvrir ces ressources. Ce calcul utilise l’historique enregistré sur le téléphone : rien n’est envoyé au serveur, et l’application n’enregistre ni l’affichage de la proposition ni les appels. Ce n’est pas un diagnostic, seulement une invitation.

## Notifications push

Dans **Paramètres → Préférences de notification**, l’utilisateur choisit de recevoir le rappel quotidien sur son téléphone. L’autorisation n’est demandée qu’à ce moment-là, jamais au démarrage. Un seul téléphone reçoit les rappels d’un compte : en enregistrer un nouveau remplace le précédent. Toucher la notification ouvre la saisie du mood.

À la déconnexion, le téléphone est désinscrit, sans toucher à un autre téléphone enregistré entre-temps. Si l’envoi push échoue, le rappel part par e-mail (si l’utilisateur l’accepte), et les appareils désinscrits sont oubliés automatiquement.

Deux étapes sont nécessaires pour recevoir de vraies notifications :

1. **Associer un projet Expo**, une seule fois, depuis `frontend/` avec un compte Expo. La commande ajoute l’identifiant du projet à `app.json` :

   ```bash
   npx eas-cli init
   ```

2. **Sur Android, utiliser une version de développement** : depuis le SDK 53, Expo Go ne reçoit plus les notifications à distance. Par exemple `npx expo run:android` (Android Studio requis) ou un build EAS. L’application l’indique dans l’écran des préférences.

## Mode sombre

Dans **Paramètres → Apparence**, chaque utilisateur choisit Système, Clair ou Sombre. Le choix est mémorisé sur le téléphone ; « Système » suit le réglage de l’appareil.

Les composants ne contiennent plus de code couleur : ils lisent une palette sémantique (`frontend/src/theme/colors.ts`) via `useAppTheme()`, et leurs styles sont créés par `themedStyles()`. Seules les illustrations (visages, mascotte, teintes des humeurs) gardent leurs couleurs, avec une variante sombre. Un test vérifie que les deux palettes respectent les contrastes WCAG (4,5:1 pour le texte, 3:1 pour le texte secondaire et les éléments graphiques).

## Invitations par e-mail ou en local

Pour un envoi réel, renseignez les paramètres `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` et `MAIL_FROM` de `backend/.env` avec votre configuration de messagerie.

En développement, sans SMTP, la fiche affiche **Invitation préparée** et un lien à copier pour le collaborateur. Aucun e-mail n’est présenté comme envoyé. En production, l’envoi des invitations nécessite une configuration SMTP. N’inscrivez jamais ces identifiants dans Git.

## Base neuve et données de démonstration

Le fichier `docker-compose.yml` configure PostgreSQL sur le port hôte 2054. Pour une première installation uniquement, créez les `.env` à partir des `.env.example`, renseignez vos secrets JWT locaux et démarrez la base avec `docker compose up -d`, puis appliquez les migrations.

Le seed actuel efface et recrée les données : utilisez-le uniquement sur une base de démonstration dédiée. `SEED_DEMO_MOODS=false` est la valeur par défaut : il crée les comptes et équipes de démonstration sans inventer de réponses. Les managers voient donc l’état sans réponses tant que personne n’a participé. Pour un historique fictif explicitement souhaité, `SEED_DEMO_MOODS=true` l’active avant de lancer le seed sur cette base dédiée.

## Vérifications

Dans `backend/` :

```bash
npm run typecheck
npm run build
npm test -- --runInBand
```

Dans `frontend/` :

```bash
npm run typecheck
npm test
npm run format:check
```

Les tests automatisés couvrent notamment les invitations à usage unique, les rôles, le périmètre des équipes, le refus des comptes en attente, le contrat HTTP et l’anonymisation des réponses. Ils simulent Prisma et ne touchent pas votre base.

### Tests d’intégration

Ils tournent sur une vraie base PostgreSQL, `moodmap_test`, créée automatiquement dans le conteneur Docker du projet. La base de démonstration `moodmap` n’est jamais utilisée : un garde-fou refuse toute base dont le nom ne se termine pas par `_test`. Docker doit être démarré.

```bash
cd backend
npm run test:integration
```

Ils vérifient ce que les tests simulés ne peuvent pas prouver : un seul vote accepté quand deux envois arrivent en même temps, l’absence de toute colonne reliant une réponse à son auteur, le masquage réel des journées sous le seuil et des votes du jour, l’usage unique des invitations et la révocation des sessions après un changement de mot de passe. Pour une autre base, définissez `TEST_DATABASE_URL`.
