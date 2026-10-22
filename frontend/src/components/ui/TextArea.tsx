import { TextInput, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { colors } from '../../theme/colors';

export function TextArea({
  label,
  value,
  onChangeText,
  placeholder,
  maxLength,
  disabled,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  maxLength: number;
  disabled?: boolean;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#758095"
        maxLength={maxLength}
        multiline
        textAlignVertical="top"
        editable={!disabled}
        style={styles.input}
      />
      <Text style={styles.count}>
        {value.length}/{maxLength}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  label: { fontFamily: 'Inter-Medium', fontSize: 12, lineHeight: 20, color: '#202736' },
  input: {
    minHeight: 100,
    backgroundColor: '#F2F3F6',
    borderWidth: 1,
    borderColor: '#E5E7EC',
    borderRadius: 12,
    padding: 14,
    color: colors.text,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
  count: { color: colors.muted, textAlign: 'right', fontSize: 11 },
});
