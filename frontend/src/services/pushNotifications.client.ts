import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { ApiRequestError, requestApi } from './api.client';
import { refreshSession } from './session.client';
import type { SessionTokens } from '../types/auth.types';

type NotificationsModule = typeof import('expo-notifications');

export type PushAvailability = 'available' | 'web' | 'simulator' | 'expo-go' | 'missing-project-id';

// Identifiant du projet Expo, ajouté à app.json par « eas init ».
const projectId = (): string | undefined =>
  Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

const isExpoGo = () => Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const pushAvailability = (): PushAvailability => {
  if (Platform.OS === 'web') return 'web';
  // Depuis le SDK 53, Expo Go n'embarque plus le module natif des notifications push.
  if (isExpoGo()) return 'expo-go';
  if (!Device.isDevice) return 'simulator';
  if (!projectId()) return 'missing-project-id';
  return 'available';
};

export const pushUnavailableMessages: Record<Exclude<PushAvailability, 'available'>, string> = {
  web: 'Les notifications push sont disponibles dans l’application mobile.',
  simulator: 'Les notifications push nécessitent un téléphone réel.',
  'expo-go':
    'Expo Go ne prend pas en charge les notifications push. Utilisez une version de développement de l’application.',
  'missing-project-id':
    'Notifications push non configurées : lancez « eas init » dans frontend/ pour associer le projet Expo.',
};

// expo-notifications n'est chargé qu'à la demande : dans Expo Go, le simple import fait planter
// l'application, car son module natif n'y existe pas.
let loaded: NotificationsModule | null | undefined;
export function loadNotifications(): NotificationsModule | null {
  if (loaded !== undefined) return loaded;
  if (Platform.OS === 'web' || isExpoGo()) return (loaded = null);
  const Notifications = require('expo-notifications') as NotificationsModule;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  return (loaded = Notifications);
}

// Demande l'autorisation seulement à l'action de l'utilisateur, jamais au démarrage.
export async function requestDevicePushToken(): Promise<string> {
  const Notifications = loadNotifications();
  if (!Notifications || pushAvailability() !== 'available')
    throw new Error('Les notifications push ne sont pas disponibles sur cet appareil.');
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
  const Notifications = loadNotifications();
  if (!Notifications || pushAvailability() !== 'available') return null;
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
