import argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';

export const hashPassword = (password: string): Promise<string> => argon2.hash(password);

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
};

export const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

export const randomToken = (bytes = 32): string => randomBytes(bytes).toString('hex');
