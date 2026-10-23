import { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { EmployeeStackParamList } from '../../navigation/navigation.types';
import { AppHeader } from '../../components/layout/AppHeader';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { Text } from '../../components/ui/Text';
import { TextLink } from '../../components/ui/TextLink';
import { Modal } from '../../components/ui/Modal';
import { TagPill } from '../../components/checkin/TagPill';
import { MoodOptionSelector } from '../../components/checkin/MoodOptionSelector';
import { TagSelector } from '../../components/checkin/TagSelector';
import { OptionalCommentInput } from '../../components/checkin/OptionalCommentInput';
import { MoodSubmittedModal } from '../../components/checkin/MoodSubmittedModal';
import { LoadingOverlay } from '../../components/shared/LoadingOverlay';
import { EmptyState } from '../../components/shared/EmptyState';
import { ErrorState } from '../../components/shared/ErrorState';
import { useDailyCheckin } from '../../hooks/useDailyCheckin';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';

export function DailyCheckinScreen({
  navigation,
}: NativeStackScreenProps<EmployeeStackParamList, 'DailyCheckin'>) {
  const checkin = useDailyCheckin();
  const { signOut } = useAuth();
  const [menu, setMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const data = checkin.options.currentData;
  const status = checkin.today.currentData;
  const refresh = async () => {
    setRefreshing(true);
    try {
      await checkin.refresh();
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <ScreenContainer background="#F7F8FA" onRefresh={() => void refresh()} refreshing={refreshing}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.page}>
        <AppHeader subtitle="La question du jour" onMenu={() => setMenu(true)} />
        <View style={styles.card}>
          {checkin.today.isError ? (
            <ErrorState error={checkin.today.error} onRetry={() => void checkin.today.refetch()} />
          ) : !status ? (
            <LoadingOverlay />
          ) : checkin.submitted ? (
            <View style={{ gap: 14 }}>
              <View style={styles.received}>
                <Text accessible={false} style={{ fontSize: 32, color: '#42965D' }}>
                  ✓
                </Text>
              </View>
              <EmptyState
                title="Ton mood du jour a été enregistré"
                description="Merci pour ta participation. Tu pourras partager un nouveau mood demain."
              />
              <Text style={styles.anonymity}>Vos réponses sont anonymes.</Text>
            </View>
          ) : status.teams.length === 0 ? (
            <EmptyState
              title="Aucune équipe attribuée"
              description="Ton administrateur doit te rattacher à une équipe pour que tu puisses partager ton mood."
            />
          ) : !status.canSubmit ? (
            <EmptyState
              title="La saisie est indisponible"
              description="Actualise la page ou contacte ton administrateur."
            />
          ) : checkin.options.isError ? (
            <ErrorState
              error={checkin.options.error}
              onRetry={() => void checkin.options.refetch()}
            />
          ) : !data ? (
            <LoadingOverlay />
          ) : (
            <>
              <Text accessibilityRole="header" style={styles.question}>
                {data.question}
              </Text>
              {status.requiresTeamChoice && (
                <View style={{ gap: 10 }}>
                  <Text style={styles.label}>Pour quelle équipe partages-tu ton mood ?</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {status.teams.map((team) => (
                      <TagPill
                        key={team.id}
                        label={team.name}
                        selected={checkin.teamId === team.id}
                        onPress={() => checkin.setTeamId(team.id)}
                        disabled={checkin.submitting}
                      />
                    ))}
                  </View>
                  <Text style={styles.hint}>
                    Une seule réponse par jour, toutes équipes confondues.
                  </Text>
                </View>
              )}
              <MoodOptionSelector
                options={data.moods}
                value={checkin.mood}
                onChange={checkin.setMood}
                disabled={checkin.submitting}
              />
              <View style={{ gap: 10 }}>
                <Text style={styles.label}>{data.tagsQuestion}</Text>
                <TagSelector
                  options={data.tags}
                  value={checkin.tags}
                  onToggle={checkin.toggleTag}
                  disabled={checkin.submitting}
                />
              </View>
              <OptionalCommentInput
                value={checkin.comment}
                onChange={checkin.setComment}
                placeholder={data.commentPlaceholder}
                disabled={checkin.submitting}
              />
              {checkin.error ? (
                <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 13 }}>
                  {checkin.error}
                </Text>
              ) : null}
              <View style={{ gap: 14 }}>
                <Button
                  title="Valider mon mood"
                  onPress={() => void checkin.submit()}
                  disabled={!checkin.canSubmit}
                  loading={checkin.submitting}
                />
                <Text style={styles.anonymity}>Vos réponses sont anonymes.</Text>
              </View>
            </>
          )}
        </View>
      </View>
      <MoodSubmittedModal
        visible={checkin.modalVisible}
        result={checkin.confirmation}
        onClose={checkin.closeConfirmation}
      />
      <Modal visible={menu} title="Mon espace" onClose={() => setMenu(false)}>
        <TextLink
          title="Actualiser"
          onPress={() => {
            setMenu(false);
            void refresh();
          }}
        />
        <TextLink
          title="Mon historique"
          onPress={() => {
            setMenu(false);
            navigation.navigate('MyHistory');
          }}
        />
        <TextLink
          title="Paramètres"
          onPress={() => {
            setMenu(false);
            navigation.navigate('EmployeeSettings');
          }}
        />
        <TextLink
          title="Se déconnecter"
          onPress={() => {
            setMenu(false);
            signOut();
          }}
        />
      </Modal>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginTop: 18,
    padding: 24,
    gap: 22,
    borderWidth: 1,
    borderColor: '#E8EAF0',
    boxShadow: '0px 4px 14px rgba(24,33,55,0.04)',
  },
  question: { color: '#202736', fontSize: 18, lineHeight: 26, fontFamily: 'Inter-Bold' },
  label: { color: '#202736', fontSize: 12, lineHeight: 20, fontFamily: 'Inter-Medium' },
  hint: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  anonymity: { textAlign: 'center', color: '#758095', fontSize: 12, lineHeight: 18 },
  received: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E6F5EC',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
