import { useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/navigation.types';
import { AppHeader } from '../../components/layout/AppHeader';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { TextLink } from '../../components/ui/TextLink';
import { useForgotPasswordMutation } from '../../store/api/authApi';
import { isEmail } from '../../utils/validators.util';
import { errorMessage } from '../../services/api.client';
import { useAppTheme } from '../../theme/ThemeProvider';
export function ForgotPasswordScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>) {
  const { colors } = useAppTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [send, { isLoading }] = useForgotPasswordMutation();
  const submit = async () => {
    if (!isEmail(email)) {
      setError('Saisissez un e-mail valide.');
      return;
    }
    setError('');
    try {
      await send({ email: email.trim().toLowerCase() }).unwrap();
      setSent(true);
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  return (
    <ScreenContainer>
      <AppHeader title="Mot de passe oublié" onBack={navigation.goBack} />
      <View style={{ padding: 24, gap: 24 }}>
        <Text>
          {sent
            ? 'Si un compte correspond à cette adresse, un e-mail de réinitialisation a été envoyé.'
            : 'Indiquez votre adresse professionnelle pour recevoir un lien de réinitialisation.'}
        </Text>
        {!sent && (
          <>
            <Input
              label="E-mail professionnel"
              placeholder="prenom.nom@entreprise.fr"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              maxLength={254}
            />
            <Button title="Recevoir le lien" onPress={() => void submit()} loading={isLoading} />
          </>
        )}
        {error && (
          <Text accessibilityRole="alert" style={{ color: colors.danger }}>
            {error}
          </Text>
        )}
        <TextLink
          title="J'ai déjà reçu un lien"
          onPress={() => navigation.navigate('ResetPassword')}
        />
        <TextLink title="Retour à la connexion" onPress={() => navigation.navigate('Login')} />
      </View>
    </ScreenContainer>
  );
}
