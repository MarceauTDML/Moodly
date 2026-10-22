export const isEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
export const passwordHint = '12 à 128 caractères, avec majuscule, minuscule, chiffre et symbole.';
export const isStrongPassword = (password: string) =>
  password.length >= 12 &&
  password.length <= 128 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^a-zA-Z0-9]/.test(password);
