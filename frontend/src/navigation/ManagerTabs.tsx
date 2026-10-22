import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ManagerTabsParamList } from './navigation.types';
import { TabBar } from '../components/layout/TabBar';
import { MoodMapScreen } from '../screens/manager/MoodMapScreen';
import { EvolutionScreen } from '../screens/manager/EvolutionScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
const Tabs = createBottomTabNavigator<ManagerTabsParamList>();
export function ManagerTabs() {
  return (
    <Tabs.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, lazy: true }}
    >
      <Tabs.Screen name="MoodMap" component={MoodMapScreen} options={{ title: 'Mood map' }} />
      <Tabs.Screen name="Evolution" component={EvolutionScreen} options={{ title: 'Évolution' }} />
      <Tabs.Screen name="Settings" component={SettingsScreen} options={{ title: 'Paramètres' }} />
    </Tabs.Navigator>
  );
}
