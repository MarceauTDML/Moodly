import { StyleSheet } from 'react-native';
import { colors } from './colors';
export const typography = StyleSheet.create({
  title: { fontFamily: 'Inter-Bold', fontSize: 27, lineHeight: 35, color: colors.text },
  heading: { fontFamily: 'Inter-Medium', fontSize: 18, lineHeight: 26, color: colors.text },
  body: { fontFamily: 'Inter-Regular', fontSize: 14, lineHeight: 22, color: colors.text },
  small: { fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 18, color: colors.muted },
});
