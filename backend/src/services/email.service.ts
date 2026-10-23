import { readFileSync } from 'node:fs';
import path from 'node:path';
import { env, isProd } from '../config/env.config';
import { logger } from '../config/logger.config';
import { isMailerConfigured, mailFrom, mailTransport } from '../config/mailer.config';

type TemplateName = 'invitation' | 'welcome' | 'reset-password' | 'daily-reminder' | 'two-factor-code';

const TEMPLATE_DIR = path.join(__dirname, '..', 'templates', 'emails');
const cache = new Map<TemplateName, string>();

const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

const render = (name: TemplateName, vars: Record<string, string>): string => {
  if (!cache.has(name))
    cache.set(name, readFileSync(path.join(TEMPLATE_DIR, `${name}.html`), 'utf8'));
  return cache
    .get(name)!
    .replace(/{{\s*(\w+)\s*}}/g, (_, key: string) => escapeHtml(vars[key] ?? ''));
};

const send = async (to: string, subject: string, html: string, strict = false): Promise<void> => {
  try {
    const info = await mailTransport.sendMail({
      from: mailFrom,
      to,
      subject,
      html,
    });
    if (!isMailerConfigured)
      logger.info({ to, subject }, 'E-mail (SMTP non configuré, non envoyé)');
    else logger.debug({ to, subject, messageId: info.messageId }, 'E-mail envoyé');
  } catch (err) {
    logger.error({ err, to, subject }, "Échec de l'envoi de l'e-mail");
    if (strict) throw new Error('MAIL_DELIVERY_FAILED');
  }
};

export const appLink = (route: string, params: Record<string, string> = {}) => {
  const query = new URLSearchParams(params).toString();
  return `${env.APP_URL.replace(/\/$/, '')}/${route}${query ? `?${query}` : ''}`;
};

export const emailService = {
  sendInvitation: (to: string, firstName: string, token: string) =>
    send(
      to,
      'Activez votre compte Mood Map',
      render('invitation', {
        firstName,
        link: appLink('activate-account', { token }),
      }),
      true,
    ),
  // Le compte est activé par le collaborateur lui-même via POST /auth/register
  sendWelcome: (to: string, firstName: string) =>
    send(
      to,
      'Bienvenue sur Mood Map',
      render('welcome', {
        firstName,
        link: appLink('register', { email: to }),
      }),
    ),

  sendResetPassword: (to: string, firstName: string, token: string) =>
    send(
      to,
      'Réinitialisation de votre mot de passe Mood Map',
      render('reset-password', {
        firstName,
        link: appLink('reset-password', { token }),
        ttl: String(env.RESET_TOKEN_TTL_MINUTES),
      }),
    ),

  sendTwoFactorCode: async (to: string, firstName: string, code: string) => {
    // En développement sans SMTP, le code n'est jamais reçu : il est affiché dans les logs.
    if (!isMailerConfigured && !isProd)
      logger.warn({ to, code }, 'Code de vérification (développement, SMTP non configuré)');
    await send(to, `Votre code Mood Map : ${code}`, render('two-factor-code', { firstName, code }), true);
  },

  sendDailyReminder: (to: string, firstName: string) =>
    send(
      to,
      'Comment s’est passée ta journée ?',
      render('daily-reminder', { firstName, link: appLink('checkin') }),
    ),
};
