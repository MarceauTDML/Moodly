import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ManagerSettingsParamList } from '../../navigation/SettingsStack';
import { ManagerPage } from '../../components/layout/ManagerPage';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { TextLink } from '../../components/ui/TextLink';
import { Icon } from '../../components/ui/Icon';
import { Modal } from '../../components/ui/Modal';
import { LoadingOverlay } from '../../components/shared/LoadingOverlay';
import { ErrorState } from '../../components/shared/ErrorState';
import { useTeamsQuery } from '../../store/api/usersApi';
import {
  useCollaboratorQuery,
  useCreateCollaboratorMutation,
  useUpdateCollaboratorMutation,
} from '../../store/api/collaboratorsApi';
import { isEmail } from '../../utils/validators.util';
import { errorMessage } from '../../services/api.client';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
export function CollaboratorFormScreen({
  route,
  navigation,
}: NativeStackScreenProps<ManagerSettingsParamList, 'CollaboratorForm'>) {
  const userId = route.params?.userId;
  const teams = useTeamsQuery();
  const user = useCollaboratorQuery(userId ?? '', { skip: !userId });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [teamId, setTeamId] = useState('');
  const [teamOpen, setTeamOpen] = useState(false);
  const [error, setError] = useState('');
  const [create, creating] = useCreateCollaboratorMutation();
  const [update, updating] = useUpdateCollaboratorMutation();
  const busy = creating.isLoading || updating.isLoading;
  useEffect(() => {
    if (user.currentData) {
      const u = user.currentData;
      setFirstName(u.firstName);
      setLastName(u.lastName);
      setEmail(u.email);
      setTeamId(u.memberships[0]?.team.id ?? '');
    }
  }, [user.currentData]);
  useEffect(() => {
    if (!userId && teams.currentData?.length === 1) setTeamId(teams.currentData[0]!.id);
  }, [teams.currentData, userId]);
  const back = () => (userId ? navigation.goBack() : navigation.navigate('Collaborators'));
  const submit = async () => {
    if (busy) return;
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !isEmail(email) ||
      !teams.currentData?.some((t) => t.id === teamId)
    ) {
      setError('Complétez tous les champs avec une adresse professionnelle valide et une équipe.');
      return;
    }
    setError('');
    const data = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      teamId,
    };
    try {
      const result = userId
        ? await update({ id: userId, data }).unwrap()
        : await create(data).unwrap();
      navigation.replace('CollaboratorDetail', { userId: result.id });
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  const teamName = teams.currentData?.find((t) => t.id === teamId)?.name;
  return (
    <ManagerPage backLabel="Collaborateurs" onBack={back}>
      <View style={{ gap: 10 }}>
        <Text accessibilityRole="header" style={typography.title}>
          {userId ? 'Modifier le collaborateur' : 'Ajouter un collaborateur'}
        </Text>
        <Text style={{ color: colors.muted, lineHeight: 22 }}>
          Un premier pas pour prendre soin de votre équipe.
        </Text>
      </View>
      {teams.isError ? (
        <ErrorState error={teams.error} onRetry={() => void teams.refetch()} />
      ) : userId && user.isError ? (
        <ErrorState error={user.error} onRetry={() => void user.refetch()} />
      ) : !teams.currentData || (userId && !user.currentData) ? (
        <LoadingOverlay />
      ) : (
        <>
          <Text style={typography.small}>Tous les champs sont obligatoires.</Text>
          <Input
            label="Prénom"
            value={firstName}
            onChangeText={setFirstName}
            maxLength={80}
            editable={!busy}
            autoComplete="given-name"
          />
          <Input
            label="Nom"
            value={lastName}
            onChangeText={setLastName}
            maxLength={80}
            editable={!busy}
            autoComplete="family-name"
          />
          <Input
            label="E-mail professionnel"
            value={email}
            onChangeText={setEmail}
            maxLength={254}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!busy && user.currentData?.status !== 'ACTIVE'}
          />
          <Text style={[typography.small, { marginTop: -12 }]}>
            Cette adresse servira à se connecter à Mood map.
          </Text>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, fontFamily: 'Inter-Medium' }}>Équipe / Service</Text>
            <Pressable
              disabled={busy || teams.currentData.length === 0}
              accessibilityRole="button"
              accessibilityLabel="Choisir une équipe"
              onPress={() => setTeamOpen(true)}
              style={{
                backgroundColor: colors.input,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 16,
                minHeight: 54,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ flex: 1, fontSize: 14 }}>{teamName ?? 'Choisir une équipe'}</Text>
              <Text style={{ color: colors.muted }}>⌄</Text>
            </Pressable>
          </View>
          {teams.currentData.length === 0 && (
            <Text style={{ color: colors.warning }}>
              Aucune équipe attribuée. Contactez votre administrateur avant d’ajouter un
              collaborateur.
            </Text>
          )}
          <Input label="Rôle sur la plateforme" value="Collaborateur" editable={false} />
          {!userId && (
            <View
              style={{
                flexDirection: 'row',
                gap: 14,
                padding: 18,
                borderRadius: 22,
                backgroundColor: '#ECE7F7',
              }}
            >
              <Icon name="users" size={23} />
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={{ fontFamily: 'Inter-Medium' }}>Un compte à activer ensuite</Text>
                <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 21 }}>
                  Après l’ajout, le compte sera en attente d’activation. Vous pourrez envoyer son
                  invitation depuis sa fiche.
                </Text>
              </View>
            </View>
          )}
          {error ? (
            <Text accessibilityRole="alert" style={{ color: colors.danger }}>
              {error}
            </Text>
          ) : null}
          <Button
            title={userId ? 'Enregistrer les modifications' : '＋  Ajouter le collaborateur'}
            onPress={() => void submit()}
            loading={busy}
            disabled={teams.currentData.length === 0}
          />
          <TextLink
            title="Annuler"
            onPress={back}
            style={{ alignSelf: 'center', marginTop: -14 }}
          />
          <Modal visible={teamOpen} title="Équipe / Service" onClose={() => setTeamOpen(false)}>
            <ScrollView>
              {teams.currentData.map((t) => (
                <Pressable
                  key={t.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: teamId === t.id }}
                  onPress={() => {
                    setTeamId(t.id);
                    setTeamOpen(false);
                  }}
                  style={{
                    padding: 16,
                    backgroundColor: teamId === t.id ? '#ECE7F7' : colors.input,
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                >
                  <Text>{t.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Modal>
        </>
      )}
    </ManagerPage>
  );
}
