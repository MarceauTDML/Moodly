import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { EmployeeStackParamList } from '../../navigation/navigation.types';
import { AppHeader } from '../../components/layout/AppHeader';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { MoodFace } from '../../components/checkin/MoodFace';
import { useMoodOptionsQuery } from '../../store/api/moodsApi';
import { useAppSelector } from '../../store';
import { moodHistory } from '../../services/moodHistory.storage';
import { lastDays, localDate, type HistoryEntry } from '../../utils/moodHistory.util';
import { themedStyles, useAppTheme } from '../../theme/ThemeProvider';

const DAYS = 30;

// Calendrier des 30 derniers jours, lu sur le téléphone : pas de graphe, pas d'appel serveur.
export function MyHistoryScreen({
  navigation,
}: NativeStackScreenProps<EmployeeStackParamList, 'MyHistory'>) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const userId = useAppSelector((s) => s.auth.session?.user.id);
  const options = useMoodOptionsQuery().currentData;
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(() => {
    if (!userId) return;
    void moodHistory
      .read(userId)
      .then(setEntries)
      .catch(() => setEntries([]));
  }, [userId]);
  useFocusEffect(load);

  const byDate = new Map(entries.map((e) => [e.date, e]));
  const days = lastDays(localDate(), DAYS);
  const recent = days.flatMap((d) => byDate.get(d) ?? []);
  const moodLabel = (code: string) => options?.moods.find((m) => m.code === code)?.label ?? code;
  const tagLabel = (code: string) => options?.tags.find((t) => t.code === code)?.label ?? code;
  const tagCounts = new Map<string, number>();
  for (const e of recent) for (const t of e.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  const topTags = [...tagCounts].sort((a, b) => b[1] - a[1]).slice(0, 3);

  const clear = async () => {
    if (userId) await moodHistory.clear(userId).catch(() => undefined);
    setConfirming(false);
    setEntries([]);
  };

  return (
    <ScreenContainer>
      <AppHeader title="Mon historique" onBack={navigation.goBack} />
      <View style={{ padding: 24, gap: 18 }}>
        <Text style={{ color: colors.muted }}>
          Visible uniquement sur ce téléphone. Ton historique n’est jamais envoyé : ni ton manager
          ni Mood Map ne peuvent le consulter.
        </Text>
        {!moodHistory.available ? (
          <Card>
            <Text>
              L’historique personnel est disponible dans l’application mobile. Sur le web, rien
              n’est conservé.
            </Text>
          </Card>
        ) : (
          <>
            <Card>
              <Text style={{ fontFamily: 'Inter-Medium' }}>
                {recent.length} jour{recent.length > 1 ? 's' : ''} partagé
                {recent.length > 1 ? 's' : ''} sur les {DAYS} derniers jours
              </Text>
              <View style={styles.grid}>
                {days.map((day) => {
                  const entry = byDate.get(day);
                  return (
                    <View
                      key={day}
                      style={styles.cell}
                      accessibilityLabel={`${day} : ${entry ? moodLabel(entry.mood) : 'pas de réponse'}`}
                    >
                      {entry ? <MoodFace mood={entry.mood} /> : <View style={styles.empty} />}
                      <Text style={styles.day}>{day.slice(8, 10)}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>
            {topTags.length > 0 && (
              <Card>
                <Text style={{ fontFamily: 'Inter-Medium' }}>Ce qui revient le plus</Text>
                {topTags.map(([code, count]) => (
                  <Text key={code}>
                    {tagLabel(code)} · {count}
                  </Text>
                ))}
              </Card>
            )}
            {entries.length > 0 && (
              <Button
                title="Effacer mon historique"
                secondary
                onPress={() => setConfirming(true)}
              />
            )}
          </>
        )}
      </View>
      <Modal
        visible={confirming}
        title="Effacer mon historique"
        onClose={() => setConfirming(false)}
      >
        <View style={{ gap: 12 }}>
          <Text>
            Ton historique sera effacé de ce téléphone. Tes réponses déjà envoyées restent anonymes
            dans les statistiques de l’équipe.
          </Text>
          <Button title="Effacer" onPress={() => void clear()} />
          <Button title="Annuler" secondary onPress={() => setConfirming(false)} />
        </View>
      </Modal>
    </ScreenContainer>
  );
}
const useStyles = themedStyles((colors) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 },
  cell: { width: `${100 / 6}%`, alignItems: 'center', gap: 2 },
  empty: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.border },
  day: { color: colors.muted, fontSize: 10 },
}));
