import type { MoodSnapshot, Team } from '@prisma/client';
import { CHART_ZONES, MIN_RESPONSES, STATUS_CONTENT, TREND_WINDOW_DAYS } from '../../config/mood.config';
import { hasEnoughResponses, maskBelowThreshold } from '../../services/anonymization.service';
import { findTrendReference } from '../../services/mood-score.service';
import type { HistoryPoint, MoodHighlight, MoodMapSummary, MoodTrend } from '../../types/mood.types';
import { addDays, dayRange, formatDay, formatTime, today } from '../../utils/date.util';
import { percentage, round1, statusFromScore, trendPercentage, trendPoints, weightedAverage } from '../../utils/score.util';
import { moodmapRepo } from './moodmap.repo';
import type { HistoryQuery } from './moodmap.validators';

const teamRef = (team: Team) => ({ id: team.id, name: team.name });

const direction = (points: number | null): MoodTrend['direction'] => {
  if (points === null) return null;
  if (points > 0) return 'UP';
  if (points < 0) return 'DOWN';
  return 'STABLE';
};

const buildTrend = (current: number, reference: number | null | undefined, periodDays: number): MoodTrend => {
  const points = trendPoints(current, reference);
  return { periodDays, points, percentage: trendPercentage(current, reference), direction: direction(points) };
};

const buildHighlight = (snapshot: MoodSnapshot): MoodHighlight =>
  snapshot.status === 'PREOCCUPANT'
    ? { type: 'STRUGGLING', label: 'Collaborateurs en difficulté', count: snapshot.strugglingCount, total: snapshot.totalResponses }
    : { type: 'FLOURISHING', label: 'Collaborateurs épanouis', count: snapshot.flourishingCount, total: snapshot.totalResponses };

const aggregateSnapshots = (snapshots: MoodSnapshot[]) => {
  const totalResponses = snapshots.reduce((sum, s) => sum + s.totalResponses, 0);
  const score = weightedAverage(snapshots.map((s) => ({ score: s.averageScore, weight: s.totalResponses })));
  const masked = maskBelowThreshold(score, totalResponses);
  return { totalResponses, averageScore: masked, status: masked === null ? null : statusFromScore(masked) };
};

export const moodmapService = {
  async getSummary(team: Team): Promise<MoodMapSummary> {
    const [latest, teamSize] = await Promise.all([
      moodmapRepo.findLatestSnapshot(team.id, MIN_RESPONSES),
      moodmapRepo.countVoters(team.id),
    ]);

    if (!latest) {
      return {
        team: teamRef(team),
        hasEnoughData: false,
        minResponses: MIN_RESPONSES,
        date: null,
        score: null,
        maxScore: 100,
        status: null,
        statusLabel: null,
        title: null,
        advice: null,
        lastUpdatedAt: null,
        lastUpdatedTime: null,
        totalResponses: 0,
        teamSize,
        participationRate: 0,
        highlight: null,
        trend: null,
      };
    }

    const reference = await findTrendReference(team.id, latest.date);
    const content = STATUS_CONTENT[latest.status];

    return {
      team: teamRef(team),
      hasEnoughData: true,
      minResponses: MIN_RESPONSES,
      date: formatDay(latest.date),
      score: Math.round(latest.averageScore),
      maxScore: 100,
      status: latest.status,
      statusLabel: content.label,
      title: content.title,
      advice: content.advice,
      lastUpdatedAt: latest.createdAt,
      lastUpdatedTime: formatTime(latest.createdAt),
      totalResponses: latest.totalResponses,
      teamSize,
      participationRate: percentage(latest.totalResponses, teamSize),
      highlight: buildHighlight(latest),
      trend: buildTrend(latest.averageScore, reference?.averageScore, TREND_WINDOW_DAYS),
    };
  },

  async getHistory(team: Team, { days }: HistoryQuery) {
    const end = today();
    const start = addDays(end, -(days - 1));
    const snapshots = await moodmapRepo.findSnapshots(team.id, start, end);
    const byDay = new Map(snapshots.map((s) => [formatDay(s.date), s]));

    const points: HistoryPoint[] = dayRange(end, days).map((day, i) => {
      const snap = byDay.get(formatDay(day));
      const visible = snap && hasEnoughResponses(snap.totalResponses);
      return {
        index: i + 1,
        label: `J${i + 1}`,
        date: formatDay(day),
        score: visible ? round1(snap.averageScore) : null,
        status: visible ? snap.status : null,
        totalResponses: snap?.totalResponses ?? 0,
      };
    });

    return {
      team: teamRef(team),
      periodDays: days,
      from: formatDay(start),
      to: formatDay(end),
      zones: CHART_ZONES,
      period: aggregateSnapshots(snapshots),
      points,
    };
  },
};
