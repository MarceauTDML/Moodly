import type { ChartPoint } from '../types/mood.types';
// Une valeur masquée coupe la courbe : elle ne devient jamais 0, ni une interpolation.
export function chartSegments(points: ChartPoint[]): { index: number; point: ChartPoint }[][] {
  const segments: { index: number; point: ChartPoint }[][] = [];
  let current: { index: number; point: ChartPoint }[] = [];
  points.forEach((point, index) => {
    if (point.score === null) {
      if (current.length) segments.push(current);
      current = [];
    } else {
      current.push({ index, point });
    }
  });
  if (current.length) segments.push(current);
  return segments;
}
