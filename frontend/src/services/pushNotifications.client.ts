import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { ApiRequestError, requestApi } from './api.client';
import { refreshSession } from './session.client';
import type { SessionTokens } from '../types/auth.types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type PushAvailability =
  'available' | 'web' | 'simulator' | 'expo-go-android' | 'missing-project-id';

// Identifiant du projet Expo, ajouté à app.json par « eas init ».
const projectId = (): string | undefined =>
  Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

export const pushAvailability = (): PushAvailability => {
  if (Platform.OS === 'web') return 'web';
  if (!Device.isDevice) return 'simulator';
  // Depuis le SDK 53, Expo Go ne reçoit plus les notifications à distance sur Android.
  if (
    Platform.OS === 'android' &&
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  )
    return 'expo-go-android';
  if (!projectId()) return 'missing-project-id';
  return 'available';
};

export const pushUnavailableMessages: Record<Exclude<PushAvailability, 'available'>, string> = {
  web: 'Les notifications push sont disponibles dans l’application mobile.',
  simulator: 'Les notifications push nécessitent un téléphone réel.',
  'expo-go-android':
    'Expo Go ne reçoit pas les notifications push sur Android. Utilisez une version de développement de l’application.',
  'missing-project-id':
    'Notifications push non configurées : lancez « eas init » dans frontend/ pour associer le projet Expo.',
};

// Demande l'autorisation seulement à l'action de l'utilisateur, jamais au démarrage.
export async function requestDevicePushToken(): Promise<string> {
  if (Platform.OS === 'android')
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Rappels',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
  if (!permission.granted)
    throw new Error('Autorisez les notifications de Mood Map dans les réglages du téléphone.');
  return (await Notifications.getExpoPushTokenAsync({ projectId: projectId() })).data;
}

// Jeton de cet appareil, sans jamais afficher de demande d'autorisation.
export async function currentDevicePushToken(): Promise<string | null> {
  if (pushAvailability() !== 'available') return null;
  if (!(await Notifications.getPermissionsAsync()).granted) return null;
  return (await Notifications.getExpoPushTokenAsync({ projectId: projectId() })).data;
}

// À la déconnexion : ce téléphone ne doit plus recevoir les rappels de ce compte.
export async function unregisterThisDevice(tokens: SessionTokens) {
  const pushToken = await currentDevicePushToken();
  if (!pushToken) return;
  const remove = (token: string) =>
    requestApi('/users/me/push-token', { method: 'DELETE', body: { pushToken }, token });
  try {
    await remove(tokens.token);
  } catch (error) {
    if (!(error instanceof ApiRequestError && error.failure.status === 401)) throw error;
    await remove((await refreshSession(tokens.refreshToken)).token);
  }
}
