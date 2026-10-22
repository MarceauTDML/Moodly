import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import { z } from 'zod';
import { requestApi, ApiRequestError } from '../src/services/api.client';
process.env.EXPO_PUBLIC_API_URL = 'https://api.example.org/api/v1';

test('Le client transmet le token en en-tête et extrait le contrat success/data', async () => {
  const stub = mock.method(
    globalThis,
    'fetch',
    async (_input: string | URL | Request, init?: RequestInit) => {
      assert.equal(init?.credentials, 'omit');
      assert.equal(init?.redirect, 'error');
      assert.deepEqual(init?.headers, {
        Accept: 'application/json',
        Authorization: 'Bearer session-test',
      });
      return new Response(JSON.stringify({ success: true, data: { score: 58 } }), { status: 200 });
    },
  );
  try {
    assert.deepEqual(
      await requestApi('/moodmap/summary', {
        token: 'session-test',
        schema: z.object({ score: z.number() }),
      }),
      { score: 58 },
    );
  } finally {
    stub.mock.restore();
  }
});
test('Les erreurs serveur internes ne sont pas affichées à l’utilisateur', async () => {
  const stub = mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response(
        JSON.stringify({
          error: { message: 'postgres://secret/password', code: 'INTERNAL_ERROR' },
        }),
        { status: 500 },
      ),
  );
  try {
    await assert.rejects(
      requestApi('/users/me'),
      (e: unknown) =>
        e instanceof ApiRequestError && e.failure.status === 500 && !e.message.includes('secret'),
    );
  } finally {
    stub.mock.restore();
  }
});
test('Un contrat inattendu produit une erreur plutôt que de faux résultats', async () => {
  const stub = mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response(JSON.stringify({ success: true, data: { score: 'wrong' } }), { status: 200 }),
  );
  try {
    await assert.rejects(
      requestApi('/moodmap/summary', { schema: z.object({ score: z.number().nullable() }) }),
      (e: unknown) => e instanceof ApiRequestError && e.failure.status === 'INVALID_RESPONSE',
    );
  } finally {
    stub.mock.restore();
  }
});
test('Le client accepte le contrat direct utilisé par la connexion', async () => {
  const stub = mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response(JSON.stringify({ message: 'ok', token: 'test-token' }), { status: 200 }),
  );
  try {
    const data = await requestApi('/auth/login', { schema: z.object({ token: z.string() }) });
    assert.deepEqual(data, { token: 'test-token' });
  } finally {
    stub.mock.restore();
  }
});
