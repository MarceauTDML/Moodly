import { useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/navigation.types';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AppHeader } from '../../components/layout/AppHeader';
import { Input } from '../../components/ui/Input';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useActivateAccountMutation } from '../../store/api/authApi';
import { errorMessage } from '../../services/api.client';
import { isStrongPassword, passwordHint } from '../../utils/validators.util';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
export function ActivateAccountScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'ActivateAccount'>) {
  const token = route.params?.token ?? '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [activate, { isLoading }] = useActivateAccountMutation();
  const submit = async () => {
    if (isLoading) return;
    if (!isStrongPassword(password) || password !== confirmation) {
      setError('Vérifiez les règles du mot de passe et sa confirmation.');
      return;
    }
    setError('');
    try {
      await activate({ token, password }).unwrap();
      setPassword('');
      setConfirmation('');
      setDone(true);
      // Remove the consumed invitation from browser history as soon as possible.
      navigation.setParams({ token: undefined });
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  return (
    <ScreenContainer>
      <AppHeader
        title="Mood Map"
        subtitle="Espace collaborateur"
        onBack={() => navigation.navigate('Welcome')}
      />
      <View style={{ padding: 24, paddingTop: 32, gap: 22 }}>
        <Icon name={done ? 'check' : 'key'} size={38} />
        <Text accessibilityRole="header" style={typography.title}>
          {done ? 'Votre compte est activé' : 'Créez votre mot de passe'}
        </Text>
        {done ? (
          <>
            <Text>
              Bienvenue sur Mood Map. Vous pouvez maintenant partager votre humeur du jour.
            </Text>
            <Button
              title="Se connecter"
              onPress={() => navigation.replace('Login', { portal: 'employee' })}
            />
          </>
        ) : !/^[a-f0-9]{64}$/.test(token) ? (
          <>
            <Text>
              Pour activer votre compte, ouvrez le lien personnel envoyé par votre manager.
              Demandez-lui une nouvelle invitation si le lien a expiré.
            </Text>
            <Button title="Retour à l’accueil" onPress={() => navigation.navigate('Welcome')} />
          </>
        ) : (
          <>
            <Text style={{ color: colors.muted, lineHeight: 23 }}>
              Un dernier pas pour rejoindre votre équipe. Choisissez un mot de passe personnel.
            </Text>
            <Input
              label="Nouveau mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              maxLength={128}
              editable={!isLoading}
            />
            <Text style={typography.small}>{passwordHint}</Text>
            <Input
              label="Confirmer le mot de passe"
              value={confirmation}
              onChangeText={setConfirmation}
              secureTextEntry
              autoComplete="new-password"
              maxLength={128}
              editable={!isLoading}
              onSubmitEditing={() => void submit()}
            />
            {error ? (
              <Text accessibilityRole="alert" style={{ color: colors.danger }}>
                {error}
              </Text>
            ) : null}
            <Button title="Activer mon compte" onPress={() => void submit()} loading={isLoading} />
            <Text style={{ color: colors.muted, lineHeight: 20, fontSize: 12 }}>
              Vos réponses de bien-être restent confidentielles. Seules les tendances collectives
              sont partagées.
            </Text>
          </>
        )}
      </View>
    </ScreenContainer>
  );
}
