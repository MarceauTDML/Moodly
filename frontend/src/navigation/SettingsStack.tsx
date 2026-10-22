import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { CollaboratorsScreen } from '../screens/manager/CollaboratorsScreen';
import { CollaboratorFormScreen } from '../screens/manager/CollaboratorFormScreen';
import { CollaboratorDetailScreen } from '../screens/manager/CollaboratorDetailScreen';
export type ManagerSettingsParamList = {
  SettingsHome: undefined;
  Collaborators: undefined;
  CollaboratorForm: { userId?: string } | undefined;
  CollaboratorDetail: { userId: string };
};
const Stack = createNativeStackNavigator<ManagerSettingsParamList>();
export function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsHome" component={SettingsScreen} />
      <Stack.Screen name="Collaborators" component={CollaboratorsScreen} />
      <Stack.Screen name="CollaboratorForm" component={CollaboratorFormScreen} />
      <Stack.Screen name="CollaboratorDetail" component={CollaboratorDetailScreen} />
    </Stack.Navigator>
  );
}
