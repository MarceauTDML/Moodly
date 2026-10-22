import { View } from 'react-native';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { errorMessage } from '../../services/api.client';
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <View
      style={{ margin: 24, gap: 16, padding: 20, backgroundColor: '#FFF5F5', borderRadius: 16 }}
    >
      <Text accessibilityRole="alert" style={{ color: '#9F4557' }}>
        {errorMessage(error)}
      </Text>
      {onRetry && <Button title="Réessayer" onPress={onRetry} secondary />}
    </View>
  );
}
