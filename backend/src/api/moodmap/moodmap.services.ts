import { MoodLevel, type MoodSnapshot, type Team } from '@prisma/client';
import { CHART_ZONES, MIN_RESPONSES, MOOD_LABELS, STATUS_CONTENT, TREND_WINDOW_DAYS } from '../../config/mood.config';
import { anonymizeComments, hasEnoughResponses, maskBelowThreshold } from '../../services/anonymization.service';
import { buildStats, findTrendReference } from '../../services/mood-score.service';
import type { HistoryPoint, MoodHighlight, MoodMapSummary, MoodTrend } from '../../types/mood.types';
import type { TagStat } from '../../types/tag.types';
import { addDays, dayRange, formatDay, formatTime, startOfIsoWeek, toDateKey, today } from '../../utils/date.util';
import {
  averageScore,
  percentage,
  round1,
  statusFromScore,
  trendPercentage,
  trendPoints,
  weightedAverage,
} from '../../utils/score.util';
import { moodmapRepo } from './moodmap.repo';
import type { EvolutionQuery, HistoryQuery, TrendsQuery } from './moodmap.validators';

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

// Les managers ne voient que des journées terminées : un agrégat du jour, recalculé
// après chaque réponse, permettrait de déduire l'humeur du dernier votant par différence.
const lastCompleteDay = () => addDays(today(), -1);

// Une journée sous le seuil n'entre dans aucun agrégat : sinon, comparer deux périodes
// qui ne diffèrent que de cette journée révélerait ses réponses.
const visibleSnapshots = (snapshots: MoodSnapshot[]) =>
  snapshots.filter((s) => hasEnoughResponses(s.totalResponses));

type PeriodEntry = Awaited<ReturnType<typeof moodmapRepo.findEntries>>[number];

const entriesOfVisibleDays = (entries: PeriodEntry[]) => {
  const perDay = new Map<string, number>();
  for (const e of entries) {
    const key = toDateKey(e.submittedAt);
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
  }
  return entries.filter((e) => hasEnoughResponses(perDay.get(toDateKey(e.submittedAt)) ?? 0));
};

const aggregateSnapshots = (allSnapshots: MoodSnapshot[]) => {
  const snapshots = visibleSnapshots(allSnapshots);
  const totalResponses = snapshots.reduce((sum, s) => sum + s.totalResponses, 0);
  const score = weightedAverage(snapshots.map((s) => ({ score: s.averageScore, weight: s.totalResponses })));
  const masked = maskBelowThreshold(score, totalResponses);
  return { totalResponses, averageScore: masked, status: masked === null ? null : statusFromScore(masked) };
};

const shortDate = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
const monthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric', timeZone: 'UTC' });

