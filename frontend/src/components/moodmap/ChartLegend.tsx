import { View } from 'react-native';
import { Text } from '../ui/Text';
import type { ChartZone } from '../../types/mood.types';
import type { Palette } from '../../theme/colors';
import { useAppTheme } from '../../theme/ThemeProvider';
export const zoneColors = (colors: Palette) => ({
  IDEALE: { fill: colors.successSoft, color: colors.success },
  PASSABLE: { fill: colors.warningSoft, color: colors.warning },
  PREOCCUPANTE: { fill: colors.dangerSoft, color: colors.danger },
});
export function ChartLegend({ zones }: { zones: ChartZone[] }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 9,
        paddingHorizontal: 24,
        paddingTop: 18,
        paddingBottom: 18,
      }}
    >
      {zones.map((zone) => (
        <View key={zone.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              backgroundColor: zoneColors(colors)[zone.key].color,
            }}
          />
          <Text style={{ color: colors.muted, fontSize: 9, lineHeight: 14 }}>{zone.label}</Text>
        </View>
      ))}
    </View>
  );
}
