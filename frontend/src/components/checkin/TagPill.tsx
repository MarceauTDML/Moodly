import { Pressable } from 'react-native';
import { Text } from '../ui/Text';
import { themedStyles, useAppTheme } from '../../theme/ThemeProvider';

export function TagPill({
  label,
  selected,
  onPress,
  disabled,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled: Boolean(disabled) }}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.pill,
        selected && { backgroundColor: colors.primarySoft, borderColor: colors.primary },
      ]}
    >
      <Text style={[styles.label, selected && { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}
const useStyles = themedStyles((colors) => ({
  pill: {
    flexGrow: 1,
    flexBasis: '46%',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.text, fontSize: 11, fontFamily: 'Inter-Medium' },
}));
