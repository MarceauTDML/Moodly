# Mood Map

Application mobile de suivi **anonyme** de l'humeur des collaborateurs.

- **Collaborateur** : répond chaque jour à « Comment s'est passée ta journée ? » (Épanoui / Bien / Moyen / Stressé), choisit des tags et ajoute un commentaire optionnel.
- **Manager** : consulte la mood map de son équipe : score /100, statut (Parfait / Moyenne / Préoccupant), courbe sur 30 jours, tendances et évolution.

## Démarrage rapide (backend)

```bash
docker compose up -d
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npm run db:seed
npx ts-node src/seed.ts
npm run dev
```

Comptes de démo (mot de passe : `SEED_PASSWORD` du `.env`) :

| E-mail | Rôle |
| --- | --- |
| `admin@entreprise.fr` | ADMIN |
| `manager@entreprise.fr` | MANAGER |
| `manager.support@entreprise.fr` | MANAGER |
| `collaborateur@entreprise.fr` | COLLABORATEUR |

## Scripts

| Script | Rôle |
| --- | --- |
| `npm run dev` | Serveur avec rechargement (nodemon + ts-node) |
| `npm run build` / `npm start` | Build TypeScript puis exécution de `dist/` |
| `npm test` | Tests Jest (unitaires + API avec Prisma mocké) |
| `npm run typecheck` | Vérification TypeScript |
| `npm run prisma:migrate` | Nouvelle migration (dev) |
| `npm run db:seed` / `npm run db:reset` | Données de démo / reset complet |

## API — `/api/v1`

### Auth (écrans Connexion / Activation)
| Méthode | Route | Description |
| --- | --- | --- |
| POST | `/auth/login` | `{ email, password }` → `{ message, token, user }` |
| POST | `/auth/register` | `{ email, password }` : active un compte pré-enregistré par un manager ou un admin |
| POST | `/auth/collaborators` | MANAGER : `{ email, firstName?, lastName? }` pré-enregistre un collaborateur de son entreprise |
| GET | `/auth/mon-profil` | Contenu du jeton (session) |
| GET | `/auth/espace-manager` | Vérification de l'accès manager |

### Mot de passe oublié
| Méthode | Route | Description |
| --- | --- | --- |
| POST | `/password/forgot` | `{ email }` → e-mail avec lien (réponse identique que le compte existe ou non) |
| POST | `/password/reset` | `{ token, password }` |

### Check-in quotidien (écran « La question du jour »)
| Méthode | Route | Description |
| --- | --- | --- |
| GET | `/moods/options` | Question, 4 humeurs, 6 tags |
| GET | `/moods/today` | `hasSubmittedToday`, `canSubmit`, équipes |
| POST | `/moods` | `{ mood, tags?, comment?, teamId? }` → 201, ou 409 `ALREADY_SUBMITTED` |
| GET | `/tags` | Liste des tags |

### Mood map manager (MANAGER / ADMIN)
Chaque route existe aussi sous `/moodmap/teams/:teamId/...`. Sans `teamId`, c'est la première équipe dont le manager est responsable qui est utilisée.

| Méthode | Route | Écran |
| --- | --- | --- |
| GET | `/moodmap/summary` | Mood map : score, statut, titre, conseil, « Dernière mise à jour à HH:mm », carte « Tendances de l'équipe » (`highlight` + `trend` en points et en %) |
| GET | `/moodmap/history?days=30` | Graphique « Humeur collective » J1…J30 + zones idéale / passable / préoccupante |
| GET | `/moodmap/trends?days=30` | « Voir plus » : répartition des humeurs, tags (fréquence et score moyen), participation, commentaires anonymisés |
| GET | `/moodmap/evolution?granularity=day\|week\|month&periods=12` | Onglet Évolution : moyennes par période, meilleure et pire période, comparaison |

### Paramètres et administration
| Méthode | Route | Description |
| --- | --- | --- |
| GET / PATCH | `/users/me` | Profil (prénom, nom) |
| PATCH | `/users/me/password` | `{ currentPassword, newPassword }` |
| GET / PATCH | `/users/me/notifications` | `{ dailyReminderEnabled, emailNotificationsEnabled }` |
| PUT | `/users/me/push-token` | `{ pushToken: "ExponentPushToken[…]" \| null }` |
| GET / POST | `/users` | ADMIN : liste, création avec e-mail d'invitation (domaine de l'entreprise obligatoire) ; le compte est ensuite activé via `POST /auth/register` |
| GET / PATCH / DELETE | `/users/:userId` | ADMIN |
| GET / POST | `/teams` | Liste selon le rôle / création (ADMIN) |
| GET / PATCH / DELETE | `/teams/:teamId` | Détail avec membres / ADMIN |
| POST / PATCH / DELETE | `/teams/:teamId/members[/:userId]` | ADMIN : membres et responsable (`isLead`) |

`GET /health` vérifie l'API et la base.

## Anonymat

1. **Aucun lien utilisateur ↔ vote** : `UserDailyCheckin` sait *qui* a répondu, `MoodEntry` sait *quoi*, sans clé commune. Les deux sont écrits dans la même transaction.
2. **Horodatage tronqué au jour** : `submittedAt` et `createdAt` du check-in valent minuit, ce qui empêche de recouper un vote avec l'heure de participation.
3. **Seuil k-anonymat** (`MOOD_MIN_RESPONSES`, 3 par défaut) : aucun score, jour du graphique, score par tag ou commentaire n'est exposé en dessous du seuil.
4. **Recalcul différé** : le dashboard lit des snapshots recalculés par cron (toutes les 15 min) et non en temps réel, pour qu'un manager ne puisse pas déduire un vote individuel en rafraîchissant la page.
5. **Commentaires** : mélangés, sans date, et nettoyés des e-mails, téléphones et liens.
6. Les responsables d'équipe (`isLead`) ne votent pas pour leur propre équipe.

## Règles de calcul (`src/config/mood.config.ts`)

- Score : Épanoui 100, Bien 75, Moyen 50, Stressé 25 ; moyenne sur 100.
- Statut : ≥ 80 Parfait, ≥ 50 Moyenne, sinon Préoccupant.
- « Collaborateurs épanouis » = votes Épanoui ; « en difficulté » = votes Stressé (affiché quand le statut est Préoccupant). Le dénominateur est le nombre de réponses du jour.
- Tendance 30 j : comparaison avec le plus ancien snapshot fiable des 30 derniers jours, en points (`trend.points`) et en % (`trend.percentage`).

## Jobs (`src/jobs`)

| Job | Planification | Rôle |
| --- | --- | --- |
| compute-mood-snapshots | `CRON_SNAPSHOTS` (`*/15 * * * *`) | Snapshots du jour pour toutes les équipes |
| finalize-yesterday | `5 0 * * *` | Consolidation de la veille |
| daily-mood-reminder | `CRON_DAILY_REMINDER` (`0 17 * * 1-5`) | Push Expo, ou e-mail à défaut, aux collaborateurs qui n'ont pas répondu |

Sans `SMTP_HOST`, les e-mails sont loggés au lieu d'être envoyés.
