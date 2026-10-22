import { View } from 'react-native';
import { Icon } from '../ui/Icon';
import { Text } from '../ui/Text';
export function AccountStatusBadge({ status }: { status: 'ACTIVE' | 'PENDING' }) {
  const active = status === 'ACTIVE';
  const color = active ? '#54866A' : '#A46F2E';
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: active ? '#E7F0E9' : '#F8EFD9',
      }}
    >
      <Icon name={active ? 'check' : 'clock'} size={14} color={color} />
      <Text style={{ fontSize: 11, color }}>{active ? 'Actif' : 'En attente d’activation'}</Text>
    </View>
  );
}
