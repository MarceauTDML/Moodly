import { View, Pressable } from 'react-native';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { Icon } from '../ui/Icon';
import type { MoodMapSummary } from '../../types/mood.types';
import { formatTrend } from '../../utils/formatters.util';
import { colors } from '../../theme/colors';
export function TeamTrendsCard({
  summary,
  onMore,
}: {
  summary: MoodMapSummary;
  onMore: () => void;
}) {
  const positive = (summary.trend?.points ?? 0) >= 0;
  const trendColor = positive
    ? '#568568'
    : summary.status === 'PREOCCUPANT'
      ? '#C16475'
      : '#CD893C';
  // Marie affiche un pourcentage pour l'etat parfait, des points sinon.
  const percent = summary.status === 'PARFAIT';
  return (
    <Card style={{ marginHorizontal: 20, padding: 17, gap: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, fontFamily: 'Inter-Medium' }}>Tendances de l’équipe</Text>
        <Pressable
          onPress={onMore}
          accessibilityRole="button"
          accessibilityLabel="Voir plus : tendances de l'équipe"
          style={{ flexDirection: 'row', alignItems: 'center', minHeight: 32 }}
        >
          <Text style={{ fontSize: 11, color: colors.primary }}>Voir plus</Text>
          <Icon name="chevron" size={15} />
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, paddingRight: 12, gap: 4 }}>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 22, lineHeight: 30 }}>
            {summary.highlight ? `${summary.highlight.count}/${summary.highlight.total}` : '—'}
          </Text>
          <Text style={{ fontSize: 10, lineHeight: 15, color: colors.muted }}>
            {summary.highlight?.label ?? 'Données indisponibles'}
          </Text>
        </View>
        <View
          style={{ flex: 1, borderLeftWidth: 1, borderColor: '#E9EAF1', paddingLeft: 20, gap: 4 }}
        >
          <Text
            style={{ fontFamily: 'Inter-Medium', fontSize: 22, lineHeight: 30, color: trendColor }}
          >
            {formatTrend(
              percent ? (summary.trend?.percentage ?? null) : (summary.trend?.points ?? null),
              percent ? '%' : 'pts',
            )}
          </Text>
          <Text style={{ fontSize: 10, lineHeight: 15, color: colors.muted }}>Sur 30 jours</Text>
        </View>
      </View>
    </Card>
  );
}
