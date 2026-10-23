import { View, ActivityIndicator } from 'react-native';
import { Text } from '../ui/Text';
import { useAppTheme } from '../../theme/ThemeProvider';
export function LoadingOverlay() {
  const { colors } = useAppTheme();
  return (
    <View
      accessibilityLabel="Chargement"
      style={{ flex: 1, minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 12 }}
    >
      <ActivityIndicator color={colors.primary} />
      <Text style={{ color: colors.muted }}>Chargement…</Text>
    </View>
  );
}
