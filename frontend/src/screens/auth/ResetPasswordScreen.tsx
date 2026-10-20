import { useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/navigation.types';
import { AppHeader } from '../../components/layout/AppHeader';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useResetPasswordMutation } from '../../store/api/authApi';
import { errorMessage } from '../../services/api.client';
import { isStrongPassword, passwordHint } from '../../utils/validators.util';
import { colors } from '../../theme/colors';
export function ResetPasswordScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'ResetPassword'>) {
  const [token, setToken] = useState(route.params?.token ?? '');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [reset, { isLoading }] = useResetPasswordMutation();
  const submit = async () => {
    if (!token.trim() || !isStrongPassword(password) || password !== confirmation) {
      setError('Vérifiez le code, les règles du mot de passe et sa confirmation.');
      return;
    }
    setError('');
    try {
      await reset({ token: token.trim(), password }).unwrap();
      setToken('');
      setPassword('');
      setConfirmation('');
      setDone(true);
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  return (
    <ScreenContainer>
      <AppHeader
        title="Réinitialiser le mot de passe"
        onBack={() => navigation.navigate('Login')}
      />
      <View style={{ padding: 24, gap: 20 }}>
        {done ? (
          <>
            <Text>Votre mot de passe a été modifié.</Text>
            <Button title="Se connecter" onPress={() => navigation.navigate('Login')} />
          </>
        ) : (
          <>
            <Text>Ouvrez le lien reçu par e-mail ou copiez le code de ce lien.</Text>
            <Input
              label="Code de réinitialisation"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              maxLength={256}
            />
            <Input
              label="Nouveau mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              maxLength={128}
            />
            <Text style={{ color: colors.muted, fontSize: 12 }}>{passwordHint}</Text>
            <Input
              label="Confirmer le mot de passe"
              value={confirmation}
              onChangeText={setConfirmation}
              secureTextEntry
              maxLength={128}
            />
            {error && (
              <Text accessibilityRole="alert" style={{ color: colors.danger }}>
                {error}
              </Text>
            )}
            <Button
              title="Enregistrer le mot de passe"
              onPress={() => void submit()}
              loading={isLoading}
            />
          </>
        )}
      </View>
    </ScreenContainer>
  );
}
