import type { MoodStatus } from '../types/mood.types';
// Les donnees du serveur restent la reference pour le statut et les zones.
export const statusFromScore = (score: number): MoodStatus =>
  score >= 80 ? 'PARFAIT' : score >= 50 ? 'MOYENNE' : 'PREOCCUPANT';
