import type { MoodLevel, MoodStatus } from '@prisma/client';

export interface DailyStats {
  totalResponses: number;
  averageScore: number | null;
  status: MoodStatus | null;
  flourishingCount: number;
  strugglingCount: number;
  distribution: Record<MoodLevel, number>;
}

export interface MoodHighlight {
  type: 'FLOURISHING' | 'STRUGGLING';
  label: string;
  count: number;
  total: number;
}

export interface MoodTrend {
  periodDays: number;
  points: number | null;
  percentage: number | null;
  direction: 'UP' | 'DOWN' | 'STABLE' | null;
}

export interface MoodMapSummary {
  team: { id: string; name: string };
  hasEnoughData: boolean;
  minResponses: number;
  date: string | null;
  score: number | null;
  maxScore: 100;
  status: MoodStatus | null;
  statusLabel: string | null;
  title: string | null;
  advice: string | null;
  lastUpdatedAt: Date | null;
  lastUpdatedTime: string | null;
  totalResponses: number;
  teamSize: number;
  participationRate: number;
  highlight: MoodHighlight | null;
  trend: MoodTrend | null;
}

export interface HistoryPoint {
  index: number;
  label: string;
  date: string;
  score: number | null;
  status: MoodStatus | null;
  totalResponses: number | null;
}
