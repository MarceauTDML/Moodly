import { Pressable, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { colors } from '../../theme/colors';

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
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled: Boolean(disabled) }}
      onPress={onPress}
      disabled={disabled}
      style={[styles.pill, selected && { backgroundColor: '#EAEDFF', borderColor: colors.primary }]}
    >
      <Text style={[styles.label, selected && { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  pill: {
    flexGrow: 1,
    flexBasis: '46%',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F2F3F6',
    borderWidth: 1,
    borderColor: '#E5E7EC',
  },
  label: { color: '#303848', fontSize: 11, fontFamily: 'Inter-Medium' },
});
