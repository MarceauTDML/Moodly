import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  KEEP_MONTHS,
  decodeMonth,
  encodeMonth,
  localDate,
  monthOf,
  previousMonths,
  upsertEntry,
  type HistoryEntry,
} from '../utils/moodHistory.util';

// Une clé par utilisateur et par mois : deux comptes sur le même téléphone ne se voient pas.
const key = (userId: string, month: string) => `moodly.history.${userId}.${month}`;
const options = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

// Sur le web, rien n'est conservé : même règle que pour les jetons de session.
export const moodHistory = {
  available: Platform.OS !== 'web',
  async record(userId: string, entry: HistoryEntry) {
    if (!moodHistory.available) return;
    const month = monthOf(entry.date);
    const current = decodeMonth(month, await SecureStore.getItemAsync(key(userId, month)));
    await SecureStore.setItemAsync(
      key(userId, month),
      encodeMonth(upsertEntry(current, entry)),
      options,
    );
    // Au-delà de KEEP_MONTHS mois, l'historique est supprimé.
    for (const old of previousMonths(entry.date, KEEP_MONTHS * 2).slice(KEEP_MONTHS))
      await SecureStore.deleteItemAsync(key(userId, old));
  },
  async read(userId: string): Promise<HistoryEntry[]> {
    if (!moodHistory.available) return [];
    const months = previousMonths(localDate(), KEEP_MONTHS).reverse();
    const values = await Promise.all(months.map((m) => SecureStore.getItemAsync(key(userId, m))));
    return months.flatMap((m, i) => decodeMonth(m, values[i] ?? null));
  },
  async clear(userId: string) {
    if (!moodHistory.available) return;
    for (const month of previousMonths(localDate(), KEEP_MONTHS * 2))
      await SecureStore.deleteItemAsync(key(userId, month));
  },
};
