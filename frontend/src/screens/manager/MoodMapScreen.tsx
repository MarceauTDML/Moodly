import { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/navigation.types';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AppHeader } from '../../components/layout/AppHeader';
import { Modal } from '../../components/ui/Modal';
import { TextLink } from '../../components/ui/TextLink';
import { EmptyState } from '../../components/shared/EmptyState';
import { ErrorState } from '../../components/shared/ErrorState';
import { LoadingOverlay } from '../../components/shared/LoadingOverlay';
import { AnonymityBanner } from '../../components/shared/AnonymityBanner';
import { TeamPicker } from '../../components/shared/TeamPicker';
import { MoodMascot } from '../../components/moodmap/MoodMascot';
import { ScoreSummary } from '../../components/moodmap/ScoreSummary';
import { ManagerAdviceCard } from '../../components/moodmap/ManagerAdviceCard';
import { LastUpdatedTag } from '../../components/moodmap/LastUpdatedTag';
import { CollectiveMoodChart } from '../../components/moodmap/CollectiveMoodChart';
import { TeamTrendsCard } from '../../components/moodmap/TeamTrendsCard';
import { moodStatusColors } from '../../theme/moodStatusColors';
import { useMoodMap } from '../../hooks/useMoodMap';
import { useAuth } from '../../hooks/useAuth';
export function MoodMapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { teams, summary, history, refresh } = useMoodMap();
  const { signOut } = useAuth();
  const [menu, setMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const data = summary.currentData;
  const palette = moodStatusColors[data?.status ?? 'PARFAIT'];
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };
  const ready = data?.hasEnoughData && data.score !== null && data.status;
  return (
    <ScreenContainer
      background={palette.background}
      onRefresh={() => void onRefresh()}
      refreshing={refreshing}
    >
      <StatusBar barStyle={data?.status === 'PREOCCUPANT' ? 'light-content' : 'dark-content'} />
      <View style={{ backgroundColor: palette.hero }}>
        <AppHeader
          subtitle="Les collaborateurs"
          onMenu={() => setMenu(true)}
          color={palette.text}
          muted={palette.muted}
        />
        {ready && (
          <>
            <MoodMascot status={data.status!} />
            <ScoreSummary summary={data} color={palette.text} />
            <ManagerAdviceCard
              title={data.title}
              advice={data.advice}
              color={palette.text}
              muted={palette.muted}
            />
            <LastUpdatedTag date={data.date} color={palette.muted} />
          </>
        )}
      </View>
      <TeamPicker />
      {teams.isError ? (
        <ErrorState error={teams.error} onRetry={() => void teams.refetch()} />
      ) : teams.isLoading ? (
        <LoadingOverlay />
      ) : !teams.team ? (
        <EmptyState
          title="Aucune équipe attribuée"
          description="Demandez à votre administrateur de vous désigner responsable d'une équipe."
        />
      ) : summary.isError ? (
        <ErrorState error={summary.error} onRetry={() => void summary.refetch()} />
      ) : summary.isFetching && !data ? (
        <LoadingOverlay />
      ) : data && !ready ? (
        <EmptyState
          title="L'équipe prend la parole"
          description={`Les résultats apparaîtront dès que le seuil de ${data.minResponses} réponses sera atteint. Les réponses restent collectives.`}
        />
      ) : null}
      {ready && (
        <>
          {history.isError ? (
            <ErrorState error={history.error} onRetry={() => void history.refetch()} />
          ) : history.currentData ? (
            <CollectiveMoodChart
              key={data.team.id}
              points={history.currentData.points}
              zones={history.currentData.zones}
            />
          ) : (
            <LoadingOverlay />
          )}
          <TeamTrendsCard summary={data} onMore={() => navigation.navigate('TeamTrends')} />
        </>
      )}
      {data && <AnonymityBanner threshold={data.minResponses} />}
      <Modal visible={menu} title="Mood map" onClose={() => setMenu(false)}>
        <TextLink
          title="Actualiser les résultats"
          onPress={() => {
            setMenu(false);
            void onRefresh();
          }}
        />
        <TextLink
          title="Évolution"
          onPress={() => {
            setMenu(false);
            navigation.navigate('Manager', { screen: 'Evolution' });
          }}
        />
        <TextLink
          title="Paramètres"
          onPress={() => {
            setMenu(false);
            navigation.navigate('Manager', { screen: 'Settings' });
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
