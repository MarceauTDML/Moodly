import { useState } from 'react';
import { View, Switch } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/navigation.types';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AppHeader } from '../../components/layout/AppHeader';
import { Card } from '../../components/ui/Card';
import { Text } from '../../components/ui/Text';
import { Divider } from '../../components/ui/Divider';
import { ErrorState } from '../../components/shared/ErrorState';
import { LoadingOverlay } from '../../components/shared/LoadingOverlay';
import { PushDeviceCard } from '../../components/settings/PushDeviceCard';
import {
  useNotificationSettingsQuery,
  useUpdateNotificationsMutation,
} from '../../store/api/usersApi';
import type { NotificationSettings } from '../../types/user.types';
import { errorMessage } from '../../services/api.client';
import { colors } from '../../theme/colors';
export function NotificationSettingsScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Notifications'>) {
  const query = useNotificationSettingsQuery();
  const data = query.currentData;
  const [update, state] = useUpdateNotificationsMutation();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const save = async (
    field: 'dailyReminderEnabled' | 'emailNotificationsEnabled',
    value: boolean,
  ) => {
    setError('');
    setMessage('');
    try {
      await update({ [field]: value }).unwrap();
      setMessage('Préférences enregistrées.');
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  const row = (
    field: keyof Pick<NotificationSettings, 'dailyReminderEnabled' | 'emailNotificationsEnabled'>,
    title: string,
  ) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 64 }}>
      <Text style={{ flex: 1 }}>{title}</Text>
      <Switch
        accessibilityLabel={title}
        value={data?.[field] ?? false}
        onValueChange={(value) => void save(field, value)}
        disabled={state.isLoading || query.isFetching}
        trackColor={{ false: '#D4D8E3', true: '#3445D5' }}
      />
    </View>
  );
  return (
    <ScreenContainer>
      <AppHeader title="Notifications" onBack={navigation.goBack} />
      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : !data ? (
        <LoadingOverlay />
      ) : (
        <View style={{ padding: 24, gap: 20 }}>
          <Card style={{ gap: 0 }}>
            {row('dailyReminderEnabled', 'Rappels quotidiens')}
            <Divider />
            {row('emailNotificationsEnabled', 'Notifications par e-mail')}
          </Card>
          <Text style={{ color: colors.muted, fontSize: 13 }}>
            Ces préférences sont enregistrées sur votre compte. Les envois dépendent des
            notifications prévues par le serveur pour votre rôle.
          </Text>
          <PushDeviceCard pushEnabled={data.pushEnabled} />
          {message && (
            <Text accessibilityLiveRegion="polite" style={{ color: colors.success }}>
              {message}
            </Text>
          )}
          {error && (
            <Text accessibilityRole="alert" style={{ color: colors.danger }}>
              {error}
            </Text>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}
