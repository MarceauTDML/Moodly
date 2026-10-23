import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import type { EmployeeStackParamList } from './navigation.types';
import { DailyCheckinScreen } from '../screens/employee/DailyCheckinScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { MyHistoryScreen } from '../screens/employee/MyHistoryScreen';

const Stack = createNativeStackNavigator<EmployeeStackParamList>();
function EmployeeSettings({
  navigation,
}: NativeStackScreenProps<EmployeeStackParamList, 'EmployeeSettings'>) {
  return <SettingsScreen onBack={navigation.goBack} />;
}
export function EmployeeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DailyCheckin" component={DailyCheckinScreen} />
      <Stack.Screen name="EmployeeSettings" component={EmployeeSettings} />
      <Stack.Screen name="MyHistory" component={MyHistoryScreen} />
    </Stack.Navigator>
  );
}
