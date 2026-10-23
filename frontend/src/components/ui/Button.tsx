import { Pressable, ActivityIndicator } from 'react-native';
import { Text } from './Text';
import { themedStyles, useAppTheme } from '../../theme/ThemeProvider';
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
  const { colors } = useAppTheme();
  const styles = useStyles();
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
        <ActivityIndicator color={secondary ? colors.primary : colors.onPrimary} />
      ) : (
        <Text style={[styles.label, secondary && { color: colors.primary }]}>{title}</Text>
      )}
    </Pressable>
  );
}
const useStyles = themedStyles((colors) => ({
  button: {
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: { backgroundColor: colors.primarySoft },
  label: { fontFamily: 'Inter-Medium', fontSize: 15, color: colors.onPrimary },
}));
