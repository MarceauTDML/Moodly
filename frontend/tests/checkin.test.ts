import assert from 'node:assert/strict';
import { test } from 'node:test';
import { accessSpace } from '../src/utils/access.util';
import {
  moodOptionsSchema,
  todayCheckinSchema,
  moodSubmissionSchema,
  submitMoodInputSchema,
} from '../src/services/checkin.schemas';

const teamId = '33333333-3333-4333-8333-333333333333';
test('Le rôle serveur oriente vers le bon espace et refuse un rôle absent', () => {
  assert.equal(accessSpace('COLLABORATEUR'), 'employee');
  assert.equal(accessSpace('MANAGER'), 'manager');
  assert.equal(accessSpace('ADMIN'), 'manager');
  assert.equal(accessSpace(undefined), null);
});
test('La saisie accepte quatre humeurs et rend les catégories/commentaires facultatifs', () => {
  for (const mood of ['EPANOUI', 'BIEN', 'MOYEN', 'STRESSE']) {
    assert.ok(submitMoodInputSchema.safeParse({ mood, tags: [] }).success);
  }
  assert.equal(submitMoodInputSchema.safeParse({ mood: 'INCONNU', tags: [] }).success, false);
  const parsed = submitMoodInputSchema.parse({
    mood: 'BIEN',
    teamId,
    tags: ['AMBIANCE_EQUIPE', 'AMBIANCE_EQUIPE'],
    comment: '  Bonne journée  ',
    userId: 'must-not-be-sent',
  });
  assert.deepEqual(parsed.tags, ['AMBIANCE_EQUIPE']);
  assert.equal(parsed.comment, 'Bonne journée');
  assert.equal('userId' in parsed, false);
});
test('Les limites et identifiants de la saisie suivent le contrat backend', () => {
  const input = { mood: 'BIEN', tags: [] };
  assert.ok(submitMoodInputSchema.safeParse({ ...input, comment: 'x'.repeat(500) }).success);
  assert.equal(
    submitMoodInputSchema.safeParse({ ...input, comment: 'x'.repeat(501) }).success,
    false,
  );
  assert.equal(submitMoodInputSchema.safeParse({ ...input, tags: ['UNKNOWN'] }).success, false);
  assert.equal(submitMoodInputSchema.safeParse({ ...input, teamId: 'other' }).success, false);
  assert.equal(submitMoodInputSchema.parse({ ...input, comment: '   ' }).comment, undefined);
});
test('Le statut du jour et le reçu ne laissent pas entrer un mood individuel dans le cache', () => {
  const status = todayCheckinSchema.parse({
    date: '2026-10-21',
    hasSubmittedToday: true,
    canSubmit: false,
    requiresTeamChoice: false,
    teams: [{ id: teamId, name: 'Produit' }],
    mood: 'STRESSE',
    comment: 'private',
  });
  assert.equal('mood' in status, false);
  assert.equal('comment' in status, false);
  assert.deepEqual(
    moodSubmissionSchema.parse({
      date: '2026-10-21',
      title: 'Envoyé',
      message: 'Merci',
      entryId: 'private',
    }),
    { date: '2026-10-21', title: 'Envoyé', message: 'Merci' },
  );
  assert.equal(todayCheckinSchema.safeParse({ ...status, date: '2026-99-99' }).success, false);
});
test('Les options inconnues et les réponses incomplètes sont refusées', () => {
  assert.equal(moodOptionsSchema.safeParse({ question: 'Test', moods: [] }).success, false);
  assert.equal(moodSubmissionSchema.safeParse({ title: 'ok' }).success, false);
});
