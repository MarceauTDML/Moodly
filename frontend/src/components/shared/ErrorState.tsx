import { View } from 'react-native';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { errorMessage } from '../../services/api.client';
import { useAppTheme } from '../../theme/ThemeProvider';
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        margin: 24,
        gap: 16,
        padding: 20,
        backgroundColor: colors.dangerSoft,
        borderRadius: 16,
      }}
    >
      <Text accessibilityRole="alert" style={{ color: colors.dangerText }}>
        {errorMessage(error)}
      </Text>
      {onRetry && <Button title="Réessayer" onPress={onRetry} secondary />}
    </View>
  );
}
