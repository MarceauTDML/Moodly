import nodemailer from 'nodemailer';
import { env } from './env.config';

export const mailTransport = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    })
  : nodemailer.createTransport({ jsonTransport: true });

export const isMailerConfigured = Boolean(env.SMTP_HOST);
export const mailFrom = env.MAIL_FROM;
