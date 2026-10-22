import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import { colors } from '../../theme/colors';
import type { CheckinMood } from '../../types/checkin.types';
import { MoodFace } from './MoodFace';

const appearance = {
  EPANOUI: { background: '#E8F5ED', border: '#85C69D' },
  BIEN: { background: '#FFF7DC', border: '#F1CB5A' },
  MOYEN: { background: '#FFF0E0', border: '#F2AF70' },
  STRESSE: { background: '#FDE9EC', border: '#EB9DA7' },
} as const;

export function MoodButton({
  code,
  label,
  selected,
  onPress,
  disabled = false,
}: {
  code: CheckinMood;
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  const palette = appearance[code];
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected, checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={styles.option}
    >
      <View
        style={[
          styles.face,
          {
            backgroundColor: palette.background,
            borderColor: selected ? colors.primary : palette.border,
          },
          selected && styles.selected,
        ]}
      >
        <MoodFace mood={code} />
      </View>
      <Text style={[styles.label, selected && { color: colors.primary }]}>{label}</Text>
      {selected && (
        <Text accessible={false} style={styles.check}>
          ✓
        </Text>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  option: { flex: 1, alignItems: 'center', gap: 7, position: 'relative', minHeight: 92 },
  face: {
    width: '100%',
    maxWidth: 72,
    minHeight: 64,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { borderWidth: 2 },
  label: { color: '#202736', fontSize: 11, fontFamily: 'Inter-Medium' },
  check: {
    position: 'absolute',
    right: 2,
    top: -5,
    backgroundColor: colors.primary,
    color: '#FFF',
    borderRadius: 10,
    width: 18,
    height: 18,
    textAlign: 'center',
    fontSize: 12,
  },
});
