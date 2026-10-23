import { View, type ViewProps } from 'react-native';
import { themedStyles } from '../../theme/ThemeProvider';
export function Card({ style, ...props }: ViewProps) {
  const styles = useStyles();
  return <View {...props} style={[styles.card, style]} />;
}
const useStyles = themedStyles((colors) => ({
  card: { backgroundColor: colors.card, borderRadius: 22, padding: 20, gap: 14 },
}));
