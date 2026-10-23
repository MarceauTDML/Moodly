import assert from 'node:assert/strict';
import { test } from 'node:test';
import { suggestsSupport } from '../src/utils/support.util';
import type { HistoryEntry } from '../src/utils/moodHistory.util';
import { moodOptionsSchema } from '../src/services/checkin.schemas';

const entries = (moods: HistoryEntry['mood'][], lastDate = '2026-10-23'): HistoryEntry[] => {
  const end = new Date(`${lastDate}T00:00:00.000Z`).getTime();
  return moods.map((mood, i) => ({
    date: new Date(end - (moods.length - 1 - i) * 86_400_000).toISOString().slice(0, 10),
    mood,
    tags: [],
  }));
};

test('Trois votes « Stressé » sur les cinq derniers proposent les ressources d’aide', () => {
  assert.equal(
    suggestsSupport(entries(['BIEN', 'STRESSE', 'MOYEN', 'STRESSE', 'STRESSE']), '2026-10-23'),
    true,
  );
});

test('Deux votes difficiles ou des votes anciens ne déclenchent rien', () => {
  assert.equal(
    suggestsSupport(entries(['STRESSE', 'BIEN', 'BIEN', 'MOYEN', 'STRESSE']), '2026-10-23'),
    false,
  );
  assert.equal(
    suggestsSupport(entries(['STRESSE', 'STRESSE', 'STRESSE'], '2026-09-01'), '2026-10-23'),
    false,
  );
  // Seuls les cinq derniers votes comptent.
  assert.equal(
    suggestsSupport(
      entries(['STRESSE', 'STRESSE', 'STRESSE', 'BIEN', 'BIEN', 'BIEN', 'MOYEN', 'BIEN']),
      '2026-10-23',
    ),
    false,
  );
});

test('Un serveur sans contacts d’aide reste compatible', () => {
  const options = moodOptionsSchema.parse({
    question: 'Q',
    tagsQuestion: 'T',
    commentPlaceholder: '',
    moods: ['EPANOUI', 'BIEN', 'MOYEN', 'STRESSE'].map((code, i) => ({
      code,
      label: code,
      score: i * 25,
    })),
    tags: [],
  });
  assert.deepEqual(options.supportResources, []);
});
