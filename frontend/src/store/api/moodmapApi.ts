import { baseApi } from './baseApi';
import {
  summarySchema,
  historySchema,
  trendsSchema,
  evolutionSchema,
} from '../../services/api.schemas';
import type {
  Granularity,
  MoodEvolution,
  MoodHistory,
  MoodMapSummary,
  MoodTrends,
} from '../../types/mood.types';
const route = (teamId: string, page: string) =>
  `/moodmap/teams/${encodeURIComponent(teamId)}/${page}`;
export const moodmapApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    summary: build.query<MoodMapSummary, string>({
      query: (id) => ({ url: route(id, 'summary'), schema: summarySchema }),
    }),
    history: build.query<MoodHistory, string>({
      query: (id) => ({ url: route(id, 'history') + '?days=30', schema: historySchema }),
    }),
    trends: build.query<MoodTrends, string>({
      query: (id) => ({ url: route(id, 'trends') + '?days=30', schema: trendsSchema }),
    }),
    evolution: build.query<MoodEvolution, { teamId: string; granularity: Granularity }>({
      query: ({ teamId, granularity }) => ({
        url:
          route(teamId, 'evolution') +
          `?granularity=${granularity}&periods=${granularity === 'day' ? 30 : 12}`,
        schema: evolutionSchema,
      }),
    }),
  }),
});
export const { useSummaryQuery, useHistoryQuery, useTrendsQuery, useEvolutionQuery } = moodmapApi;
