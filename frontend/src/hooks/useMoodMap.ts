import { skipToken } from '@reduxjs/toolkit/query/react';
import { useTeam } from './useTeam';
import { useHistoryQuery, useSummaryQuery } from '../store/api/moodmapApi';
export function useMoodMap() {
  const teams = useTeam();
  const summary = useSummaryQuery(teams.team?.id ?? skipToken);
  const history = useHistoryQuery(teams.team?.id ?? skipToken);
  return {
    teams,
    summary,
    history,
    refresh: async () => {
      await teams.refetch();
      if (teams.team) await Promise.allSettled([summary.refetch(), history.refetch()]);
    },
  };
}
