import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/prisma.config';
import { emailService } from '../../src/services/email.service';
import { currentStep, totpAt } from '../../src/services/totp.service';
import { createCompany, createUser, PASSWORD, resetDatabase } from './helpers/factories';

const app = createApp();

beforeEach(resetDatabase);
afterEach(() => jest.restoreAllMocks());
afterAll(() => prisma.$disconnect());

const loginRaw = (email: string) => request(app).post('/api/v1/auth/login').send({ email, password: PASSWORD });

const signedUser = async () => {
  const company = await createCompany();
  const user = await createUser(company.id);
  const res = await loginRaw(user.email);
  return { user, auth: { Authorization: `Bearer ${res.body.data.token}` } };
};

const captureEmailCodes = () => {
  const codes: string[] = [];
  jest.spyOn(emailService, 'sendTwoFactorCode').mockImplementation(async (_to, _name, code) => {
    codes.push(code);
  });
  return codes;
};

describe('Double authentification par application', () => {
  it('s’active avec un premier code, puis protège la connexion', async () => {
    const { user, auth } = await signedUser();

    const setup = await request(app).post('/api/v1/users/me/2fa/setup').set(auth).send({ method: 'TOTP' }).expect(200);
    const { secret, otpauthUrl } = setup.body.data;
    expect(otpauthUrl).toContain(`secret=${secret}`);
    // Le secret est chiffré en base.
    const stored = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(stored.twoFactorPendingSecret).not.toContain(secret);

    const step = currentStep();
    const confirm = await request(app)
      .post('/api/v1/users/me/2fa/confirm')
      .set(auth)
      .send({ code: totpAt(secret, step) })
      .expect(200);
    const { recoveryCodes } = confirm.body.data;
    expect(recoveryCodes).toHaveLength(8);

    const login = await loginRaw(user.email).expect(200);
    expect(login.body.data).toMatchObject({ twoFactorRequired: true, method: 'TOTP' });
    expect(login.body.data.token).toBeUndefined();
    const { challengeToken } = login.body.data;

    // Le code déjà utilisé pour l'activation ne peut pas être rejoué.
    await request(app).post('/api/v1/auth/2fa/verify').send({ challengeToken, code: totpAt(secret, step) }).expect(400);

    const verified = await request(app)
      .post('/api/v1/auth/2fa/verify')
      .send({ challengeToken, code: totpAt(secret, step + 1) })
      .expect(200);
    expect(verified.body.data).toMatchObject({ token: expect.any(String), refreshToken: expect.any(String) });

    // Un code de secours fonctionne une seule fois.
    await request(app).post('/api/v1/auth/2fa/verify').send({ challengeToken, code: recoveryCodes[0] }).expect(200);
    await request(app).post('/api/v1/auth/2fa/verify').send({ challengeToken, code: recoveryCodes[0] }).expect(400);
    const status = await request(app).get('/api/v1/users/me/2fa').set(auth).expect(200);
    expect(status.body.data).toEqual({ method: 'TOTP', recoveryCodesLeft: 7 });
  });

  it('bloque la vérification après 5 codes incorrects', async () => {
    const { user, auth } = await signedUser();
    const setup = await request(app).post('/api/v1/users/me/2fa/setup').set(auth).send({ method: 'TOTP' });
    const { secret } = setup.body.data;
    await request(app).post('/api/v1/users/me/2fa/confirm').set(auth).send({ code: totpAt(secret, currentStep() - 1) }).expect(200);
    const { challengeToken } = (await loginRaw(user.email)).body.data;

    for (let i = 0; i < 5; i += 1)
      await request(app).post('/api/v1/auth/2fa/verify').send({ challengeToken, code: '000000' }).expect(400);

    const locked = await request(app)
      .post('/api/v1/auth/2fa/verify')
      .send({ challengeToken, code: totpAt(secret, currentStep()) });
    expect(locked.status).toBe(429);
    expect(locked.body.error.code).toBe('TWO_FACTOR_LOCKED');
  });
});

describe('Double authentification par e-mail', () => {
  it('envoie un code à l’activation puis à chaque connexion', async () => {
    const codes = captureEmailCodes();
    const { user, auth } = await signedUser();

    const setup = await request(app).post('/api/v1/users/me/2fa/setup').set(auth).send({ method: 'EMAIL' }).expect(200);
    expect(setup.body.data.email).toMatch(/^u•••@/);
    await request(app).post('/api/v1/users/me/2fa/confirm').set(auth).send({ code: codes[0] }).expect(200);

    const login = await loginRaw(user.email).expect(200);
    expect(login.body.data).toMatchObject({ twoFactorRequired: true, method: 'EMAIL' });
    expect(codes).toHaveLength(2);

    // Renvoyer un code invalide le précédent.
    await request(app).post('/api/v1/auth/2fa/resend').send({ challengeToken: login.body.data.challengeToken }).expect(200);
    await request(app)
      .post('/api/v1/auth/2fa/verify')
      .send({ challengeToken: login.body.data.challengeToken, code: codes[1] })
      .expect(400);
    await request(app)
      .post('/api/v1/auth/2fa/verify')
      .send({ challengeToken: login.body.data.challengeToken, code: codes[2] })
      .expect(200);
  });
});

describe('Désactivation', () => {
  it('exige le mot de passe, puis la connexion redevient directe', async () => {
    const codes = captureEmailCodes();
    const { user, auth } = await signedUser();
    await request(app).post('/api/v1/users/me/2fa/setup').set(auth).send({ method: 'EMAIL' });
    await request(app).post('/api/v1/users/me/2fa/confirm').set(auth).send({ code: codes[0] }).expect(200);

    await request(app).delete('/api/v1/users/me/2fa').set(auth).send({ password: 'mauvais' }).expect(400);
    await request(app).delete('/api/v1/users/me/2fa').set(auth).send({ password: PASSWORD }).expect(204);

    const login = await loginRaw(user.email).expect(200);
    expect(login.body.data.token).toEqual(expect.any(String));
  });
});
