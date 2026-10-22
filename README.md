# Moodly — backend Rajeeva et frontend collaborateur

Ce dossier est une copie autonome à ouvrir sur ton ordinateur.

- `backend/` : copie à l'identique du backend de `MarceauTDML/Moodly`, branche `Rajeeva`, commit `bf0ab9fb8f1d3a4880742542b90df271a8e549fd` vérifié le 21 octobre 2026.
- `frontend/` : interface React Native / TypeScript avec le parcours collaborateur préparé à partir de l'arborescence de Marceau et de la vision de Marie.
- `docker-compose.yml` : configuration de la même branche `Rajeeva`.

Le frontend utilise la connexion partagée. Un compte dont le rôle serveur est `COLLABORATEUR` ouvre la saisie quotidienne ; les écrans manager existants restent disponibles pour leurs rôles respectifs. Aucun choix manuel du rôle n'est ajouté.

Les fichiers `.env` réels, dépendances installées, fichiers de build et historique `.git` ne sont pas inclus. Les fichiers `.env.example` servent de modèles. Aucun push n'est nécessaire pour tester ce dossier.

## 1. Préparer le dossier

Décompresse l'archive dans Téléchargements. Tu obtiendras :

```text
~/Downloads/Moodly-collaborateur-local/
```

Garde ce dossier séparé de `Moodly-Rajeeva` pour tester la partie collaborateur sans remplacer ta copie actuelle.

Node.js 22.13 ou plus récent est nécessaire.

## 2. Démarrer le backend

Si ton backend actuel tourne déjà sur le port 3000, tu peux le garder et passer directement à l'étape du frontend.

Pour lancer celui de cette archive :

```bash
cd "$HOME/Downloads/Moodly-collaborateur-local/backend"
npm ci
```

Copie manuellement ton fichier `backend/.env` existant dans ce nouveau dossier, sur ton Mac. Cela permet de réutiliser les mêmes paramètres locaux et comptes. Ne communique pas son contenu et ne l'ajoute pas à Git.

Pour une installation neuve, crée plutôt ton fichier local avec :

```bash
cp -n .env.example .env
```

Renseigne alors `DATABASE_URL`, tes secrets JWT locaux et les autres paramètres nécessaires. Utilise des secrets JWT uniques générés localement, et renseigne `CORS_ORIGINS=http://localhost:8081` pour le navigateur. Si le navigateur utilise un autre port, reporte son origine exacte.

La base doit être accessible sur le port configuré dans `DATABASE_URL`. Avec la configuration Docker de cette branche, le port hôte prévu est 2054. Une base déjà démarrée pour ton projet peut être réutilisée.

```bash
npm run prisma:generate
npm run dev
```

Le démarrage normal ne crée pas de nouveaux comptes et ne réinitialise pas la base. N'exécute pas `db:seed` ni `db:reset` sur ta base existante : ces commandes peuvent effacer ses données.

## 3. Démarrer le frontend collaborateur

Dans un deuxième terminal :

```bash
cd "$HOME/Downloads/Moodly-collaborateur-local/frontend"
npm ci
cp -n .env.example .env
```

Dans ce nouveau fichier `frontend/.env`, renseigne :

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```

Puis lance :

```bash
npm run web -- --clear
```

Ouvre l'adresse locale affichée par Expo. Connecte-toi avec un compte existant ayant le rôle `COLLABORATEUR` et une équipe attribuée. Un compte manager ouvre son espace manager.

Pour l'émulateur Android, l'URL locale devient `http://10.0.2.2:3000/api/v1`. Un téléphone physique utilise l'adresse LAN du Mac sur le même réseau privé. Le SDK de l'application native doit être compatible avec Expo 57.

## Parcours disponible

- Quatre humeurs : Épanoui, Bien, Moyen et Stressé.
- Catégories sélectionnables fournies par le backend.
- Commentaire facultatif limité à 500 caractères.
- Choix explicite de l'équipe lorsque plusieurs sont autorisées.
- Envoi et fenêtre de confirmation.
- Gestion du statut « déjà répondu aujourd'hui », des erreurs et de l'absence d'équipe.
- Menu, paramètres, profil, notifications et déconnexion.

Le serveur reste responsable des droits d'accès et de la limitation à une réponse par jour. La participation et le contenu du mood sont enregistrés séparément. Évite les détails identifiants dans un commentaire libre.

## Vérification du contenu

Les 92 fichiers du backend ont été comparés aux empreintes des fichiers Git du commit indiqué : ils sont identiques. Le frontend utilise ses routes existantes `/api/v1/moods/options`, `/api/v1/moods/today` et `POST /api/v1/moods`.

Les tests se lancent avec :

```bash
# Dans backend/
npm run typecheck
npm test -- --runInBand

# Dans frontend/
npm run typecheck
npm test
```

Les tests backend simulent Prisma et n'utilisent pas ta base réelle. Le ZIP contient le backend existant de ta branche ; il conserve donc également ses dépendances et ses choix de configuration. La présence des fichiers ne constitue pas un audit de sécurité complet.
