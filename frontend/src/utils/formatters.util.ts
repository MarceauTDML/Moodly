export const formatScore = (score: number | null) =>
  score === null ? '—' : String(Math.round(score));
export const formatNumber = (value: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value);
export const formatTrend = (value: number | null, unit: 'pts' | '%') =>
  value === null
    ? '—'
    : `${value > 0 ? '+' : value < 0 ? '−' : ''}${formatNumber(Math.abs(value))} ${unit}`;
