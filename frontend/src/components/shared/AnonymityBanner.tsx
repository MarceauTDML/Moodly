import { View } from 'react-native';
import { Icon } from '../ui/Icon';
import { Text } from '../ui/Text';
export function AnonymityBanner({ threshold }: { threshold?: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 7,
      }}
    >
      <Icon name="lock" size={14} color="#8090A7" />
      <Text style={{ fontSize: 11, lineHeight: 16, color: '#8090A7', flexShrink: 1 }}>
        Résultats collectifs
        {threshold ? ` · ${threshold} réponses minimum` : ' · aucun suivi individuel'}
      </Text>
    </View>
  );
}
