# Moodly — manager et collaborateur dans le même front

Application React Native / TypeScript avec Expo, API Node.js / Express / TypeScript et PostgreSQL via Prisma. Le code conserve les dossiers `frontend/` et `backend/` et la séparation écrans, navigation, composants, services et dépôts de données.

Les deux espaces utilisent **un seul front sur http://localhost:8081**. L’API écoute séparément sur http://localhost:3000. L’accueil propose « Vous êtes collaborateur ? » et « Vous êtes manager ? ». Le serveur vérifie le rôle du compte après validation du mot de passe ; le choix de l’accueil ne donne aucun droit supplémentaire.

Les écrans reprennent les maquettes de Marie : couleurs lavande et bleu, typographie Inter, cartes arrondies, saisie du mood et gestion des collaborateurs.

## Mettre à jour une installation existante

Depuis la racine de votre copie du dépôt, sur la branche `Rajeeva` :

```bash
git switch Rajeeva
git pull --ff-only origin Rajeeva
```

Conservez vos fichiers `.env` locaux. Dans `backend/.env`, vérifiez :

```dotenv
APP_URL=http://localhost:8081
CORS_ORIGINS=http://localhost:8081
```

Dans `frontend/.env` :

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```

`APP_URL` est l’adresse ouverte par les invitations et les liens de réinitialisation. Pour un téléphone ou un autre ordinateur du même réseau privé, utilisez l’adresse LAN du Mac à la place de `localhost` dans les deux fichiers.

Arrêtez les anciens fronts avec Ctrl+C avant de lancer le front commun. Gardez un seul processus Expo pour cette copie.

Dans le premier terminal, depuis la racine :

```bash
cd backend
npm run prisma:generate
npm run prisma:deploy
npm run dev
```

La migration ajoute trois colonnes d’invitation, sans supprimer les comptes, équipes ou réponses existants. Si les dépendances ne sont pas encore installées, exécutez `npm ci` dans ce dossier avant ces commandes.

Dans le deuxième terminal, depuis la racine :

```bash
cd frontend
npm run web
```

Ouvrez http://localhost:8081. Reconnectez-vous après la mise à jour pour obtenir une nouvelle session. Pour les dépendances du front, utilisez `npm ci` dans `frontend/` si nécessaire. Node.js 22.13 ou plus récent est requis.

## Créer un compte collaborateur

1. Connectez-vous dans l’espace manager avec un compte responsable d’une équipe.
2. Ouvrez **Paramètres → Collaborateurs → Ajouter un collaborateur**.
3. Renseignez prénom, nom, e-mail professionnel et équipe. Le rôle reste Collaborateur.
4. Sur sa fiche, cliquez sur **Activer le compte** pour préparer/envoyer son invitation.
5. Le collaborateur ouvre son lien personnel, définit son mot de passe, puis se connecte depuis l’espace collaborateur.

Le compte reste **en attente d’activation** jusqu’à la création du mot de passe. Le lien expire après 24 heures, ne peut être utilisé qu’une fois, et un nouvel envoi remplace l’ancien lien. L’activation par simple connaissance de l’e-mail est refusée.

La liste affiche les comptes réels, les compteurs actifs/en attente, une recherche par nom ou e-mail et les fiches modifiables. Un manager peut gérer uniquement les collaborateurs de ses équipes ; l’administrateur peut gérer ceux de son entreprise. La gestion des comptes n’affiche aucune réponse individuelle au mood.

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
