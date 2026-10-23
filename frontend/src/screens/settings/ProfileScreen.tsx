import { useEffect, useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/navigation.types';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AppHeader } from '../../components/layout/AppHeader';
import { Card } from '../../components/ui/Card';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/shared/ErrorState';
import { LoadingOverlay } from '../../components/shared/LoadingOverlay';
import { MyDataCard } from '../../components/settings/MyDataCard';
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from '../../store/api/usersApi';
import { useAuth } from '../../hooks/useAuth';
import { errorMessage } from '../../services/api.client';
import { isStrongPassword, passwordHint } from '../../utils/validators.util';
import { colors } from '../../theme/colors';
export function ProfileScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Profile'>) {
  const query = useProfileQuery();
  const profile = query.currentData;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [update, updateState] = useUpdateProfileMutation();
  const [change, changeState] = useChangePasswordMutation();
  const { signOut } = useAuth();
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
    }
  }, [profile]);
  const saveProfile = async () => {
    setError('');
    setMessage('');
    if (!firstName.trim() || !lastName.trim()) {
      setError('Le prénom et le nom sont requis.');
      return;
    }
    try {
      await update({ firstName: firstName.trim(), lastName: lastName.trim() }).unwrap();
      setMessage('Profil enregistré.');
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  const savePassword = async () => {
    setPasswordError('');
    setPasswordMessage('');
    if (
      !currentPassword ||
      !isStrongPassword(newPassword) ||
      newPassword === currentPassword ||
      confirmation !== newPassword
    ) {
      setPasswordError(
        'Vérifiez le mot de passe actuel, les règles du nouveau mot de passe et sa confirmation.',
      );
      return;
    }
    try {
      await change({ currentPassword, newPassword }).unwrap();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
      setPasswordMessage('Mot de passe modifié. Reconnectez-vous avec le nouveau mot de passe.');
    } catch (e) {
      setPasswordError(errorMessage(e));
    }
  };
  return (
    <ScreenContainer>
      <AppHeader title="Mon profil" onBack={navigation.goBack} />
      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : !profile ? (
        <LoadingOverlay />
      ) : (
        <View style={{ padding: 24, gap: 24 }}>
          <Card>
            <Text style={{ fontSize: 18, fontFamily: 'Inter-Medium' }}>
              Informations personnelles
            </Text>
            <Text style={{ color: colors.muted }}>{profile.email}</Text>
            <Input
              label="Prénom"
              value={firstName}
              onChangeText={setFirstName}
              autoComplete="given-name"
              maxLength={80}
            />
            <Input
              label="Nom"
              value={lastName}
              onChangeText={setLastName}
              autoComplete="family-name"
              maxLength={80}
            />
            {message && (
              <Text accessibilityLiveRegion="polite" style={{ color: colors.success }}>
                {message}
              </Text>
            )}
            {error && (
              <Text accessibilityRole="alert" style={{ color: colors.danger }}>
                {error}
              </Text>
            )}
            <Button
              title="Enregistrer mon profil"
              onPress={() => void saveProfile()}
              loading={updateState.isLoading}
            />
          </Card>
          <Card>
            <Text style={{ fontSize: 18, fontFamily: 'Inter-Medium' }}>Mot de passe</Text>
            {passwordMessage ? (
              <>
                <Text accessibilityLiveRegion="polite" style={{ color: colors.success }}>
                  {passwordMessage}
                </Text>
                <Button title="Me reconnecter" onPress={signOut} />
              </>
            ) : (
              <>
                <Input
                  label="Mot de passe actuel"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  autoComplete="current-password"
                  maxLength={128}
                />
                <Input
                  label="Nouveau mot de passe"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoComplete="new-password"
                  maxLength={128}
                />
                <Text style={{ color: colors.muted, fontSize: 12 }}>{passwordHint}</Text>
                <Input
                  label="Confirmer le nouveau mot de passe"
                  value={confirmation}
                  onChangeText={setConfirmation}
                  secureTextEntry
                  maxLength={128}
                />
                {passwordError && (
                  <Text accessibilityRole="alert" style={{ color: colors.danger }}>
                    {passwordError}
                  </Text>
                )}
                <Button
                  title="Modifier mon mot de passe"
                  onPress={() => void savePassword()}
                  loading={changeState.isLoading}
                />
              </>
            )}
          </Card>
          <MyDataCard />
        </View>
      )}
    </ScreenContainer>
  );
}
