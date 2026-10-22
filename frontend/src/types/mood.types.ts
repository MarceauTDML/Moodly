import type { Team } from './team.types';
export type MoodStatus = 'PARFAIT' | 'MOYENNE' | 'PREOCCUPANT';
export type MoodLevel = 'EPANOUI' | 'BIEN' | 'MOYEN' | 'STRESSE';
export interface MoodTrend {
  periodDays: number;
  points: number | null;
  percentage: number | null;
  direction: 'UP' | 'DOWN' | 'STABLE' | null;
}
export interface MoodHighlight {
  type: 'FLOURISHING' | 'STRUGGLING';
  label: string;
  count: number;
  total: number;
}
export interface MoodMapSummary {
  team: Team;
  hasEnoughData: boolean;
  minResponses: number;
  date: string | null;
  score: number | null;
  maxScore: number;
  status: MoodStatus | null;
  statusLabel: string | null;
  title: string | null;
  advice: string | null;
  lastUpdatedAt: string | null;
  lastUpdatedTime: string | null;
  totalResponses: number;
  teamSize: number;
  participationRate: number;
  highlight: MoodHighlight | null;
  trend: MoodTrend | null;
}
export interface ChartPoint {
  label: string;
  date: string;
  score: number | null;
}
export interface ChartZone {
  key: 'IDEALE' | 'PASSABLE' | 'PREOCCUPANTE';
  label: string;
  min: number;
  max: number;
}
export interface PeriodStats {
  totalResponses: number;
  averageScore: number | null;
  status: MoodStatus | null;
}
export interface MoodHistory {
  team: Team;
  periodDays: number;
  from: string;
  to: string;
  zones: ChartZone[];
  period: PeriodStats;
  points: (ChartPoint & { index: number; status: MoodStatus | null; totalResponses: number })[];
}
export interface MoodTrends {
  team: Team;
  periodDays: number;
  from: string;
  to: string;
  minResponses: number;
  totalResponses: number;
  hasEnoughData: boolean;
  averageScore: number | null;
  status: MoodStatus | null;
  trend: MoodTrend | null;
  flourishing: { count: number; percentage: number } | null;
  struggling: { count: number; percentage: number } | null;
  participation: { teamSize: number; averageDailyResponses: number; rate: number } | null;
  moods: { code: MoodLevel; label: string; count: number; percentage: number }[];
  tags: {
    code: string;
    label: string;
    count: number;
    percentage: number;
    averageScore: number | null;
  }[];
  comments: string[];
}
export type Granularity = 'day' | 'week' | 'month';
export interface EvolutionBucket extends PeriodStats {
  label: string;
  from: string;
  to: string;
}
export interface MoodEvolution {
  team: Team;
  granularity: Granularity;
  zones: ChartZone[];
  series: EvolutionBucket[];
  overall: PeriodStats;
  comparison: (MoodTrend & { current: number; previous: number }) | null;
  best: EvolutionBucket | null;
  worst: EvolutionBucket | null;
}
