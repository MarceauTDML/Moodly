import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  decodeMonth,
  encodeMonth,
  lastDays,
  previousMonths,
  upsertEntry,
  type HistoryEntry,
} from '../src/utils/moodHistory.util';

test('L’historique d’un mois complet tient dans une valeur SecureStore', () => {
  const month: HistoryEntry[] = Array.from({ length: 31 }, (_, i) => ({
    date: `2026-10-${String(i + 1).padStart(2, '0')}`,
    mood: 'STRESSE',
    tags: [
      'CHARGE_DE_TRAVAIL',
      'CLARTE_DES_MISSIONS',
      'AMBIANCE_EQUIPE',
      'OUTILS_MATERIEL',
      'SOUTIEN_MANAGER',
      'RECONNAISSANCE',
    ],
  }));
  const raw = encodeMonth(month);
  assert.ok(raw.length < 2048, `${raw.length} octets`);
  assert.deepEqual(decodeMonth('2026-10', raw), month);
});

test('Une donnée illisible ou inconnue est ignorée sans erreur', () => {
  assert.deepEqual(decodeMonth('2026-10', 'pas du json'), []);
  assert.deepEqual(decodeMonth('2026-10', JSON.stringify(['12|9|', 42, 'x|1|'])), []);
  assert.deepEqual(decodeMonth('2026-10', JSON.stringify(['05|1|0,99'])), [
    { date: '2026-10-05', mood: 'BIEN', tags: ['CHARGE_DE_TRAVAIL'] },
  ]);
});

test('Une seule humeur par jour, triée par date', () => {
  const first = upsertEntry([], { date: '2026-10-22', mood: 'BIEN', tags: [] });
  const both = upsertEntry(first, { date: '2026-10-21', mood: 'MOYEN', tags: [] });
  const replaced = upsertEntry(both, { date: '2026-10-22', mood: 'EPANOUI', tags: [] });
  assert.deepEqual(
    replaced.map((e) => [e.date, e.mood]),
    [
      ['2026-10-21', 'MOYEN'],
      ['2026-10-22', 'EPANOUI'],
    ],
  );
});

test('Les mois et les jours sont calculés sans erreur de fuseau ni de changement d’année', () => {
  assert.deepEqual(previousMonths('2026-01-15', 3), ['2026-01', '2025-12', '2025-11']);
  const days = lastDays('2026-03-01', 30);
  assert.equal(days.length, 30);
  assert.equal(days[0], '2026-01-31');
  assert.equal(days[29], '2026-03-01');
});
