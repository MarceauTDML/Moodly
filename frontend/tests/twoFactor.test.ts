import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loginResultSchema, twoFactorSetupSchema } from '../src/services/api.schemas';

test('La connexion distingue une session ouverte d’un code encore attendu', () => {
  const session = loginResultSchema.parse({
    message: 'Connexion réussie',
    token: 't',
    refreshToken: 'r',
    user: { id: 'u1', email: 'lea@entreprise.fr', role: 'COLLABORATEUR' },
  });
  assert.equal('twoFactorRequired' in session, false);

  const challenge = loginResultSchema.parse({
    message: 'Code de vérification requis',
    twoFactorRequired: true,
    method: 'EMAIL',
    challengeToken: 'c',
    email: 'l•••@entreprise.fr',
  });
  assert.ok('twoFactorRequired' in challenge);
  // Aucun jeton de session n'est accepté tant que le code n'est pas validé.
  assert.equal('token' in challenge, false);
});

test('Une méthode inconnue ou une réponse incomplète est refusée', () => {
  assert.equal(
    loginResultSchema.safeParse({
      message: 'x',
      twoFactorRequired: true,
      method: 'SMS',
      challengeToken: 'c',
    }).success,
    false,
  );
  assert.equal(twoFactorSetupSchema.safeParse({ method: 'TOTP', secret: 'COURT' }).success, false);
});
