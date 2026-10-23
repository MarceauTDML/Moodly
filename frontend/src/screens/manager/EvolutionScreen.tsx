import { useState } from 'react';
import { View, Pressable, StatusBar } from 'react-native';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useEvolutionQuery } from '../../store/api/moodmapApi';
import { useTeam } from '../../hooks/useTeam';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AppHeader } from '../../components/layout/AppHeader';
import { TeamPicker } from '../../components/shared/TeamPicker';
import { ErrorState } from '../../components/shared/ErrorState';
import { EmptyState } from '../../components/shared/EmptyState';
import { LoadingOverlay } from '../../components/shared/LoadingOverlay';
import { AnonymityBanner } from '../../components/shared/AnonymityBanner';
import { CollectiveMoodChart } from '../../components/moodmap/CollectiveMoodChart';
import { Card } from '../../components/ui/Card';
import { Text } from '../../components/ui/Text';
import type { Granularity } from '../../types/mood.types';
import { formatScore, formatTrend } from '../../utils/formatters.util';
import { formatPeriod } from '../../utils/date.util';
import { useAppTheme } from '../../theme/ThemeProvider';
export function EvolutionScreen() {
  const { colors, statusBarStyle } = useAppTheme();
  const teams = useTeam();
  const [granularity, setGranularity] = useState<Granularity>('day');
  const query = useEvolutionQuery(teams.team ? { teamId: teams.team.id, granularity } : skipToken);
  const data = query.currentData;
  const choices: { key: Granularity; label: string; caption: string }[] = [
    { key: 'day', label: '30 jours', caption: '30 derniers jours' },
    { key: 'week', label: '12 semaines', caption: '12 dernières semaines' },
    { key: 'month', label: '12 mois', caption: '12 derniers mois' },
  ];
  return (
    <ScreenContainer
      onRefresh={teams.team ? () => void query.refetch() : undefined}
      refreshing={query.isFetching && Boolean(data)}
    >
      <StatusBar barStyle={statusBarStyle} />
      <AppHeader title="Évolution" subtitle="Prendre du recul, ensemble" />
      <TeamPicker />
      <View
        style={{
          flexDirection: 'row',
          gap: 6,
          margin: 24,
          padding: 5,
          backgroundColor: colors.primarySoft,
          borderRadius: 14,
        }}
      >
        {choices.map((choice) => (
          <Pressable
            key={choice.key}
            accessibilityRole="button"
            accessibilityState={{ selected: granularity === choice.key }}
            onPress={() => setGranularity(choice.key)}
            style={{
              flex: 1,
              minHeight: 42,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              backgroundColor: granularity === choice.key ? colors.surface : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: granularity === choice.key ? colors.primary : colors.muted,
              }}
            >
              {choice.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {teams.isError ? (
        <ErrorState error={teams.error} onRetry={() => void teams.refetch()} />
      ) : teams.isLoading ? (
        <LoadingOverlay />
      ) : !teams.team ? (
        <EmptyState
          title="Aucune équipe attribuée"
          description="Votre administrateur peut vous attribuer une équipe."
        />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : !data ? (
        <LoadingOverlay />
      ) : (
        <>
          <Card style={{ marginHorizontal: 24 }}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Score moyen sur la période</Text>
            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 34, lineHeight: 43 }}>
              {formatScore(data.overall.averageScore)}
              <Text style={{ fontSize: 14, color: colors.muted }}> /100</Text>
            </Text>
            <Text
              style={{
                color: (data.comparison?.points ?? 0) >= 0 ? colors.success : colors.danger,
              }}
            >
              {formatTrend(data.comparison?.points ?? null, 'pts')} par rapport à la période
              précédente
            </Text>
          </Card>
          <CollectiveMoodChart
            key={`${teams.team.id}-${granularity}`}
            points={data.series.map((bucket) => ({
              date: bucket.from,
              label: bucket.label,
              score: bucket.averageScore,
            }))}
            zones={data.zones}
            caption={choices.find((c) => c.key === granularity)?.caption}
          />
          <View style={{ gap: 16, paddingHorizontal: 24 }}>
            {data.best && (
              <Card>
                <Text style={{ fontFamily: 'Inter-Medium' }}>
                  Meilleure période · {formatScore(data.best.averageScore)}/100
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {formatPeriod(data.best.from, data.best.to)}
                </Text>
              </Card>
            )}
            {data.worst && (
              <Card>
                <Text style={{ fontFamily: 'Inter-Medium' }}>
                  Période à accompagner · {formatScore(data.worst.averageScore)}/100
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {formatPeriod(data.worst.from, data.worst.to)}
                </Text>
              </Card>
            )}
          </View>
          {!data.best && (
            <EmptyState
              title="Pas encore assez de réponses"
              description="Les périodes sans données suffisantes restent masquées."
            />
          )}
          <AnonymityBanner />
        </>
      )}
    </ScreenContainer>
  );
}
