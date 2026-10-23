import { useState } from 'react';
import { Pressable, View, TextInput, type TextInputProps } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import { themedStyles, useAppTheme } from '../../theme/ThemeProvider';
export function Input({
  label,
  error,
  style,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  // Champ de mot de passe : masqué par défaut, l'œil permet de vérifier la saisie.
  const isPassword = Boolean(props.secureTextEntry);
  const [hidden, setHidden] = useState(true);
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          autoCapitalize={isPassword ? 'none' : undefined}
          autoCorrect={isPassword ? false : undefined}
          {...props}
          secureTextEntry={isPassword && hidden}
          accessibilityLabel={label}
          placeholderTextColor={colors.placeholder}
          style={[
            styles.input,
            isPassword && { paddingRight: 52 },
            error && { borderColor: colors.danger },
            style,
          ]}
        />
        {isPassword && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
            accessibilityState={{ checked: !hidden }}
            onPress={() => setHidden(!hidden)}
            hitSlop={8}
            style={styles.toggle}
          >
            <Icon name={hidden ? 'eye' : 'eye-off'} size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>
      {error && (
        <Text accessibilityLiveRegion="polite" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
    </View>
  );
}
const useStyles = themedStyles((colors) => ({
  group: { gap: 8 },
  toggle: {
    position: 'absolute',
    right: 4,
    top: 0,
    bottom: 0,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
}));
