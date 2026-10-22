import assert from 'node:assert/strict';
import { test } from 'node:test';
import reducer, {
  bootstrapFailed,
  bootstrapRetried,
  signedOut,
} from '../src/store/slices/authSlice';

test('Une erreur réseau au démarrage propose de réessayer sans perdre la tentative', () => {
  const initial = reducer(undefined, { type: 'init' });
  const failed = reducer(initial, bootstrapFailed('Connexion impossible.'));
  assert.equal(failed.bootstrapping, false);
  assert.equal(failed.bootstrapError, 'Connexion impossible.');
  const retried = reducer(failed, bootstrapRetried());
  assert.equal(retried.bootstrapping, true);
  assert.equal(retried.bootstrapError, null);
  assert.equal(retried.bootstrapAttempt, initial.bootstrapAttempt + 1);
});
test('Choisir un autre compte quitte l’écran d’erreur', () => {
  const failed = reducer(undefined, bootstrapFailed('Connexion impossible.'));
  const out = reducer(failed, signedOut());
  assert.equal(out.bootstrapError, null);
  assert.equal(out.session, null);
});
