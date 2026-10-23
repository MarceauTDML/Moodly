import { useState } from 'react';
import { Linking, Share, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/navigation.types';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AppHeader } from '../../components/layout/AppHeader';
import { Card } from '../../components/ui/Card';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ErrorState } from '../../components/shared/ErrorState';
import { LoadingOverlay } from '../../components/shared/LoadingOverlay';
import {
  useConfirmTwoFactorMutation,
  useDisableTwoFactorMutation,
  useSetupTwoFactorMutation,
  useTwoFactorStatusQuery,
} from '../../store/api/usersApi';
import { errorMessage } from '../../services/api.client';
import { useAppTheme } from '../../theme/ThemeProvider';
import type { TwoFactorMethod, TwoFactorSetup } from '../../types/auth.types';

const METHOD_LABELS: Record<TwoFactorMethod, string> = {
  TOTP: 'Application d’authentification',
  EMAIL: 'Code par e-mail',
};
// Lecture plus facile du secret à recopier : groupes de 4 caractères.
const groupSecret = (secret: string) => secret.match(/.{1,4}/g)?.join(' ') ?? secret;

// Facultative : protège le compte même si le mot de passe est connu d'un tiers.
export function TwoFactorScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'TwoFactor'>) {
  const { colors } = useAppTheme();
  const status = useTwoFactorStatusQuery();
  const [setupTwoFactor, setupState] = useSetupTwoFactorMutation();
  const [confirmTwoFactor, confirmState] = useConfirmTwoFactorMutation();
  const [disableTwoFactor, disableState] = useDisableTwoFactorMutation();
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [code, setCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [disabling, setDisabling] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const run = async (action: () => Promise<void>) => {
    setError('');
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  const start = (method: TwoFactorMethod) =>
    run(async () => {
      setCode('');
      setSetup(await setupTwoFactor({ method }).unwrap());
    });
  const confirm = () =>
    run(async () => {
      if (!/^\d{6}$/.test(code.trim())) throw new Error('Saisissez les 6 chiffres du code.');
      const result = await confirmTwoFactor({ code: code.trim() }).unwrap();
      setSetup(null);
      setRecoveryCodes(result.recoveryCodes);
    });
  const disable = () =>
    run(async () => {
      if (!password) throw new Error('Saisissez votre mot de passe pour confirmer.');
      await disableTwoFactor({ password }).unwrap();
      setDisabling(false);
      setPassword('');
    });

  const errorText = error ? (
    <Text accessibilityRole="alert" style={{ color: colors.danger }}>
      {error}
    </Text>
  ) : null;
  const method = status.currentData?.method ?? null;

  return (
    <ScreenContainer>
      <AppHeader title="Double authentification" onBack={navigation.goBack} />
      {status.isError ? (
        <ErrorState error={status.error} onRetry={() => void status.refetch()} />
      ) : !status.currentData ? (
        <LoadingOverlay />
      ) : (
        <View style={{ padding: 24, gap: 18 }}>
          <Text style={{ color: colors.muted }}>
            À la connexion, un code vous est demandé en plus du mot de passe. Même si votre mot de
            passe était découvert, votre compte resterait protégé.
          </Text>

          {recoveryCodes ? (
            <Card>
              <Text style={{ fontFamily: 'Inter-Medium', fontSize: 17 }}>Vos codes de secours</Text>
              <Text style={{ color: colors.muted }}>
                Si vous perdez l’accès à vos codes habituels, chacun de ces codes permet une
                connexion. Notez-les en lieu sûr : ils ne seront plus affichés.
              </Text>
              <Text selectable style={{ fontFamily: 'Inter-Medium', fontSize: 16, lineHeight: 28 }}>
                {recoveryCodes.join('\n')}
              </Text>
              <Button
                title="Partager ou enregistrer"
                secondary
                onPress={() =>
                  void Share.share({
                    message: `Codes de secours Mood Map :\n${recoveryCodes.join('\n')}`,
                  })
                }
              />
              <Button title="J’ai noté mes codes" onPress={() => setRecoveryCodes(null)} />
            </Card>
          ) : method ? (
            <Card>
              <Text style={{ fontFamily: 'Inter-Medium', fontSize: 17 }}>Activée</Text>
              <Text>{METHOD_LABELS[method]}</Text>
              <Text style={{ color: colors.muted }}>
                Codes de secours restants : {status.currentData.recoveryCodesLeft}
              </Text>
              <Button title="Désactiver" secondary onPress={() => setDisabling(true)} />
            </Card>
          ) : setup ? (
            <Card>
              {setup.method === 'TOTP' ? (
                <>
                  <Text style={{ fontFamily: 'Inter-Medium', fontSize: 17 }}>
                    1. Ajoutez Mood Map à votre application
                  </Text>
                  <Text style={{ color: colors.muted }}>
                    Google Authenticator, Microsoft Authenticator, 1Password… Sur ce téléphone,
                    ouvrez le lien. Sinon, saisissez la clé à la main.
                  </Text>
                  <Button
                    title="Ouvrir l’application d’authentification"
                    secondary
                    onPress={() =>
                      void Linking.openURL(setup.otpauthUrl).catch(() =>
                        setError(
                          'Aucune application d’authentification trouvée : saisissez la clé.',
                        ),
                      )
                    }
                  />
                  <Text selectable style={{ fontFamily: 'Inter-Medium', letterSpacing: 1 }}>
                    {groupSecret(setup.secret)}
                  </Text>
                  <Text style={{ fontFamily: 'Inter-Medium', fontSize: 17 }}>
                    2. Saisissez le code affiché
                  </Text>
                </>
              ) : (
                <Text style={{ color: colors.muted }}>
                  Un code a été envoyé à {setup.email}. Il est valable 10 minutes.
                </Text>
              )}
              <Input
                label="Code à 6 chiffres"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                maxLength={6}
                onSubmitEditing={() => void confirm()}
              />
              {errorText}
              <Button
                title="Activer"
                onPress={() => void confirm()}
                loading={confirmState.isLoading}
              />
              <Button title="Annuler" secondary onPress={() => setSetup(null)} />
            </Card>
          ) : (
            <Card>
              <Text style={{ fontFamily: 'Inter-Medium', fontSize: 17 }}>Désactivée</Text>
              <Text style={{ color: colors.muted }}>Choisissez comment recevoir vos codes :</Text>
              {errorText}
              <Button
                title={METHOD_LABELS.TOTP}
                onPress={() => void start('TOTP')}
                loading={setupState.isLoading && setupState.originalArgs?.method === 'TOTP'}
              />
              <Button
                title={METHOD_LABELS.EMAIL}
                secondary
                onPress={() => void start('EMAIL')}
                loading={setupState.isLoading && setupState.originalArgs?.method === 'EMAIL'}
              />
            </Card>
          )}
        </View>
      )}
      <Modal
        visible={disabling}
        title="Désactiver la double authentification"
        onClose={() => setDisabling(false)}
      >
        <View style={{ gap: 12 }}>
          <Text>Votre mot de passe suffira de nouveau pour vous connecter.</Text>
          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            maxLength={128}
          />
          {errorText}
          <Button
            title="Désactiver"
            onPress={() => void disable()}
            loading={disableState.isLoading}
          />
          <Button title="Annuler" secondary onPress={() => setDisabling(false)} />
        </View>
      </Modal>
    </ScreenContainer>
  );
}
