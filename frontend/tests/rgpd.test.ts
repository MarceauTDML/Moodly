import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import { requestApi } from '../src/services/api.client';
import { personalDataSchema } from '../src/services/api.schemas';
process.env.EXPO_PUBLIC_API_URL = 'https://api.example.org/api/v1';

test('La suppression du compte envoie le mot de passe et accepte une réponse vide', async () => {
  const stub = mock.method(
    globalThis,
    'fetch',
    async (_input: string | URL | Request, init?: RequestInit) => {
      assert.equal(init?.method, 'DELETE');
      assert.equal(init?.body, JSON.stringify({ password: 'secret' }));
      return new Response(null, { status: 204 });
    },
  );
  try {
    const result = await requestApi('/users/me', {
      method: 'DELETE',
      body: { password: 'secret' },
      token: 't',
    });
    assert.equal(result, undefined);
  } finally {
    stub.mock.restore();
  }
});
test('L’export conserve tous les champs renvoyés par le serveur', () => {
  const data = personalDataSchema.parse({
    exportedAt: '2026-10-23T10:00:00.000Z',
    account: { email: 'lea@entreprise.fr', firstName: 'Léa' },
    participationDays: ['2026-10-22'],
  });
  assert.deepEqual(data.participationDays, ['2026-10-22']);
  assert.equal(data.account.firstName, 'Léa');
});
