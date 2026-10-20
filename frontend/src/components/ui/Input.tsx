import { View, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { Text } from './Text';
import { colors } from '../../theme/colors';
export function Input({
  label,
  error,
  style,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize={props.secureTextEntry ? 'none' : undefined}
        autoCorrect={props.secureTextEntry ? false : undefined}
        {...props}
        accessibilityLabel={label}
        placeholderTextColor="#969DB3"
        style={[styles.input, error && { borderColor: colors.danger }, style]}
      />
      {error && (
        <Text accessibilityLiveRegion="polite" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  group: { gap: 8 },
  label: { fontFamily: 'Inter-Medium', fontSize: 13, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    minHeight: 54,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.text,
  },
});
