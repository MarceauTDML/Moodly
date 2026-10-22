# Front manager et collaborateur — Moodly

React Native + TypeScript, avec Expo. Implementation de la vision manager de Marie,
dans l'arborescence proposee par Marceau. Les accents sont utilises dans l'interface.
Le code est formate avec Prettier et chaque responsabilite a son dossier.

## Demarrer

Depuis `frontend`, avec Node 22.13 ou plus recent :

```bash
npm ci
cp .env.example .env
```

Dans le fichier `.env` local, renseigner `EXPO_PUBLIC_API_URL` avec l'URL du backend
terminee par `/api/v1`. Exemples de developpement :

- navigateur ou simulateur iOS sur le meme Mac : `http://localhost:3000/api/v1` ;
- emulateur Android : `http://10.0.2.2:3000/api/v1` ;
- telephone physique : adresse LAN du Mac, sur le meme reseau prive.

```bash
npm run web
```

La commande ouvre le front commun manager/collaborateur sur http://localhost:8081. Arrêter les anciens fronts avant de le lancer.
Pour une verification uniquement sur le Mac, `npm run web -- --localhost`.

Sur telephone, `npm start` puis ouvrir avec une version compatible d'Expo Go.
Cette livraison utilise Expo SDK 57 et React Native 0.86. Les modules natifs
sont fixes dans `package-lock.json`. Un autre SDK d'Expo Go peut necessiter
un development build ou une mise a niveau coordonnee du projet.

Ne pas lancer `npm ci` a la racine du depot : les deux projets ont leur propre
`package.json` et leur propre verrou de dependances.

## Backend

Le backend doit tourner separement. Lire le README a la racine.
Le front utilise le backend de la branche Rajeeva et les routes /api/v1.
Aucune route ne contient l'URL de votre infrastructure : seul `api.config.ts`
lit la configuration locale. L'absence d'URL produit un message, sans connexion
vers un serveur de demonstration.

Le compte de demonstration `manager@entreprise.fr` utilise le `SEED_PASSWORD`
choisi dans le `.env` backend. Aucun identifiant ni mot de passe n'est pre-rempli.
Les donnees de demonstration doivent rester dans une base de demonstration.

## Ou lire le code

| Dossier              | Responsabilite                                                    |
| -------------------- | ----------------------------------------------------------------- |
| `screens/manager`    | Assemblage des vues Mood map, Evolution et Tendances              |
| `screens/settings`   | Profil, mot de passe, preferences de notification                 |
| `screens/auth`       | Connexion, oubli et reinitialisation du mot de passe              |
| `components/layout`  | En-tete, contenu defilant, barre d'onglets                        |
| `components/moodmap` | Mascotte, score, conseil, courbe unique et tendances              |
| `components/ui`      | Boutons, champs, cartes, textes et fenetres                       |
| `components/shared`  | Chargement, erreur, absence de donnees, garde de role             |
| `hooks`              | Connexion et chargement des donnees d'une equipe                  |
| `store/api`          | Declaration des routes et cache RTK Query en memoire              |
| `store/slices`       | Session et equipe selectionnee                                    |
| `services`           | Client HTTP, configuration, validation des reponses, SecureStore  |
| `theme`              | Couleurs, espacements et typographie                              |
| `types`              | Contrats TypeScript du backend                                    |
| `utils`              | Dates, valeurs affichees, validation et segments du graphique     |
| `assets/fonts`       | Trois polices Inter locales et leur licence                       |
| `tests`              | Protections du client HTTP et de l'affichage des donnees masquees |

Exemple a expliquer a l'oral : `MoodMapScreen` appelle `useMoodMap`, qui charge
l'equipe et les requetes `summary` / `history`. `baseApi` transmet le jeton au
client HTTP. Le serveur controle le role et l'equipe. La reponse est validee
avant affichage. La couleur et la mascotte dependent du statut renvoye par le
serveur. Un score masque reste `null` et coupe la courbe.

## Accueil et gestion des comptes

L’accueil commun propose les deux espaces. Le formulaire transmet le portail choisi au serveur, qui vérifie le rôle réel après le mot de passe. Le code du choix se trouve dans `screens/auth/WelcomeScreen.tsx` ; `RootNavigator` ouvre ensuite les écrans selon le profil serveur.

`navigation/SettingsStack.tsx` conserve la barre d’onglets manager pendant la gestion des collaborateurs : liste, recherche et filtres, ajout, fiche, modification et invitation. Les contrats sont regroupés dans `services/collaborator.schemas.ts` et les appels dans `store/api/collaboratorsApi.ts`.

`ActivateAccountScreen` ouvre les liens `/activate-account?token=...` sur le même port. L’utilisateur définit son mot de passe ; aucun compte ne peut être activé en donnant seulement son adresse e-mail. Voir le README racine pour les migrations et la configuration SMTP / invitations locales.

## Perimetre des ecrans

La connexion et les trois etats du dashboard suivent le PDF Vision Manager.
Les ecrans Evolution, Tendances et Parametres completent les liens presents dans
ce prototype, avec les fonctionnalites deja fournies par l'API. Le PDF ne
contenait pas de maquette detaillee de ces ecrans secondaires.

- Un seul graphique par ecran, reutilise pour les differentes periodes.
- Aucune liste nominative des moods. La gestion des collaborateurs concerne uniquement leurs comptes et équipes, jamais leurs réponses.
- Les trous de donnees ne sont jamais remplaces par zero ni interpoles.
- Le serveur produit les snapshots de facon differee : un rafraichissement
  n'implique pas un recalcul en temps reel.
- Le filtre multi-equipes apparait seulement si le serveur en autorise plusieurs.
- Le role COLLABORATEUR ouvre EmployeeStack et la saisie quotidienne. Le serveur
  fournit les equipes autorisees et empeche une deuxieme reponse le meme jour.
- Les preferences de notification sont enregistrees ; le front n'inscrit pas
  automatiquement l'appareil aux notifications push.
- Un code de reinitialisation peut etre saisi, et le lien natif utilise
  `moodmap://reset-password?token=...`, compatible avec `APP_URL=moodmap://`.

## Verifier

```bash
npm run typecheck
npm test
npm run format:check
npx expo install --check
```

Les tests du backend se lancent dans `backend` avec `npm test -- --runInBand`.
Le contenu et le lancement de cette archive sont expliques dans `../README.md`.

La configuration de securite est expliquee dans le README a la racine.
