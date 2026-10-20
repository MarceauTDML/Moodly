import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigation.types';
import { ManagerTabs } from './ManagerTabs';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { TeamTrendsScreen } from '../screens/manager/TeamTrendsScreen';
import { ProfileScreen } from '../screens/settings/ProfileScreen';
import { NotificationSettingsScreen } from '../screens/settings/NotificationSettingsScreen';
import { RoleGuard } from '../components/shared/RoleGuard';
import { LoadingOverlay } from '../components/shared/LoadingOverlay';
import { useAuth } from '../hooks/useAuth';
const Stack = createNativeStackNavigator<RootStackParamList>();
const ManagerHome = () => (
  <RoleGuard>
    <ManagerTabs />
  </RoleGuard>
);
const Trends = (props: React.ComponentProps<typeof TeamTrendsScreen>) => (
  <RoleGuard>
    <TeamTrendsScreen {...props} />
  </RoleGuard>
);
export function RootNavigator() {
  const { session, bootstrapping } = useAuth();
  if (bootstrapping) return <LoadingOverlay />;
  return (
    <NavigationContainer
      linking={{
        prefixes: ['moodmap://'],
        config: { screens: { ResetPassword: 'reset-password' } },
      }}
    >
      <Stack.Navigator
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F3EFF9' } }}
      >
        {session ? (
          <>
            <Stack.Screen name="Manager" component={ManagerHome} />
            <Stack.Screen name="TeamTrends" component={Trends} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Notifications" component={NotificationSettingsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
