import { Text as NativeText, type TextProps } from 'react-native';
import { typography } from '../../theme/typography';
export function Text({ style, ...props }: TextProps) {
  return <NativeText {...props} style={[typography.body, style]} />;
}
