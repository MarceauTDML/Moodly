import { useState } from 'react';
import { Share, View } from 'react-native';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useDeleteAccountMutation, useLazyPersonalDataQuery } from '../../store/api/usersApi';
import { useAuth } from '../../hooks/useAuth';
import { errorMessage } from '../../services/api.client';
import { moodHistory } from '../../services/moodHistory.storage';
import { useAppSelector } from '../../store';
import { useAppTheme } from '../../theme/ThemeProvider';

// Droits RGPD : portabilité (export) et effacement (suppression du compte).
export function MyDataCard() {
  const { colors } = useAppTheme();
  const { signOut } = useAuth();
  const userId = useAppSelector((s) => s.auth.session?.user.id);
  const [loadPersonalData, exportState] = useLazyPersonalDataQuery();
  const [deleteAccount, deleteState] = useDeleteAccountMutation();
  const [exportError, setExportError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const exportData = async () => {
    setExportError('');
    try {
      const data = await loadPersonalData().unwrap();
      // L'historique personnel n'existe que sur ce téléphone : il est ajouté à l'export ici.
      const deviceHistory = userId ? await moodHistory.read(userId) : [];
      await Share.share({
        title: 'Mes données Mood Map',
        message: JSON.stringify({ ...data, deviceHistory }, null, 2),
      });
    } catch (e) {
      setExportError(errorMessage(e));
    }
  };
  const closeConfirmation = () => {
    setConfirming(false);
    setPassword('');
    setDeleteError('');
  };
  const confirmDeletion = async () => {
    setDeleteError('');
    if (!password) {
      setDeleteError('Saisissez votre mot de passe pour confirmer.');
      return;
    }
    try {
      await deleteAccount({ password }).unwrap();
      if (userId) await moodHistory.clear(userId).catch(() => undefined);
      closeConfirmation();
      signOut();
    } catch (e) {
      setDeleteError(errorMessage(e));
    }
  };

  return (
    <Card>
      <Text style={{ fontSize: 18, fontFamily: 'Inter-Medium' }}>Mes données</Text>
      <Text style={{ color: colors.muted }}>
        Téléchargez tout ce que Mood Map sait de votre compte, avec l’historique enregistré sur ce
        téléphone. Le serveur, lui, ne conserve aucune réponse liée à vous.
      </Text>
      {exportError && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {exportError}
        </Text>
      )}
      <Button
        title="Télécharger mes données"
        secondary
        onPress={() => void exportData()}
        loading={exportState.isFetching}
      />
      <Button title="Supprimer mon compte" secondary onPress={() => setConfirming(true)} />
      <Modal visible={confirming} title="Supprimer mon compte" onClose={closeConfirmation}>
        <View style={{ gap: 12 }}>
          <Text>
            Votre compte, vos équipes, vos préférences, vos jours de participation et l’historique
            de ce téléphone seront supprimés définitivement.
          </Text>
          <Text style={{ color: colors.muted }}>
            Vos réponses passées restent dans les statistiques de l’équipe : elles sont anonymes et
            personne ne peut les relier à vous.
          </Text>
          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            maxLength={128}
          />
          {deleteError && (
            <Text accessibilityRole="alert" style={{ color: colors.danger }}>
              {deleteError}
            </Text>
          )}
          <Button
            title="Supprimer définitivement"
            onPress={() => void confirmDeletion()}
            loading={deleteState.isLoading}
          />
          <Button title="Annuler" secondary onPress={closeConfirmation} />
        </View>
      </Modal>
    </Card>
  );
}
