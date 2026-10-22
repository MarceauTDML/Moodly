import { View, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { useFonts } from 'expo-font';
import { store } from './store';
import { RootNavigator } from './navigation/RootNavigator';
import { useSessionBootstrap } from './hooks/useAuth';
import { LoadingOverlay } from './components/shared/LoadingOverlay';
import { ThemeProvider } from './theme/ThemeProvider';
import { colors } from './theme/colors';
function Application() {
  useSessionBootstrap();
  const [loaded, error] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });
  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#E7E9F1' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 480, backgroundColor: colors.background }}>
        <StatusBar barStyle="dark-content" />
        {loaded || error ? <RootNavigator /> : <LoadingOverlay />}
      </View>
    </View>
  );
}
export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider value={colors}>
          <Application />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
