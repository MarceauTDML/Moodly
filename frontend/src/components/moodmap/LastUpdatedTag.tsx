import { View } from 'react-native';
import { Text } from '../ui/Text';
import { Icon } from '../ui/Icon';
import { formatDate } from '../../utils/date.util';
// Le serveur n'expose que des journées terminées : on affiche la journée, pas l'heure du calcul.
export function LastUpdatedTag({ date, color }: { date: string | null; color: string }) {
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
        {date ? `Données du ${formatDate(date)}` : 'Données indisponibles'}
      </Text>
      <Icon name="info" size={11} color={color} />
    </View>
  );
}
