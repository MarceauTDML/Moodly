import { prismaMock } from '../__mocks__/prisma.mock';

jest.mock('../../src/config/prisma.config', () => ({ prisma: require('../__mocks__/prisma.mock').prismaMock }));
jest.mock('../../src/services/email.service', () => ({
  emailService: { sendDailyReminder: jest.fn().mockResolvedValue(undefined) },
}));

import { runDailyMoodReminder } from '../../src/jobs/daily-mood-reminder.job';
import { emailService } from '../../src/services/email.service';
import { sendPushNotifications } from '../../src/services/push-notification.service';

const token = (name: string) => `ExponentPushToken[${name}]`;
const user = (name: string, pushToken: string | null, emailNotificationsEnabled = true) => ({
  email: `${name}@entreprise.fr`,
  firstName: name,
  pushToken,
  emailNotificationsEnabled,
});

const mockExpo = (tickets: unknown[]) =>
  jest.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ data: tickets }), { status: 200 }),
  );

afterEach(() => jest.restoreAllMocks());

describe('sendPushNotifications', () => {
  it('classe chaque jeton selon le ticket renvoyé par Expo', async () => {
    mockExpo([
      { status: 'ok' },
      { status: 'error', details: { error: 'DeviceNotRegistered' } },
      { status: 'error', details: { error: 'MessageRateExceeded' } },
    ]);
    const report = await sendPushNotifications(
      ['a', 'b', 'c'].map((n) => ({ to: token(n), title: 'T', body: 'B' })),
    );
    expect(report).toEqual({ delivered: [token('a')], unregistered: [token('b')], failed: [token('c')] });
  });

  it('considère tout le lot en échec si Expo est injoignable', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('réseau'));
    const report = await sendPushNotifications([{ to: token('a'), title: 'T', body: 'B' }]);
    expect(report.failed).toEqual([token('a')]);
  });
});

describe('Rappel quotidien', () => {
  it('envoie un e-mail quand le push échoue et oublie les appareils désinscrits', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      user('lea', token('lea')),
      user('tom', token('tom')),
      user('ines', token('ines')),
      user('hugo', null),
      user('zoe', null, false),
    ]);
    prismaMock.user.updateMany.mockResolvedValue({ count: 1 });
    mockExpo([
      { status: 'ok' },
      { status: 'error', details: { error: 'DeviceNotRegistered' } },
      { status: 'error', details: { error: 'MessageRateExceeded' } },
    ]);

    const result = await runDailyMoodReminder();

    expect(prismaMock.user.updateMany).toHaveBeenCalledWith({
      where: { pushToken: { in: [token('tom')] } },
      data: { pushToken: null },
    });
    const emailed = (emailService.sendDailyReminder as jest.Mock).mock.calls.map((c) => c[1]);
    expect(emailed.sort()).toEqual(['hugo', 'ines', 'tom']);
    expect(result).toMatchObject({ candidates: 5, pushed: 1, unregistered: 1, emailed: 3 });
  });
});
