import { lastDays, type HistoryEntry } from './moodHistory.util';

// Calculé sur le téléphone, à partir de l'historique local : rien n'est envoyé au serveur.
// Ce n'est pas un diagnostic, seulement une invitation à consulter les ressources d'aide.
export const SUPPORT_RECENT_VOTES = 5;
export const SUPPORT_DIFFICULT_VOTES = 3;
const SUPPORT_PERIOD_DAYS = 14;

export const suggestsSupport = (entries: HistoryEntry[], today: string) => {
  const since = lastDays(today, SUPPORT_PERIOD_DAYS)[0]!;
  const recent = entries
    .filter((e) => e.date >= since && e.date <= today)
    .slice(-SUPPORT_RECENT_VOTES);
  return recent.filter((e) => e.mood === 'STRESSE').length >= SUPPORT_DIFFICULT_VOTES;
};
