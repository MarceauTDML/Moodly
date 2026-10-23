import { View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { IconButton } from '../ui/IconButton';
import { useAppTheme } from '../../theme/ThemeProvider';
export function AppHeader({
  title = 'Mood map',
  subtitle,
  onMenu,
  onBack,
  color: colorProp,
  muted: mutedProp,
}: {
  title?: string;
  subtitle?: string;
  onMenu?: () => void;
  onBack?: () => void;
  color?: string;
  muted?: string;
}) {
  const { colors } = useAppTheme();
  const color = colorProp ?? colors.text;
  const muted = mutedProp ?? colors.muted;
  return (
    <View style={styles.header}>
      {onBack && <IconButton icon="back" label="Retour" onPress={onBack} color={color} />}
      <View style={{ flex: 1 }}>
        <Text accessibilityRole="header" style={[styles.title, { color }]}>
          {title}
        </Text>
        {subtitle && <Text style={{ color: muted, fontSize: 12, lineHeight: 18 }}>{subtitle}</Text>}
      </View>
      {onMenu && <IconButton icon="menu" label="Ouvrir le menu" onPress={onMenu} color={color} />}
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 76,
  },
  title: { fontSize: 23, lineHeight: 30, fontFamily: 'Inter-Regular' },
});
