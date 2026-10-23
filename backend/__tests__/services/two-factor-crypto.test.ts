import { base32Decode, base32Encode, currentStep, totpAt, verifyTotp } from '../../src/services/totp.service';
import { openSecret, sealSecret } from '../../src/utils/secret-box.util';

// Secret de référence de la RFC 6238 (« 12345678901234567890 » en ASCII).
const RFC_SECRET = base32Encode(Buffer.from('12345678901234567890'));

describe('TOTP (RFC 6238)', () => {
  it.each([
    [59, '94287082'],
    [1111111109, '07081804'],
    [1234567890, '89005924'],
    [2000000000, '69279037'],
  ])('produit le code officiel à t = %i s', (seconds, expected) => {
    expect(totpAt(RFC_SECRET, Math.floor(seconds / 30), 8)).toBe(expected);
  });

  it('encode et décode le base32 sans perte', () => {
    const bytes = Buffer.from([0, 1, 2, 250, 251, 252, 253, 254, 255, 42]);
    expect(base32Decode(base32Encode(bytes))).toEqual(bytes);
  });

  it('accepte une période d’écart mais refuse un code déjà utilisé', () => {
    const now = 1_700_000_000_000;
    const step = currentStep(now);
    expect(verifyTotp(RFC_SECRET, totpAt(RFC_SECRET, step - 1), null, now)).toBe(step - 1);
    expect(verifyTotp(RFC_SECRET, totpAt(RFC_SECRET, step), step, now)).toBeNull();
    expect(verifyTotp(RFC_SECRET, totpAt(RFC_SECRET, step - 2), null, now)).toBeNull();
    expect(verifyTotp(RFC_SECRET, '000000', null, now)).toBeNull();
  });
});

describe('Chiffrement des secrets', () => {
  it('rend le secret d’origine et produit un chiffré différent à chaque fois', () => {
    const a = sealSecret('JBSWY3DPEHPK3PXP');
    const b = sealSecret('JBSWY3DPEHPK3PXP');
    expect(a).not.toBe(b);
    expect(a).not.toContain('JBSWY3DPEHPK3PXP');
    expect(openSecret(a)).toBe('JBSWY3DPEHPK3PXP');
  });

  it('refuse un chiffré modifié', () => {
    const sealed = sealSecret('JBSWY3DPEHPK3PXP');
    const [v, iv, tag, data] = sealed.split('.');
    const tampered = [v, iv, tag, `${data!.slice(0, -2)}AA`].join('.');
    expect(() => openSecret(tampered)).toThrow();
  });
});
