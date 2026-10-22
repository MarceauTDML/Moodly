import { View } from 'react-native';
import { Text } from '../ui/Text';
import type { ChartZone } from '../../types/mood.types';
export const zoneColors = {
  IDEALE: { fill: '#E5EFE7', color: '#58846B' },
  PASSABLE: { fill: '#F2ECDD', color: '#EAA567' },
  PREOCCUPANTE: { fill: '#EFDEE1', color: '#BB7783' },
};
export function ChartLegend({ zones }: { zones: ChartZone[] }) {
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
              backgroundColor: zoneColors[zone.key].color,
            }}
          />
          <Text style={{ color: '#8090A7', fontSize: 9, lineHeight: 14 }}>{zone.label}</Text>
        </View>
      ))}
    </View>
  );
}
