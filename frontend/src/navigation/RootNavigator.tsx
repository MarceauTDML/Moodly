import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigation.types';
import { ManagerTabs } from './ManagerTabs';
import { EmployeeStack } from './EmployeeStack';
import { accessSpace } from '../utils/access.util';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { ActivateAccountScreen } from '../screens/auth/ActivateAccountScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { TeamTrendsScreen } from '../screens/manager/TeamTrendsScreen';
import { ProfileScreen } from '../screens/settings/ProfileScreen';
import { NotificationSettingsScreen } from '../screens/settings/NotificationSettingsScreen';
import { RoleGuard } from '../components/shared/RoleGuard';
import { LoadingOverlay } from '../components/shared/LoadingOverlay';
import { ErrorState } from '../components/shared/ErrorState';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
const Stack = createNativeStackNavigator<RootStackParamList>();
const EmployeeHome = () => (
  <RoleGuard roles={['COLLABORATEUR']}>
    <EmployeeStack />
  </RoleGuard>
);
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
  const { session, bootstrapping, bootstrapError, retryBootstrap, signOut } = useAuth();
  const space = accessSpace(session?.user.role);
  if (bootstrapping) return <LoadingOverlay />;
  if (bootstrapError)
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ErrorState error={{ message: bootstrapError }} onRetry={retryBootstrap} />
          <View style={{ marginHorizontal: 24 }}>
            <Button title="Se connecter avec un autre compte" onPress={signOut} />
          </View>
        </View>
      </ScreenContainer>
    );
  return (
    <NavigationContainer
      linking={{
        prefixes: ['moodmap://'],
        config: {
          screens: {
            Welcome: '',
            Login: 'login',
            ActivateAccount: 'activate-account',
            ResetPassword: 'reset-password',
          },
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F3EFF9' } }}
      >
        {session ? (
          <Stack.Group navigationKey={`${session.user.id}:${space}`}>
            {space === 'employee' ? (
              <Stack.Screen name="Employee" component={EmployeeHome} />
            ) : (
              <>
                <Stack.Screen name="Manager" component={ManagerHome} />
                <Stack.Screen name="TeamTrends" component={Trends} />
              </>
            )}
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Notifications" component={NotificationSettingsScreen} />
          </Stack.Group>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="ActivateAccount" component={ActivateAccountScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
