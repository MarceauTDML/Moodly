import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { env } from '../config/env.config';

// Chiffrement AES-256-GCM des secrets de double authentification : une copie de la base
// ne suffit pas à générer les codes d'un utilisateur.
const key = () =>
  createHash('sha256')
    .update(env.TWO_FACTOR_SECRET_KEY ?? `${env.JWT_REFRESH_SECRET}:two-factor`)
    .digest();

export const sealSecret = (plain: string): string => {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return ['v1', iv, cipher.getAuthTag(), encrypted].map((p) => (typeof p === 'string' ? p : p.toString('base64url'))).join('.');
};

export const openSecret = (sealed: string): string => {
  const [version, iv, tag, encrypted] = sealed.split('.');
  if (version !== 'v1' || !iv || !tag || !encrypted) throw new Error('Secret chiffré invalide');
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]).toString('utf8');
};
