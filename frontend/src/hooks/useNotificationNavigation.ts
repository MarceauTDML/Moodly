import { useEffect, useRef } from 'react';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import type { NotificationResponse } from 'expo-notifications';
import type { RootStackParamList } from '../navigation/navigation.types';
import { loadNotifications } from '../services/pushNotifications.client';

// Toucher le rappel quotidien ouvre la saisie du mood. Si la navigation n'est pas encore
// prête (application lancée par la notification), l'espace collaborateur s'ouvre déjà dessus.
// Sans module de notifications (web, Expo Go), ce hook ne fait rien.
export function useOpenCheckinFromNotification(
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>,
  enabled: boolean,
) {
  const handled = useRef<string | null>(null);
  useEffect(() => {
    const Notifications = loadNotifications();
    if (!enabled || !Notifications) return;
    const open = (response: NotificationResponse | null) => {
      if (!response) return;
      const { identifier, content } = response.notification.request;
      if (handled.current === identifier || content.data?.screen !== 'DailyCheckin') return;
      handled.current = identifier;
      if (navigationRef.isReady()) navigationRef.navigate('Employee', { screen: 'DailyCheckin' });
    };
    open(Notifications.getLastNotificationResponse());
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    return () => subscription.remove();
  }, [enabled, navigationRef]);
}
