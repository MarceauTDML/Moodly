import { View, ActivityIndicator } from 'react-native';
import { Text } from '../ui/Text';
export function LoadingOverlay() {
  return (
    <View
      accessibilityLabel="Chargement"
      style={{ flex: 1, minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 12 }}
    >
      <ActivityIndicator color="#3445D5" />
      <Text style={{ color: '#7C8BA5' }}>Chargement…</Text>
    </View>
  );
}
