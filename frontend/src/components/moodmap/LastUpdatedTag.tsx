import { View } from 'react-native';
import { Text } from '../ui/Text';
import { Icon } from '../ui/Icon';
export function LastUpdatedTag({ time, color }: { time: string | null; color: string }) {
  return (
    <View
      style={{
        paddingVertical: 14,
        flexDirection: 'row',
        gap: 5,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color, fontSize: 10, lineHeight: 16 }}>
        Dernière mise à jour {time ? `à ${time}` : 'indisponible'}
      </Text>
      <Icon name="info" size={11} color={color} />
    </View>
  );
}
