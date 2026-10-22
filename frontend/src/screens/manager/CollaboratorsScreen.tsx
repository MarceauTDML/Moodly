import { useFocusEffect } from '@react-navigation/native';
import { useState, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ManagerSettingsParamList } from '../../navigation/SettingsStack';
import { ManagerPage } from '../../components/layout/ManagerPage';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { AccountStatusBadge } from '../../components/shared/AccountStatusBadge';
import { LoadingOverlay } from '../../components/shared/LoadingOverlay';
import { ErrorState } from '../../components/shared/ErrorState';
import { EmptyState } from '../../components/shared/EmptyState';
import { useCollaboratorsQuery } from '../../store/api/collaboratorsApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
export function CollaboratorsScreen({
  navigation,
}: NativeStackScreenProps<ManagerSettingsParamList, 'Collaborators'>) {
  const query = useCollaboratorsQuery(undefined, { refetchOnMountOrArgChange: true });
  useFocusEffect(
    useCallback(() => {
      void query.refetch();
    }, [query.refetch]),
  );
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING'>('ALL');
  const data = query.currentData ?? [];
  const active = data.filter((u) => u.status === 'ACTIVE').length;
  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('fr');
  const rows = data.filter(
    (u) =>
      (filter === 'ALL' || u.status === filter) &&
      normalize(`${u.firstName} ${u.lastName} ${u.email}`).includes(normalize(search.trim())),
  );
  return (
    <ManagerPage
      backLabel="Paramètres"
      onBack={() => navigation.navigate('SettingsHome')}
      onRefresh={() => void query.refetch()}
      refreshing={query.isFetching}
    >
      <View style={{ gap: 9 }}>
        <Text accessibilityRole="header" style={typography.title}>
          Collaborateurs
        </Text>
        <Text style={{ color: colors.muted, fontSize: 13 }}>
          {data.length} inscrits · {active} actifs · {data.length - active} en attente d’activation
        </Text>
      </View>
      <Button
        title="＋  Ajouter un collaborateur"
        onPress={() => navigation.navigate('CollaboratorForm')}
      />
      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : !query.currentData ? (
        <LoadingOverlay />
      ) : (
        <>
          <Input
            label="Rechercher"
            placeholder="Rechercher un nom ou un e-mail"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            maxLength={254}
          />
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {(
              [
                { key: 'ALL', label: 'Tous', count: data.length },
                { key: 'ACTIVE', label: 'Actifs', count: active },
                { key: 'PENDING', label: 'En attente', count: data.length - active },
              ] as const
            ).map((item) => (
              <Pressable
                key={item.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: filter === item.key }}
                onPress={() => setFilter(item.key)}
                style={{
                  flex: 1,
                  minHeight: 38,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 22,
                  backgroundColor: filter === item.key ? '#24275D' : '#ECE7F7',
                }}
              >
                <Text style={{ fontSize: 11, color: filter === item.key ? '#FFF' : colors.text }}>
                  {item.label} · {item.count}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12 }}>{rows.length} collaborateurs</Text>
            <Text style={typography.small}>Prénom A–Z</Text>
          </View>
          {rows.length === 0 ? (
            <EmptyState
              title={data.length === 0 ? 'Votre équipe commence ici' : 'Aucun résultat'}
              description={
                data.length === 0
                  ? 'Ajoutez un collaborateur pour lui permettre de rejoindre Mood Map.'
                  : 'Essayez un autre nom ou changez le filtre.'
              }
            />
          ) : (
            <View style={{ gap: 10 }}>
              {rows.map((u, i) => (
                <Pressable
                  key={u.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Ouvrir la fiche de ${u.firstName} ${u.lastName}`}
                  onPress={() => navigation.navigate('CollaboratorDetail', { userId: u.id })}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 16,
                    borderRadius: 22,
                    backgroundColor: colors.input,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: ['#DFE9F5', '#E3DAF5', '#F5E2D8', '#E6F0E8'][i % 4],
                    }}
                  >
                    <Text style={{ fontSize: 17 }}>
                      {u.firstName.slice(0, 1)}
                      {u.lastName.slice(0, 1)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text style={{ fontSize: 15, fontFamily: 'Inter-Medium' }}>
                      {u.firstName} {u.lastName}
                    </Text>
                    <AccountStatusBadge status={u.status} />
                  </View>
                  <Icon name="chevron" size={18} color={colors.muted} />
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}
    </ManagerPage>
  );
}
