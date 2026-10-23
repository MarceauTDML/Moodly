import { TextInput, View } from 'react-native';
import { Text } from './Text';
import { themedStyles, useAppTheme } from '../../theme/ThemeProvider';

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
  const { colors } = useAppTheme();
  const styles = useStyles();
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
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
const useStyles = themedStyles((colors) => ({
  label: { fontFamily: 'Inter-Medium', fontSize: 12, lineHeight: 20, color: colors.textStrong },
  input: {
    minHeight: 100,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    color: colors.text,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
  count: { color: colors.muted, textAlign: 'right', fontSize: 11 },
}));
