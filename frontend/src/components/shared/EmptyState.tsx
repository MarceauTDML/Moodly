import { View } from 'react-native';
import { Text } from '../ui/Text';
import { Icon } from '../ui/Icon';
import { useTypography } from '../../theme/typography';
import { useAppTheme } from '../../theme/ThemeProvider';
export function EmptyState({ title, description }: { title: string; description: string }) {
  const { colors } = useAppTheme();
  const typography = useTypography();
  return (
    <View style={{ padding: 32, alignItems: 'center', gap: 12 }}>
      <Icon name="info" size={30} />
      <Text accessibilityRole="header" style={[typography.heading, { textAlign: 'center' }]}>
        {title}
      </Text>
      <Text style={{ textAlign: 'center', color: colors.muted }}>{description}</Text>
    </View>
  );
}
