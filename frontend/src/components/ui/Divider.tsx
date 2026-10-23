import { View } from 'react-native';
import { useAppTheme } from '../../theme/ThemeProvider';
export const Divider = () => {
  const { colors } = useAppTheme();
  return <View style={{ height: 1, backgroundColor: colors.divider }} />;
};
