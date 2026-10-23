import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// Codes à usage unique basés sur le temps (RFC 6238), compatibles avec Google Authenticator,
// Microsoft Authenticator, 1Password, etc. Aucune dépendance externe.
const STEP_SECONDS = 30;
const DIGITS = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export const base32Encode = (buffer: Buffer): string => {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31];
  return output;
};

export const base32Decode = (input: string): Buffer => {
  const clean = input.toUpperCase().replace(/[\s=]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const index = ALPHABET.indexOf(char);
    if (index === -1) throw new Error('Secret base32 invalide');
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
};

// 160 bits, la taille recommandée par la RFC 4226.
export const generateTotpSecret = () => base32Encode(randomBytes(20));

export const currentStep = (now = Date.now()) => Math.floor(now / 1000 / STEP_SECONDS);

export const totpAt = (secret: string, step: number, digits = DIGITS): string => {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const hmac = createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const offset = hmac[hmac.length - 1]! & 0x0f;
  const binary = hmac.readUInt32BE(offset) & 0x7fffffff;
  return String(binary % 10 ** digits).padStart(digits, '0');
};

// Accepte le code de la période courante et des périodes voisines (décalage d'horloge),
// mais jamais une période déjà utilisée : un code intercepté ne peut pas être rejoué.
export const verifyTotp = (
  secret: string,
  code: string,
  lastUsedStep: number | null,
  now = Date.now(),
): number | null => {
  const step = currentStep(now);
  for (const candidate of [step - 1, step, step + 1]) {
    if (lastUsedStep !== null && candidate <= lastUsedStep) continue;
    const expected = Buffer.from(totpAt(secret, candidate));
    const given = Buffer.from(code);
    if (given.length === expected.length && timingSafeEqual(given, expected)) return candidate;
  }
  return null;
};

export const otpauthUrl = (secret: string, account: string, issuer = 'Mood Map') =>
  `otpauth://totp/${encodeURIComponent(`${issuer}:${account}`)}?${new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  }).toString()}`;
