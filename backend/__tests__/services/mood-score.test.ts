import { MoodLevel, MoodStatus } from '@prisma/client';
import { buildStats } from '../../src/services/mood-score.service';
import { averageScore, statusFromScore, trendPercentage, trendPoints, weightedAverage } from '../../src/utils/score.util';

jest.mock('../../src/config/prisma.config', () => ({ prisma: {} }));

describe('score.util', () => {
  it('convertit les humeurs en score moyen /100', () => {
    expect(averageScore([MoodLevel.EPANOUI, MoodLevel.BIEN])).toBe(87.5);
    expect(averageScore([MoodLevel.STRESSE, MoodLevel.STRESSE, MoodLevel.MOYEN])).toBe(33.3);
    expect(averageScore([])).toBeNull();
  });

  it.each([
    [98, MoodStatus.PARFAIT],
    [80, MoodStatus.PARFAIT],
    [79.9, MoodStatus.MOYENNE],
    [58, MoodStatus.MOYENNE],
    [50, MoodStatus.MOYENNE],
    [32, MoodStatus.PREOCCUPANT],
  ])('score %p → statut %p', (score, status) => {
    expect(statusFromScore(score)).toBe(status);
  });

  it('calcule la tendance en points et en pourcentage', () => {
    expect(trendPoints(58, 60)).toBe(-2);
    expect(trendPoints(32, 62)).toBe(-30);
    expect(trendPercentage(98, 87.5)).toBe(12);
    expect(trendPercentage(50, null)).toBeNull();
    expect(trendPercentage(50, 0)).toBeNull();
  });

  it('pondère les moyennes par le nombre de réponses', () => {
    expect(weightedAverage([{ score: 100, weight: 3 }, { score: 50, weight: 1 }])).toBe(87.5);
    expect(weightedAverage([])).toBeNull();
  });
});

describe('mood-score.service › buildStats', () => {
  it('compte les épanouis, les stressés et la répartition', () => {
    const stats = buildStats([MoodLevel.EPANOUI, MoodLevel.EPANOUI, MoodLevel.BIEN, MoodLevel.STRESSE]);
    expect(stats).toEqual({
      totalResponses: 4,
      averageScore: 75,
      status: MoodStatus.MOYENNE,
      flourishingCount: 2,
      strugglingCount: 1,
      distribution: { EPANOUI: 2, BIEN: 1, MOYEN: 0, STRESSE: 1 },
    });
  });

  it('renvoie des stats vides sans réponse', () => {
    const stats = buildStats([]);
    expect(stats.totalResponses).toBe(0);
    expect(stats.averageScore).toBeNull();
    expect(stats.status).toBeNull();
  });
});
