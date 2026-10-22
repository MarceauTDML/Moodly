import { View } from 'react-native';
import { Text } from '../ui/Text';
import { Icon } from '../ui/Icon';
import { typography } from '../../theme/typography';
export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <View style={{ padding: 32, alignItems: 'center', gap: 12 }}>
      <Icon name="info" size={30} />
      <Text accessibilityRole="header" style={[typography.heading, { textAlign: 'center' }]}>
        {title}
      </Text>
      <Text style={{ textAlign: 'center', color: '#7C8BA5' }}>{description}</Text>
    </View>
  );
}
