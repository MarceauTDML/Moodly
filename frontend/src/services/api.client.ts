import type { z } from 'zod';
import { getApiUrl } from './api.config';
export interface ApiFailure {
  status: number | string;
  message: string;
  code?: string;
}
export class ApiRequestError extends Error {
  constructor(public failure: ApiFailure) {
    super(failure.message);
  }
}
interface RequestOptions<T> {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
  schema?: z.ZodType<T>;
}

// Un seul client pour centraliser les en-têtes, les erreurs et l'annulation.
export async function requestApi<T>(path: string, options: RequestOptions<T> = {}): Promise<T> {
  let baseUrl: string;
  try {
    baseUrl = getApiUrl();
  } catch (error) {
    throw new ApiRequestError({
      status: 'CONFIGURATION',
      message: error instanceof Error ? error.message : 'Configuration API manquante.',
    });
  }
  if (!path.startsWith('/') || path.startsWith('//'))
    throw new ApiRequestError({ status: 'CONFIGURATION', message: 'Route API invalide.' });
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  if (options.signal?.aborted) controller.abort();
  const timer = setTimeout(abort, 12000);
  try {
    const response = await fetch(baseUrl + path, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'error',
    });
    const payload: unknown =
      response.status === 204 ? undefined : await response.json().catch(() => undefined);
    if (!response.ok) {
      const error =
        payload && typeof payload === 'object' && 'error' in payload ? payload.error : undefined;
      const code =
        error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
          ? error.code
          : undefined;
      // Ne pas afficher des erreurs serveur brutes (requêtes SQL, détails internes...).
      const knownMessages: Record<string, string> = {
        WRONG_PORTAL:
          'Ce compte appartient à l’autre espace. Revenez à l’accueil pour changer d’espace.',
        INVALID_INVITATION:
          'Ce lien est invalide, expiré ou déjà utilisé. Demandez une nouvelle invitation à votre manager.',
        INVALID_EMAIL_DOMAIN:
          'Utilisez une adresse professionnelle appartenant au domaine de votre entreprise.',
        ALREADY_EXISTS: 'Cette adresse e-mail est déjà enregistrée.',
        ALREADY_ACTIVE: 'Ce compte est déjà actif.',
        TEAM_NOT_FOUND: 'Cette équipe n’est pas accessible. Choisissez une de vos équipes.',
        MULTIPLE_TEAMS: 'Ce compte appartient à plusieurs équipes. Contactez votre administrateur.',
        ACTIVE_EMAIL_CHANGE: 'L’adresse d’un compte actif ne peut pas être modifiée ici.',
      };
      const message =
        (code && knownMessages[code]) ||
        (response.status === 401
          ? 'Identifiants incorrects ou session expirée.'
          : response.status === 403
            ? 'Vous ne pouvez pas accéder à cette équipe.'
            : response.status === 404
              ? 'Cette ressource est introuvable.'
              : response.status === 429
                ? 'Trop de demandes. Réessayez dans quelques instants.'
                : response.status >= 500
                  ? 'Le serveur est indisponible. Réessayez plus tard.'
                  : 'La demande a été refusée. Vérifiez les informations saisies.');
      throw new ApiRequestError({ status: response.status, message, code });
    }
    const data =
      payload && typeof payload === 'object' && 'success' in payload && 'data' in payload
        ? payload.data
        : payload;
    if (!options.schema) return data as T;
    const parsed = options.schema.safeParse(data);
    if (!parsed.success)
      throw new ApiRequestError({
        status: 'INVALID_RESPONSE',
        message: 'La réponse du serveur ne correspond pas au format attendu.',
      });
    return parsed.data;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    throw new ApiRequestError({
      status: controller.signal.aborted ? 'TIMEOUT' : 'NETWORK',
      message: controller.signal.aborted
        ? 'Le délai de connexion est dépassé. Réessayez.'
        : 'Connexion impossible. Vérifiez votre réseau et le serveur.',
    });
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', abort);
  }
}
export const errorMessage = (error: unknown) => {
  if (error instanceof ApiRequestError) return error.message;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string')
    return error.message;
  return 'Une erreur est survenue. Réessayez.';
};
