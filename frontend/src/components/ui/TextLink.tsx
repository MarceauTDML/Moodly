import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors } from '../../theme/colors';
export function TextLink({
  title,
  onPress,
  style,
}: {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[{ minHeight: 44, justifyContent: 'center' }, style]}
    >
      <Text style={{ color: colors.primary, fontFamily: 'Inter-Medium', fontSize: 13 }}>
        {title}
      </Text>
    </Pressable>
  );
}
