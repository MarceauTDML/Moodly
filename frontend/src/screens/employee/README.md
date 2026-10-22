# Espace collaborateur

`DailyCheckinScreen` assemble les composants de `components/checkin`. `EmployeeStack` contient la saisie et l'accès aux paramètres partagés. `RootNavigator` choisit cet espace à partir du rôle serveur, sans afficher le dashboard manager aux collaborateurs.

`useDailyCheckin` gère le brouillon en mémoire locale et la vérification du statut quotidien. Il n'existe pas de slice Redux persistante de saisie afin de limiter la conservation des commentaires. `store/api/moodsApi.ts` appelle les routes existantes `/moods/options`, `/moods/today` et `POST /moods`. Les réponses sont validées dans `services/checkin.schemas.ts`.

Les catégories viennent de `/moods/options`, qui les fournit déjà : un deuxième appel à `/tags` n'est pas nécessaire. Le backend enregistre séparément la participation quotidienne et le contenu anonyme. L'écran n'affiche aucun historique individuel.