export const moodmapService = {
  async getSummary(team: Team): Promise<MoodMapSummary> {
    const [latest, teamSize] = await Promise.all([
      moodmapRepo.findLatestSnapshot(team.id, MIN_RESPONSES, lastCompleteDay()),
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
    const end = lastCompleteDay();
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
        totalResponses: visible ? snap.totalResponses : null,
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

  async getTrends(team: Team, { days }: TrendsQuery) {
    const end = lastCompleteDay();
    const from = addDays(end, -(days - 1));
    const previousFrom = addDays(from, -days);

    const [periodEntries, periodPreviousEntries, allTags, teamSize] = await Promise.all([
      moodmapRepo.findEntries(team.id, from, addDays(end, 1)),
      moodmapRepo.findEntries(team.id, previousFrom, from),
      moodmapRepo.findAllTags(),
      moodmapRepo.countVoters(team.id),
    ]);
    const entries = entriesOfVisibleDays(periodEntries);
    const previousEntries = entriesOfVisibleDays(periodPreviousEntries);

    const total = entries.length;
    const base = { team: teamRef(team), periodDays: days, from: formatDay(from), to: formatDay(end), minResponses: MIN_RESPONSES, totalResponses: total };

    if (!hasEnoughResponses(total)) {
      return { ...base, hasEnoughData: false, averageScore: null, status: null, trend: null, moods: [], tags: [], comments: [], flourishing: null, struggling: null, participation: null };
    }

    const stats = buildStats(entries.map((e) => e.mood));
    const score = stats.averageScore!;
    const previousScore = hasEnoughResponses(previousEntries.length) ? averageScore(previousEntries.map((e) => e.mood)) : null;

    const moods = Object.values(MoodLevel).map((code) => ({
      code,
      label: MOOD_LABELS[code],
      count: stats.distribution[code],
      percentage: percentage(stats.distribution[code], total),
    }));

    // Un tag choisi par moins de MIN_RESPONSES personnes n'est pas affiché du tout.
    const tags: TagStat[] = allTags
      .map(({ code, label }) => {
        const tagged = entries.filter((e) => e.tags.some((t) => t.tag.code === code));
        return {
          code,
          label,
          count: tagged.length,
          percentage: percentage(tagged.length, total),
          averageScore: averageScore(tagged.map((e) => e.mood)),
        };
      })
      .filter((tag) => hasEnoughResponses(tag.count))
      .sort((a, b) => b.count - a.count);

    return {
      ...base,
      hasEnoughData: true,
      averageScore: score,
      status: statusFromScore(score),
      trend: previousScore === null ? null : buildTrend(score, previousScore, days),
      flourishing: { count: stats.flourishingCount, percentage: percentage(stats.flourishingCount, total) },
      struggling: { count: stats.strugglingCount, percentage: percentage(stats.strugglingCount, total) },
      participation: {
        teamSize,
        averageDailyResponses: round1(total / days),
        rate: percentage(total, teamSize * days),
      },
      moods,
      tags,
      comments: anonymizeComments(entries.map((e) => e.comment), total),
    };
  },

  async getEvolution(team: Team, { granularity, periods }: EvolutionQuery) {
    const end = lastCompleteDay();
    const buckets: { key: string; label: string; start: Date; end: Date }[] = [];

    if (granularity === 'day') {
      for (const day of dayRange(end, periods)) {
        buckets.push({ key: formatDay(day), label: shortDate.format(day), start: day, end: day });
      }
    } else if (granularity === 'week') {
      const currentWeek = startOfIsoWeek(end);
      for (let i = periods - 1; i >= 0; i--) {
        const start = addDays(currentWeek, -7 * i);
        buckets.push({ key: formatDay(start), label: `Sem. du ${shortDate.format(start)}`, start, end: addDays(start, 6) });
      }
    } else {
      for (let i = periods - 1; i >= 0; i--) {
        const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - i, 1));
        const last = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0));
        buckets.push({ key: formatDay(start), label: monthLabel.format(start), start, end: last });
      }
    }

    const snapshots = await moodmapRepo.findSnapshots(team.id, buckets[0].start, end);
    const series = buckets.map((b) => {
      const inBucket = snapshots.filter((s) => s.date >= b.start && s.date <= b.end);
      return { label: b.label, from: formatDay(b.start), to: formatDay(b.end > end ? end : b.end), ...aggregateSnapshots(inBucket) };
    });

    const withData = series.filter((s) => s.averageScore !== null);
    const current = withData.at(-1) ?? null;
    const previous = withData.at(-2) ?? null;

    return {
      team: teamRef(team),
      granularity,
      zones: CHART_ZONES,
      series,
      overall: aggregateSnapshots(snapshots),
      comparison:
        current && previous
          ? {
              current: current.averageScore,
              previous: previous.averageScore,
              ...buildTrend(current.averageScore!, previous.averageScore, 0),
            }
          : null,
      best: withData.length ? withData.reduce((a, b) => (b.averageScore! > a.averageScore! ? b : a)) : null,
      worst: withData.length ? withData.reduce((a, b) => (b.averageScore! < a.averageScore! ? b : a)) : null,
    };
  },
};
