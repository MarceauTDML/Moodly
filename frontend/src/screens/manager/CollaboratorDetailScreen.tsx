import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ManagerSettingsParamList } from '../../navigation/SettingsStack';
import { ManagerPage } from '../../components/layout/ManagerPage';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { TextLink } from '../../components/ui/TextLink';
import { Card } from '../../components/ui/Card';
import { Icon, type IconName } from '../../components/ui/Icon';
import { Divider } from '../../components/ui/Divider';
import { AccountStatusBadge } from '../../components/shared/AccountStatusBadge';
import { LoadingOverlay } from '../../components/shared/LoadingOverlay';
import { ErrorState } from '../../components/shared/ErrorState';
import {
  useCollaboratorQuery,
  useInviteCollaboratorMutation,
} from '../../store/api/collaboratorsApi';
import { errorMessage } from '../../services/api.client';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useTypography } from '../../theme/typography';
export function CollaboratorDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<ManagerSettingsParamList, 'CollaboratorDetail'>) {
  const { colors } = useAppTheme();
  const typography = useTypography();
  const query = useCollaboratorQuery(route.params.userId, { refetchOnMountOrArgChange: true });
  useFocusEffect(
    useCallback(() => {
      void query.refetch();
    }, [query.refetch]),
  );
  const [invite, invitation] = useInviteCollaboratorMutation();
  const user = query.currentData;
  const row = (label: string, value: string, icon: IconName) => (
    <View style={{ flexDirection: 'row', gap: 14, paddingVertical: 12, alignItems: 'center' }}>
      <Icon name={icon} color={colors.muted} size={21} />
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={typography.small}>{label}</Text>
        <Text selectable style={{ fontSize: 14 }}>
          {value}
        </Text>
      </View>
    </View>
  );
  return (
    <ManagerPage backLabel="Collaborateurs" onBack={() => navigation.navigate('Collaborators')}>
      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : !user ? (
        <LoadingOverlay />
      ) : (
        <>
          <View style={{ alignItems: 'center', gap: 15, paddingVertical: 10 }}>
            <View
              style={{
                width: 82,
                height: 82,
                borderRadius: 41,
                backgroundColor: colors.selected,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 30 }}>
                {user.firstName.slice(0, 1)}
                {user.lastName.slice(0, 1)}
              </Text>
            </View>
            <Text accessibilityRole="header" style={[typography.title, { textAlign: 'center' }]}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 13, textAlign: 'center' }}>
              {user.memberships.map((m) => m.team.name).join(', ')} · Collaborateur
            </Text>
            <View style={{ alignItems: 'center' }}>
              <AccountStatusBadge status={user.status} />
            </View>
          </View>
          <Card>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Text style={{ flex: 1, fontFamily: 'Inter-Medium' }}>Informations du compte</Text>
              <TextLink
                title="Modifier"
                onPress={() => navigation.navigate('CollaboratorForm', { userId: user.id })}
              />
            </View>
            {row('E-mail professionnel', user.email, 'mail')}
            <Divider />
            {row('Équipe / Service', user.memberships.map((m) => m.team.name).join(', '), 'users')}
            <Divider />
            {row(
              'Date d’inscription',
              new Date(user.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
              'calendar',
            )}
          </Card>
          {user.status === 'PENDING' ? (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 14,
                  padding: 18,
                  borderRadius: 22,
                  backgroundColor: colors.selected,
                }}
              >
                <Icon name="key" size={24} />
                <View style={{ flex: 1, gap: 8 }}>
                  <Text style={{ fontFamily: 'Inter-Medium' }}>
                    {user.invitationSentAt || invitation.data
                      ? 'En attente du collaborateur'
                      : 'Le compte attend votre activation'}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 21 }}>
                    {user.firstName} ne peut pas encore se connecter. Envoyez son invitation pour
                    lui permettre de créer son mot de passe.
                  </Text>
                </View>
              </View>
              {invitation.isError && (
                <Text accessibilityRole="alert" style={{ color: colors.danger }}>
                  {errorMessage(invitation.error)}
                </Text>
              )}
              <Button
                title={
                  user.invitationSentAt || invitation.data
                    ? 'Renvoyer l’invitation'
                    : 'Activer le compte'
                }
                loading={invitation.isLoading}
                onPress={() => {
                  void invite(user.id)
                    .unwrap()
                    .catch(() => undefined);
                }}
              />
              {invitation.data ? (
                <View style={{ gap: 12 }}>
                  <Text
                    accessibilityLiveRegion="polite"
                    style={{ color: colors.success, fontSize: 13, lineHeight: 21 }}
                  >
                    {invitation.data.message}
                  </Text>
                  {invitation.data.activationUrl && (
                    <Text
                      selectable
                      style={{ color: colors.primary, fontSize: 12, lineHeight: 20 }}
                    >
                      {invitation.data.activationUrl}
                    </Text>
                  )}
                </View>
              ) : (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Icon name="mail" color={colors.muted} size={18} />
                  <Text style={{ flex: 1, color: colors.muted, fontSize: 12, lineHeight: 20 }}>
                    L’invitation lui permettra de créer son mot de passe. Le compte restera en
                    attente jusqu’à cette étape.
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={{ gap: 10 }}>
              <Text style={{ color: colors.success, fontFamily: 'Inter-Medium' }}>
                Ce compte est actif
              </Text>
              <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 21 }}>
                {user.firstName} peut se connecter à son espace collaborateur.
              </Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Icon name="lock" color={colors.success} size={20} />
            <Text style={{ flex: 1, color: colors.muted, fontSize: 12, lineHeight: 20 }}>
              Les réponses de bien-être restent confidentielles. Seules les tendances collectives
              sont partagées.
            </Text>
          </View>
        </>
      )}
    </ManagerPage>
  );
}
