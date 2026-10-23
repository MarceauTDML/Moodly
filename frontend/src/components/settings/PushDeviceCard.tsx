import { useState } from 'react';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { useRegisterPushMutation, useUnregisterPushMutation } from '../../store/api/usersApi';
import {
  currentDevicePushToken,
  pushAvailability,
  pushUnavailableMessages,
  requestDevicePushToken,
} from '../../services/pushNotifications.client';
import { errorMessage } from '../../services/api.client';
import { colors } from '../../theme/colors';

// Activation volontaire : l'autorisation n'est demandée qu'après un appui sur le bouton.
export function PushDeviceCard({ pushEnabled }: { pushEnabled: boolean }) {
  const availability = pushAvailability();
  const [register, registerState] = useRegisterPushMutation();
  const [unregister, unregisterState] = useUnregisterPushMutation();
  const [error, setError] = useState('');
  const run = async (action: () => Promise<unknown>) => {
    setError('');
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  const enable = () =>
    run(async () => register({ pushToken: await requestDevicePushToken() }).unwrap());
  const disable = () =>
    run(async () => {
      const pushToken = await currentDevicePushToken();
      if (pushToken) await unregister({ pushToken }).unwrap();
    });

  return (
    <Card>
      <Text style={{ fontFamily: 'Inter-Medium' }}>Cet appareil</Text>
      <Text style={{ color: colors.muted }}>
        {pushEnabled
          ? 'Un téléphone reçoit les rappels de votre compte. Un seul appareil peut les recevoir à la fois.'
          : 'Aucun téléphone ne reçoit les rappels : ils vous parviennent par e-mail si vous l’acceptez.'}
      </Text>
      {availability !== 'available' ? (
        <Text style={{ color: colors.muted, fontSize: 13 }}>
          {pushUnavailableMessages[availability]}
        </Text>
      ) : (
        <>
          <Button
            title="Recevoir les rappels sur ce téléphone"
            onPress={() => void enable()}
            loading={registerState.isLoading}
          />
          {pushEnabled && (
            <Button
              title="Ne plus les recevoir sur ce téléphone"
              secondary
              onPress={() => void disable()}
              loading={unregisterState.isLoading}
            />
          )}
        </>
      )}
      {error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
    </Card>
  );
}
