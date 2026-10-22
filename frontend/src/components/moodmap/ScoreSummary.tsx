import { View } from 'react-native';
import { Text } from '../ui/Text';
import type { MoodMapSummary } from '../../types/mood.types';
import { formatScore } from '../../utils/formatters.util';
export function ScoreSummary({ summary, color }: { summary: MoodMapSummary; color: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Text style={{ color, fontSize: 40, lineHeight: 46, fontFamily: 'Inter-Bold' }}>
        {formatScore(summary.score)}
        <Text style={{ color, fontSize: 13, fontFamily: 'Inter-Regular' }}> /100</Text>
      </Text>
      <Text style={{ color, fontSize: 23, lineHeight: 31 }}>{summary.statusLabel}</Text>
    </View>
  );
}
