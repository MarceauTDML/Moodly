import { computeSnapshotsForDay } from '../services/mood-score.service';
import { addDays, formatDay, today } from '../utils/date.util';

export const runComputeMoodSnapshots = async () => {
  const day = today();
  return { date: formatDay(day), snapshots: await computeSnapshotsForDay(day) };
};

export const runFinalizeYesterdaySnapshots = async () => {
  const day = addDays(today(), -1);
  return { date: formatDay(day), snapshots: await computeSnapshotsForDay(day) };
};
