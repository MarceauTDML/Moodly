import { randomInt } from 'node:crypto';
import { MIN_RESPONSES } from '../config/mood.config';

export const hasEnoughResponses = (count: number, min: number = MIN_RESPONSES): boolean => count >= min;

export const maskBelowThreshold = <T>(value: T, count: number, min: number = MIN_RESPONSES): T | null =>
  hasEnoughResponses(count, min) ? value : null;

const PII_PATTERNS: [RegExp, string][] = [
  [/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]'],
  [/(?:\+33\s?|0)[1-9](?:[\s.-]?\d{2}){4}/g, '[téléphone]'],
  [/https?:\/\/\S+/g, '[lien]'],
];

export const scrubComment = (comment: string): string =>
  PII_PATTERNS.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), comment)
    .replace(/\s+/g, ' ')
    .trim();

export const shuffle = <T>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const anonymizeComments = (comments: (string | null)[], totalResponses: number, limit = 20): string[] => {
  if (!hasEnoughResponses(totalResponses)) return [];
  const cleaned = comments.filter((c): c is string => Boolean(c && c.trim())).map(scrubComment).filter(Boolean);
  return shuffle(cleaned).slice(0, limit);
};
