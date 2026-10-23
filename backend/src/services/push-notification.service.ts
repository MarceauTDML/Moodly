import { logger } from '../config/logger.config';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const BATCH_SIZE = 100;

export interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// Résultat par jeton : delivered (accepté par Expo), unregistered (appareil désinscrit,
// jeton à oublier) ou failed (erreur ponctuelle : prévenir par un autre canal).
export interface PushReport {
  delivered: string[];
  unregistered: string[];
  failed: string[];
}

interface PushTicket {
  status: 'ok' | 'error';
  details?: { error?: string };
}

export const isExpoPushToken = (token: string): boolean => /^Expo(nent)?PushToken\[[^\]]+\]$/.test(token);

export const sendPushNotifications = async (messages: PushMessage[]): Promise<PushReport> => {
  const report: PushReport = { delivered: [], unregistered: [], failed: [] };
  const valid = messages.filter((m) => isExpoPushToken(m.to));
  report.failed.push(...messages.filter((m) => !isExpoPushToken(m.to)).map((m) => m.to));

  for (let i = 0; i < valid.length; i += BATCH_SIZE) {
    const batch = valid.slice(i, i + BATCH_SIZE);
    let tickets: PushTicket[] = [];
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(batch.map((m) => ({ ...m, sound: 'default' }))),
      });
      if (res.ok) tickets = ((await res.json()) as { data?: PushTicket[] }).data ?? [];
      else logger.warn({ status: res.status }, 'Expo push : réponse en erreur');
    } catch (err) {
      logger.error({ err }, 'Expo push : envoi impossible');
    }
    // Expo renvoie un ticket par message, dans le même ordre.
    batch.forEach((message, index) => {
      const ticket = tickets[index];
      if (ticket?.status === 'ok') report.delivered.push(message.to);
      else if (ticket?.details?.error === 'DeviceNotRegistered') report.unregistered.push(message.to);
      else report.failed.push(message.to);
    });
  }
  return report;
};
