import { View } from 'react-native';
import { Icon } from '../ui/Icon';
import { Text } from '../ui/Text';
import { useAppTheme } from '../../theme/ThemeProvider';
export function AnonymityBanner({ threshold }: { threshold?: number }) {
  const { colors } = useAppTheme();
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
      <Icon name="lock" size={14} color={colors.muted} />
      <Text style={{ fontSize: 11, lineHeight: 16, color: colors.muted, flexShrink: 1 }}>
        Résultats collectifs
        {threshold ? ` · ${threshold} réponses minimum` : ' · aucun suivi individuel'}
      </Text>
    </View>
  );
}
