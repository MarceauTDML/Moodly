import { useState } from 'react';
import { View } from 'react-native';
import { Text } from '../ui/Text';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { TextLink } from '../ui/TextLink';
import { useAuth } from '../../hooks/useAuth';
import { useResendTwoFactorCodeMutation } from '../../store/api/authApi';
import { errorMessage } from '../../services/api.client';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useTypography } from '../../theme/typography';
import type { TwoFactorChallenge } from '../../types/auth.types';

// Seconde étape de connexion : le mot de passe est vérifié, la session attend ce code.
export function TwoFactorLoginStep({
  challenge,
  onCancel,
}: {
  challenge: TwoFactorChallenge;
  onCancel: () => void;
}) {
  const { colors } = useAppTheme();
  const typography = useTypography();
  const { completeTwoFactor } = useAuth();
  const [resend, resendState] = useResendTwoFactorCodeMutation();
  const [code, setCode] = useState('');
  const [recovery, setRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async () => {
    const value = code.trim().toLowerCase();
    if (busy) return;
    if (!(recovery ? /^[a-z2-7]{4}-[a-z2-7]{4}$/ : /^\d{6}$/).test(value)) {
      setError(recovery ? 'Format attendu : abcd-efgh.' : 'Saisissez les 6 chiffres du code.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await completeTwoFactor(challenge.challengeToken, value);
    } catch (e) {
      setError(errorMessage(e));
      setCode('');
      setBusy(false);
    }
  };
  const sendAgain = async () => {
    setError('');
    try {
      await resend({ challengeToken: challenge.challengeToken }).unwrap();
      setInfo('Un nouveau code vient d’être envoyé.');
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <View style={{ gap: 20 }}>
      <View style={{ gap: 6 }}>
        <Text style={[typography.heading, { fontSize: 20 }]}>Vérification en deux étapes</Text>
        <Text style={{ color: colors.muted }}>
          {recovery
            ? 'Saisissez l’un de vos codes de secours. Chacun ne fonctionne qu’une fois.'
            : challenge.method === 'TOTP'
              ? 'Ouvrez votre application d’authentification et saisissez le code affiché pour Mood Map.'
              : `Saisissez le code envoyé à ${challenge.email ?? 'votre adresse e-mail'}. Il est valable 10 minutes.`}
        </Text>
      </View>
      <Input
        label={recovery ? 'Code de secours' : 'Code à 6 chiffres'}
        value={code}
        onChangeText={setCode}
        keyboardType={recovery ? 'default' : 'number-pad'}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={recovery ? 'off' : 'one-time-code'}
        textContentType={recovery ? 'none' : 'oneTimeCode'}
        maxLength={recovery ? 9 : 6}
        onSubmitEditing={() => void submit()}
        editable={!busy}
      />
      {info && !error && (
        <Text accessibilityLiveRegion="polite" style={{ color: colors.success }}>
          {info}
        </Text>
      )}
      {error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
      <Button title="Valider" onPress={() => void submit()} loading={busy} />
      {challenge.method === 'EMAIL' && !recovery && (
        <TextLink
          title={resendState.isLoading ? 'Envoi…' : 'Renvoyer un code'}
          onPress={() => void sendAgain()}
        />
      )}
      <TextLink
        title={recovery ? 'Utiliser le code habituel' : 'Utiliser un code de secours'}
        onPress={() => {
          setRecovery(!recovery);
          setCode('');
          setError('');
        }}
      />
      <TextLink title="‹ Revenir à la connexion" onPress={onCancel} />
    </View>
  );
}
