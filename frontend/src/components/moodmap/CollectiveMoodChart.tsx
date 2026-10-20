import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Rect, Line, Polyline, Circle, Text as SvgText, G } from 'react-native-svg';
import { Text } from '../ui/Text';
import type { ChartPoint, ChartZone } from '../../types/mood.types';
import { ChartLegend, zoneColors } from './ChartLegend';
import { chartSegments } from '../../utils/chart.util';
import { colors } from '../../theme/colors';
import { formatDate } from '../../utils/date.util';
export function CollectiveMoodChart({
  points,
  zones,
  caption = '30 derniers jours',
}: {
  points: ChartPoint[];
  zones: ChartZone[];
  caption?: string;
}) {
  const [selection, setSelection] = useState<number | null>(null);
  const selected = selection === null ? undefined : points[selection];
  const width = 390,
    left = 24,
    right = 352,
    top = 10,
    bottom = 150;
  const x = (i: number) => left + (i * (right - left)) / Math.max(points.length - 1, 1);
  const y = (score: number) => bottom - (score * (bottom - top)) / 100;
  const segments = chartSegments(points);
  const ticks = points
    .map((_, i) => i)
    .filter((i) => i === 0 || i === points.length - 1 || (i + 1) % 5 === 0);
  return (
    <View style={{ paddingTop: 12 }}>
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 12, fontFamily: 'Inter-Medium' }}>Humeur collective</Text>
        <Text style={{ fontSize: 10, color: '#7F899A' }}>{caption}</Text>
      </View>
      <Svg
        width="100%"
        height={196}
        viewBox={`0 0 ${width} 196`}
        accessibilityLabel="Graphique de l'humeur collective. Touchez un point pour lire sa valeur."
      >
        {zones.map((zone) => (
          <Rect
            key={zone.key}
            x={0}
            y={y(zone.max)}
            width={390}
            height={Math.max(0, y(zone.min) - y(zone.max))}
            fill={zoneColors[zone.key].fill}
          />
        ))}
        {points.map((point, i) => (
          <Line
            key={point.date}
            x1={x(i)}
            y1={top}
            x2={x(i)}
            y2={bottom}
            stroke="#A3A8AD"
            strokeOpacity={0.15}
            strokeDasharray="2 3"
          />
        ))}
        {[100, 50, 0].map((score) => (
          <SvgText
            key={score}
            x={375}
            y={y(score) + 4}
            fill="#6E7887"
            fontSize={9}
            textAnchor="middle"
          >
            {score}
          </SvgText>
        ))}
        {segments.map((segment, i) => (
          <Polyline
            key={i}
            points={segment.map(({ point, index }) => `${x(index)},${y(point.score!)}`).join(' ')}
            fill="none"
            stroke={colors.chartLine}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        ))}
        {points.map(
          (point, i) =>
            point.score !== null && (
              <G key={point.date}>
                <Circle
                  cx={x(i)}
                  cy={y(point.score)}
                  r={2}
                  stroke={colors.chartLine}
                  strokeWidth={1}
                  fill="#FFF"
                />
                <Rect
                  x={x(i) - 6}
                  y={top}
                  width={12}
                  height={bottom - top}
                  fill="transparent"
                  onPress={() => setSelection(i)}
                  accessibilityLabel={`${formatDate(point.date)} : ${point.score} sur 100`}
                />
              </G>
            ),
        )}
        {selected?.score !== undefined && selected.score !== null && (
          <Circle cx={x(selection!)} cy={y(selected.score)} r={4} fill={colors.primary} />
        )}
        {ticks.map((i) => (
          <SvgText key={i} x={x(i)} y={178} textAnchor="middle" fill="#6B7589" fontSize={9}>
            {points[i]?.label}
          </SvgText>
        ))}
      </Svg>
      {selected && (
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: colors.primary, textAlign: 'center', fontSize: 12 }}
        >
          {formatDate(selected.date)} · {selected.score ?? 'Masqué'}/100
        </Text>
      )}
      {!segments.length && (
        <Text style={{ textAlign: 'center', color: colors.muted, paddingHorizontal: 24 }}>
          Pas encore de résultat affichable sur cette période.
        </Text>
      )}
      <ChartLegend zones={zones} />
    </View>
  );
}
