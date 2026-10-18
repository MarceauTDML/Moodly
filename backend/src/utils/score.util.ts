import { MoodLevel, MoodStatus } from '@prisma/client';
import { MOOD_SCORES, STATUS_THRESHOLDS } from '../config/mood.config';

export const round1 = (value: number): number => Math.round(value * 10) / 10;

export const moodToScore = (mood: MoodLevel): number => MOOD_SCORES[mood];

export const averageScore = (moods: MoodLevel[]): number | null => {
  if (moods.length === 0) return null;
  const total = moods.reduce((sum, mood) => sum + moodToScore(mood), 0);
  return round1(total / moods.length);
};

export const weightedAverage = (items: { score: number; weight: number }[]): number | null => {
  const weight = items.reduce((sum, i) => sum + i.weight, 0);
  if (weight === 0) return null;
  return round1(items.reduce((sum, i) => sum + i.score * i.weight, 0) / weight);
};

export const statusFromScore = (score: number): MoodStatus => {
  if (score >= STATUS_THRESHOLDS.PARFAIT) return MoodStatus.PARFAIT;
  if (score >= STATUS_THRESHOLDS.MOYENNE) return MoodStatus.MOYENNE;
  return MoodStatus.PREOCCUPANT;
};

export const trendPoints = (current: number, reference: number | null | undefined): number | null =>
  reference == null ? null : round1(current - reference);

export const trendPercentage = (current: number, reference: number | null | undefined): number | null =>
  reference == null || reference === 0 ? null : round1(((current - reference) / reference) * 100);

export const percentage = (part: number, total: number): number => (total === 0 ? 0 : round1((part / total) * 100));
