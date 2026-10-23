import { View } from 'react-native';
import { Icon } from '../ui/Icon';
import { Text } from '../ui/Text';
import { useAppTheme } from '../../theme/ThemeProvider';
export function AccountStatusBadge({ status }: { status: 'ACTIVE' | 'PENDING' }) {
  const active = status === 'ACTIVE';
  const { colors } = useAppTheme();
  const color = active ? colors.success : colors.warning;
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
        backgroundColor: active ? colors.successSoft : colors.warningSoft,
      }}
    >
      <Icon name={active ? 'check' : 'clock'} size={14} color={color} />
      <Text style={{ fontSize: 11, color }}>{active ? 'Actif' : 'En attente d’activation'}</Text>
    </View>
  );
}
