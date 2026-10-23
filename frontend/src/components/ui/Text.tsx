import { Text as NativeText, type TextProps } from 'react-native';
import { useTypography } from '../../theme/typography';
export function Text({ style, ...props }: TextProps) {
  const typography = useTypography();
  return <NativeText {...props} style={[typography.body, style]} />;
}
