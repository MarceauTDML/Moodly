import { View } from 'react-native';
import { Text } from '../ui/Text';
export function ManagerAdviceCard({
  title,
  advice,
  color,
  muted,
}: {
  title: string | null;
  advice: string | null;
  color: string;
  muted: string;
}) {
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 14, gap: 8 }}>
      <Text
        style={{
          color,
          fontSize: 14,
          lineHeight: 21,
          fontFamily: 'Inter-Medium',
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text style={{ color: muted, fontSize: 12, lineHeight: 18, textAlign: 'center' }}>
        {advice}
      </Text>
    </View>
  );
}
