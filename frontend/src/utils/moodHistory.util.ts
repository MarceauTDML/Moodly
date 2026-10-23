import { checkinMoodSchema, checkinTagSchema } from '../services/checkin.schemas';
import type { CheckinMood, CheckinTag } from '../types/checkin.types';

// Historique personnel : stocké uniquement sur le téléphone, jamais envoyé au serveur.
export interface HistoryEntry {
  date: string; // AAAA-MM-JJ
  mood: CheckinMood;
  tags: CheckinTag[];
}

export const KEEP_MONTHS = 12;
const MOODS = checkinMoodSchema.options;
const TAGS = checkinTagSchema.options;

export const monthOf = (date: string) => date.slice(0, 7);

// Mois courant puis précédents : ['2026-10', '2026-09', ...].
export const previousMonths = (date: string, count: number) => {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7)) - 1;
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(year, month - i, 1));
    return d.toISOString().slice(0, 7);
  });
};

// Les 30 derniers jours, du plus ancien au plus récent.
export const lastDays = (today: string, count: number) => {
  const end = new Date(`${today}T00:00:00.000Z`).getTime();
  return Array.from({ length: count }, (_, i) =>
    new Date(end - (count - 1 - i) * 86_400_000).toISOString().slice(0, 10),
  );
};

export const localDate = (now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    now,
  );

// Format compact « jour|humeur|tags » : SecureStore limite la taille de chaque valeur.
export const encodeMonth = (entries: HistoryEntry[]) =>
  JSON.stringify(
    entries.map(
      (e) =>
        `${e.date.slice(8, 10)}|${MOODS.indexOf(e.mood)}|${e.tags.map((t) => TAGS.indexOf(t)).join(',')}`,
    ),
  );

export const decodeMonth = (month: string, raw: string | null): HistoryEntry[] => {
  if (!raw) return [];
  let rows: unknown;
  try {
    rows = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    if (typeof row !== 'string') return [];
    const [day, moodIndex, tagIndexes = ''] = row.split('|');
    const mood = MOODS[Number(moodIndex)];
    if (!day || !/^\d{2}$/.test(day) || !mood) return [];
    const tags = tagIndexes
      .split(',')
      .filter(Boolean)
      .map((i) => TAGS[Number(i)])
      .filter((t): t is CheckinTag => Boolean(t));
    return [{ date: `${month}-${day}`, mood, tags }];
  });
};

// Une seule entrée par jour, triée par date.
export const upsertEntry = (entries: HistoryEntry[], entry: HistoryEntry) =>
  [...entries.filter((e) => e.date !== entry.date), entry].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
