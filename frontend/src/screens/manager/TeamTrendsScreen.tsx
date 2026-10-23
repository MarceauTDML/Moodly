import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { skipToken } from '@reduxjs/toolkit/query/react';
import type { RootStackParamList } from '../../navigation/navigation.types';
import { useTeam } from '../../hooks/useTeam';
import { useTrendsQuery } from '../../store/api/moodmapApi';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AppHeader } from '../../components/layout/AppHeader';
import { AnonymityBanner } from '../../components/shared/AnonymityBanner';
import { EmptyState } from '../../components/shared/EmptyState';
import { ErrorState } from '../../components/shared/ErrorState';
import { LoadingOverlay } from '../../components/shared/LoadingOverlay';
import { Card } from '../../components/ui/Card';
import { Text } from '../../components/ui/Text';
import { formatNumber, formatScore } from '../../utils/formatters.util';
import { formatPeriod } from '../../utils/date.util';
import { useAppTheme } from '../../theme/ThemeProvider';
export function TeamTrendsScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'TeamTrends'>) {
  const { colors } = useAppTheme();
  const teams = useTeam();
  const query = useTrendsQuery(teams.team?.id ?? skipToken);
  const data = query.currentData;
  return (
    <ScreenContainer
      onRefresh={teams.team ? () => void query.refetch() : undefined}
      refreshing={query.isFetching && Boolean(data)}
    >
      <AppHeader
        title="Tendances de l'équipe"
        subtitle={teams.team?.name}
        onBack={navigation.goBack}
      />
      {teams.isError ? (
        <ErrorState error={teams.error} onRetry={() => void teams.refetch()} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : teams.isLoading || (teams.team && !data) ? (
        <LoadingOverlay />
      ) : !data ? (
        <EmptyState
          title="Aucune équipe"
          description="Aucune équipe n'est attribuée à votre compte."
        />
      ) : !data.hasEnoughData ? (
        <EmptyState
          title="Résultats masqués"
          description={`Il faut au moins ${data.minResponses} réponses pour afficher les tendances.`}
        />
      ) : (
        <View style={{ padding: 24, gap: 18 }}>
          <Text style={{ color: colors.muted }}>{formatPeriod(data.from, data.to)}</Text>
          <Card>
            <Text style={{ fontFamily: 'Inter-Medium', fontSize: 17 }}>
              Participation collective
            </Text>
            <Text style={{ fontSize: 28, lineHeight: 36, fontFamily: 'Inter-Bold' }}>
              {formatNumber(data.participation?.rate ?? 0)} %
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              {formatNumber(data.participation?.averageDailyResponses ?? 0)} réponses par jour en
              moyenne · {data.totalResponses} réponses sur la période
            </Text>
          </Card>
          <Card>
            <Text style={{ fontFamily: 'Inter-Medium', fontSize: 17 }}>Les humeurs exprimées</Text>
            {data.moods.map((mood) => (
              <View
                key={mood.code}
                style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}
              >
                <Text>{mood.label}</Text>
                <Text style={{ color: colors.muted }}>
                  {mood.count} · {formatNumber(mood.percentage)} %
                </Text>
              </View>
            ))}
          </Card>
          <Card>
            <Text style={{ fontFamily: 'Inter-Medium', fontSize: 17 }}>
              Ce qui influence l'équipe
            </Text>
            {data.tags
              .filter((tag) => tag.count > 0)
              .map((tag) => (
                <View key={tag.code} style={{ gap: 3, paddingVertical: 5 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                    <Text style={{ color: colors.primary, flexShrink: 1, fontSize: 13 }}>
                      {tag.label}
                    </Text>
                    <Text style={{ fontSize: 12 }}>{formatNumber(tag.percentage)} %</Text>
                  </View>
                  <Text style={{ color: colors.muted, fontSize: 11 }}>
                    Score moyen :{' '}
                    {tag.averageScore === null
                      ? 'masqué (seuil de confidentialité)'
                      : `${formatScore(tag.averageScore)}/100`}
                  </Text>
                </View>
              ))}
            {!data.tags.some((t) => t.count > 0) && (
              <Text style={{ color: colors.muted }}>Aucun motif partagé sur cette période.</Text>
            )}
          </Card>
          <Card>
            <Text style={{ fontFamily: 'Inter-Medium', fontSize: 17 }}>Paroles de l'équipe</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              Commentaires reçus sans auteur ni date. Les détails personnels peuvent encore
              permettre d'identifier quelqu'un : gardez ces retours confidentiels.
            </Text>
            {data.comments.map((comment, i) => (
              <View
                key={i}
                style={{ backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 14 }}
              >
                <Text>« {comment} »</Text>
              </View>
            ))}
            {data.comments.length === 0 && (
              <Text style={{ color: colors.muted }}>Aucun commentaire affichable.</Text>
            )}
          </Card>
          <AnonymityBanner threshold={data.minResponses} />
        </View>
      )}
    </ScreenContainer>
  );
}
