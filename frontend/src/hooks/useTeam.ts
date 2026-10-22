import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { useTeamsQuery } from '../store/api/usersApi';
import { selectTeam } from '../store/slices/uiSlice';
export function useTeam() {
  const query = useTeamsQuery();
  const selectedId = useAppSelector((s) => s.ui.teamId);
  const dispatch = useAppDispatch();
  const teams = query.currentData ?? [];
  const team = teams.find((t) => t.id === selectedId) ?? teams[0];
  useEffect(() => {
    if (team && team.id !== selectedId) dispatch(selectTeam(team.id));
  }, [team, selectedId, dispatch]);
  return { ...query, teams, team, select: (id: string) => dispatch(selectTeam(id)) };
}
