import { MoodLevel, type MoodSnapshot } from '@prisma/client';
import { prisma } from '../config/prisma.config';
import { FLOURISHING_LEVELS, MIN_RESPONSES, STRUGGLING_LEVELS, TREND_WINDOW_DAYS } from '../config/mood.config';
import type { DailyStats } from '../types/mood.types';
import { addDays } from '../utils/date.util';
import { averageScore, statusFromScore, trendPercentage } from '../utils/score.util';

const emptyDistribution = (): Record<MoodLevel, number> => ({
  EPANOUI: 0,
  BIEN: 0,
  MOYEN: 0,
  STRESSE: 0,
});

export const buildStats = (moods: MoodLevel[]): DailyStats => {
  const distribution = emptyDistribution();
  for (const mood of moods) distribution[mood] += 1;
  const score = averageScore(moods);
  return {
    totalResponses: moods.length,
    averageScore: score,
    status: score === null ? null : statusFromScore(score),
    flourishingCount: FLOURISHING_LEVELS.reduce((sum, level) => sum + distribution[level], 0),
    strugglingCount: STRUGGLING_LEVELS.reduce((sum, level) => sum + distribution[level], 0),
    distribution,
  };
};

export const computeDailyStats = async (teamId: string, day: Date): Promise<DailyStats> => {
  const entries = await prisma.moodEntry.findMany({
    where: { teamId, submittedAt: { gte: day, lt: addDays(day, 1) } },
    select: { mood: true },
  });
  return buildStats(entries.map((e) => e.mood));
};

export const findTrendReference = (teamId: string, day: Date): Promise<MoodSnapshot | null> =>
  prisma.moodSnapshot.findFirst({
    where: {
      teamId,
      date: { gte: addDays(day, -TREND_WINDOW_DAYS), lt: day },
      totalResponses: { gte: MIN_RESPONSES },
    },
    orderBy: { date: 'asc' },
  });

export const upsertSnapshot = async (teamId: string, day: Date): Promise<MoodSnapshot | null> => {
  const stats = await computeDailyStats(teamId, day);
  if (stats.totalResponses === 0 || stats.averageScore === null || stats.status === null) return null;

  const reference = await findTrendReference(teamId, day);
  const data = {
    averageScore: stats.averageScore,
    status: stats.status,
    totalResponses: stats.totalResponses,
    flourishingCount: stats.flourishingCount,
    strugglingCount: stats.strugglingCount,
    trendPercentage30d: trendPercentage(stats.averageScore, reference?.averageScore),
    createdAt: new Date(),
  };

  return prisma.moodSnapshot.upsert({
    where: { teamId_date: { teamId, date: day } },
    create: { teamId, date: day, ...data },
    update: data,
  });
};

export const computeSnapshotsForDay = async (day: Date): Promise<number> => {
  const teams = await prisma.team.findMany({ select: { id: true } });
  let computed = 0;
  for (const team of teams) {
    if (await upsertSnapshot(team.id, day)) computed += 1;
  }
  return computed;
};
