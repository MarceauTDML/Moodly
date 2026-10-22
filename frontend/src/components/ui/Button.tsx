import { Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from './Text';
import { colors } from '../../theme/colors';
export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        (pressed || disabled || loading) && { opacity: 0.65 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? colors.primary : '#FFF'} />
      ) : (
        <Text style={[styles.label, secondary && { color: colors.primary }]}>{title}</Text>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: { backgroundColor: '#EAE9FA' },
  label: { fontFamily: 'Inter-Medium', fontSize: 15, color: '#FFF' },
});
