import { useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/navigation.types';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { TextLink } from '../../components/ui/TextLink';
import { Icon } from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { errorMessage } from '../../services/api.client';
import { isEmail } from '../../utils/validators.util';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';
export function LoginScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Login'>) {
  const portal = route.params?.portal ?? 'employee';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuth();
  const submit = async () => {
    if (busy) return;
    if (!isEmail(email) || !password) {
      setError('Renseignez votre e-mail professionnel et votre mot de passe.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn({ email: email.trim().toLowerCase(), password, portal });
      setPassword('');
    } catch (e) {
      setError(errorMessage(e));
      setPassword('');
    } finally {
      setBusy(false);
    }
  };
  return (
    <ScreenContainer>
      <View style={{ padding: 24, paddingTop: 42, gap: 38 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ backgroundColor: '#EAE6F7', padding: 9, borderRadius: 15 }}>
            <Icon name="smile" size={25} />
          </View>
          <Text style={{ fontSize: 23 }}>Mood Map</Text>
        </View>
        <TextLink
          title="‹ Changer d’espace"
          onPress={() => navigation.navigate('Welcome')}
          style={{ marginTop: -24, marginBottom: -24 }}
        />
        <View style={{ gap: 12 }}>
          <Text accessibilityRole="header" style={typography.title}>
            Bienvenue
          </Text>
          <Text style={{ color: colors.muted, lineHeight: 23 }}>
            La mood map pour suivre comment se portent les collaborateurs de votre entreprise.
          </Text>
        </View>
        <View style={{ gap: 24 }}>
          <View style={{ gap: 5 }}>
            <Text style={[typography.heading, { fontSize: 20 }]}>Connectez-vous</Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>
              {portal === 'manager' ? 'Espace manager' : 'Espace collaborateur'}
            </Text>
          </View>
          <Input
            label="E-mail professionnel"
            placeholder="prenom.nom@entreprise.fr"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            maxLength={254}
            editable={!busy}
          />
          <Input
            label="Mot de passe"
            placeholder="Votre mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            maxLength={128}
            onSubmitEditing={() => void submit()}
            editable={!busy}
          />
          <TextLink
            title="Mot de passe oublié ?"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={{ alignSelf: 'flex-end', marginTop: -14, marginBottom: -10 }}
          />
          {error && (
            <Text accessibilityRole="alert" style={{ color: colors.danger }}>
              {error}
            </Text>
          )}
          <Button title="Se connecter" onPress={() => void submit()} loading={busy} />
          {portal === 'employee' && (
            <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 20 }}>
              Première connexion ? Ouvrez l’invitation de votre manager pour créer votre mot de
              passe.
            </Text>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
