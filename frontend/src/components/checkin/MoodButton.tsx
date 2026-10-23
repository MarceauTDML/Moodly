import { Pressable, View } from 'react-native';
import { Text } from '../ui/Text';
import { themedStyles, useAppTheme } from '../../theme/ThemeProvider';
import type { CheckinMood } from '../../types/checkin.types';
import { MoodFace } from './MoodFace';

// Une teinte par humeur, comme les visages : elles restent distinctes dans les deux thèmes.
const appearance = {
  light: {
    EPANOUI: { background: '#E8F5ED', border: '#85C69D' },
    BIEN: { background: '#FFF7DC', border: '#F1CB5A' },
    MOYEN: { background: '#FFF0E0', border: '#F2AF70' },
    STRESSE: { background: '#FDE9EC', border: '#EB9DA7' },
  },
  dark: {
    EPANOUI: { background: '#1D3326', border: '#5E9E76' },
    BIEN: { background: '#36301A', border: '#C9A540' },
    MOYEN: { background: '#3A2B18', border: '#C98A4E' },
    STRESSE: { background: '#3A1E25', border: '#C9707E' },
  },
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
  const { colors, scheme } = useAppTheme();
  const styles = useStyles();
  const palette = appearance[scheme][code];
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
const useStyles = themedStyles((colors) => ({
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
  label: { color: colors.textStrong, fontSize: 11, fontFamily: 'Inter-Medium' },
  check: {
    position: 'absolute',
    right: 2,
    top: -5,
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    borderRadius: 10,
    width: 18,
    height: 18,
    textAlign: 'center',
    fontSize: 12,
  },
}));
