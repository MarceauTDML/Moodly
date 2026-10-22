import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateApiUrl } from '../src/services/api.config';
import { chartSegments } from '../src/utils/chart.util';
import { formatScore, formatTrend } from '../src/utils/formatters.util';
import { isStrongPassword } from '../src/utils/validators.util';
import { loginSchema, summarySchema } from '../src/services/api.schemas';

test('HTTP est interdit en production, y compris sur localhost', () => {
  assert.throws(() => validateApiUrl('http://localhost:3000/api/v1', false));
  assert.equal(
    validateApiUrl('https://api.example.org/api/v1/', false),
    'https://api.example.org/api/v1',
  );
});
test('HTTP est limité aux vrais hôtes locaux en développement', () => {
  for (const host of ['localhost', '127.0.0.1', '10.0.2.2', '192.168.1.20', '172.16.1.1', '[::1]'])
    assert.ok(validateApiUrl(`http://${host}:3000/api/v1`, true));
  for (const host of [
    'api.example.org',
    '10.attacker.org',
    '192.168.attacker.org',
    '172.15.0.1',
    '172.32.0.1',
    '8.8.8.8',
  ])
    assert.throws(() => validateApiUrl(`http://${host}/api/v1`, true));
});
test('URL vide, identifiants et paramètres sensibles sont refusés', () => {
  for (const url of [
    undefined,
    '',
    'https://secret@api.example.org',
    'https://api.example.org?token=secret',
    'https://api.example.org#secret',
  ])
    assert.throws(() => validateApiUrl(url, true));
});
test('Une réponse masquée coupe le graphique et ne devient jamais zéro', () => {
  const points = [80, null, 60, 55, null, 0].map((score, index) => ({
    score,
    date: `2026-10-${index + 1}`,
    label: `J${index + 1}`,
  }));
  assert.deepEqual(
    chartSegments(points).map((s) => s.map((p) => p.index)),
    [[0], [2, 3], [5]],
  );
  assert.deepEqual(chartSegments(points.map((p) => ({ ...p, score: null }))), []);
  assert.equal(formatScore(null), '—');
  assert.equal(formatScore(0), '0');
  assert.equal(formatTrend(null, 'pts'), '—');
});
test('La validation des mots de passe reprend les règles du backend', () => {
  assert.equal(isStrongPassword('Court1!'), false);
  assert.equal(isStrongPassword('MotDePasse2026!'), true);
  assert.equal(isStrongPassword('motdepasse2026!'), false);
  assert.equal(isStrongPassword('MotDePasse2026'), false);
  assert.equal(isStrongPassword('A1!' + 'x'.repeat(126)), false);
});
test('Le login accepte le contrat réel, refuse un rôle inconnu et retire les champs inattendus', () => {
  const response = {
    message: 'ok',
    token: 'test-token',
    user: { id: 'u1', email: 'test@example.org', role: 'MANAGER' },
    passwordHash: 'must-not-enter-store',
  };
  const parsed = loginSchema.parse(response);
  assert.equal('passwordHash' in parsed, false);
  assert.equal(
    loginSchema.safeParse({ ...response, user: { ...response.user, role: 'ROOT' } }).success,
    false,
  );
  assert.equal(summarySchema.safeParse({ score: 101 }).success, false);
});
