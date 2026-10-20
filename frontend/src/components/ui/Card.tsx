import { View, StyleSheet, type ViewProps } from 'react-native';
export function Card({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.card, style]} />;
}
const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFFD9', borderRadius: 22, padding: 20, gap: 14 },
});
