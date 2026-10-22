import { logger } from '../config/logger.config';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const BATCH_SIZE = 100;

export interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export const isExpoPushToken = (token: string): boolean => /^Expo(nent)?PushToken\[[^\]]+\]$/.test(token);

export const sendPushNotifications = async (messages: PushMessage[]): Promise<number> => {
  const valid = messages.filter((m) => isExpoPushToken(m.to));
  let accepted = 0;

  for (let i = 0; i < valid.length; i += BATCH_SIZE) {
    const batch = valid.slice(i, i + BATCH_SIZE).map((m) => ({ ...m, sound: 'default' }));
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });
      if (!res.ok) {
        logger.warn({ status: res.status }, 'Expo push : réponse en erreur');
        continue;
      }
      const json = (await res.json()) as { data?: { status: string }[] };
      accepted += json.data?.filter((t) => t.status === 'ok').length ?? 0;
    } catch (err) {
      logger.error({ err }, 'Expo push : envoi impossible');
    }
  }
  return accepted;
};
