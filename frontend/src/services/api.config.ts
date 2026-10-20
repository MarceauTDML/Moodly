// Aucun secret dans le front. L'URL se configure uniquement dans le .env local.
export function validateApiUrl(value: string | undefined, development: boolean): string {
  if (!value?.trim())
    throw new Error('Configure EXPO_PUBLIC_API_URL dans frontend/.env puis relance Expo.');
  const url = new URL(value.trim());
  if (url.username || url.password || url.search || url.hash)
    throw new Error('URL API invalide : aucun identifiant ni paramètre autorisé.');
  const host = url.hostname;
  const octets = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ? host.split('.').map(Number) : [];
  const ipv4 = octets.length === 4 && octets.every((n) => n >= 0 && n <= 255);
  const local =
    host === 'localhost' ||
    host === '[::1]' ||
    (ipv4 &&
      (octets[0] === 127 ||
        octets[0] === 10 ||
        (octets[0] === 192 && octets[1] === 168) ||
        (octets[0] === 172 && octets[1]! >= 16 && octets[1]! <= 31)));
  if (url.protocol !== 'https:' && !(development && url.protocol === 'http:' && local))
    throw new Error('HTTPS est obligatoire. HTTP est réservé au réseau local en développement.');
  return url.toString().replace(/\/+$/, '');
}
export const getApiUrl = () =>
  validateApiUrl(process.env.EXPO_PUBLIC_API_URL, typeof __DEV__ !== 'undefined' && __DEV__);
