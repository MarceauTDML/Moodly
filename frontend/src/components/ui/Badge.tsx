import { View } from 'react-native';
import { Text } from './Text';
export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View
      style={{
        backgroundColor: color + '18',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
      }}
    >
      <Text style={{ color, fontFamily: 'Inter-Medium', fontSize: 12 }}>{label}</Text>
    </View>
  );
}
