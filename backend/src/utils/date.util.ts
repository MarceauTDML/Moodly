import { env } from '../config/env.config';

const DAY_MS = 24 * 60 * 60 * 1000;

export const toDateKey = (date: Date, timeZone: string = env.TIMEZONE): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

export const dateKeyToDate = (key: string): Date => new Date(`${key}T00:00:00.000Z`);

export const today = (now: Date = new Date()): Date => dateKeyToDate(toDateKey(now));

export const addDays = (date: Date, days: number): Date => new Date(date.getTime() + days * DAY_MS);

export const formatDay = (date: Date): string => date.toISOString().slice(0, 10);

export const dayRange = (end: Date, days: number): Date[] =>
  Array.from({ length: days }, (_, i) => addDays(end, i - days + 1));

export const startOfIsoWeek = (date: Date): Date => {
  const weekday = (date.getUTCDay() + 6) % 7;
  return addDays(date, -weekday);
};

export const formatTime = (date: Date, timeZone: string = env.TIMEZONE): string =>
  new Intl.DateTimeFormat('fr-FR', { timeZone, hour: '2-digit', minute: '2-digit' }).format(date);
