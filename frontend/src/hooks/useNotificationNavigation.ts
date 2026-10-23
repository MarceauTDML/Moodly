import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/navigation.types';

const useLastResponse =
  Platform.OS === 'web' ? () => null : Notifications.useLastNotificationResponse;

// Toucher le rappel quotidien ouvre la saisie du mood. Si la navigation n'est pas encore
// prête (application lancée par la notification), l'espace collaborateur s'ouvre déjà dessus.
export function useOpenCheckinFromNotification(
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>,
  enabled: boolean,
) {
  const response = useLastResponse();
  const handled = useRef<string | null>(null);
  useEffect(() => {
    if (!enabled || !response) return;
    const { identifier, content } = response.notification.request;
    if (handled.current === identifier || content.data?.screen !== 'DailyCheckin') return;
    handled.current = identifier;
    if (navigationRef.isReady()) navigationRef.navigate('Employee', { screen: 'DailyCheckin' });
  }, [response, enabled, navigationRef]);
}
