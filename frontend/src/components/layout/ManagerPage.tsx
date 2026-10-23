import { useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { ManagerTabsParamList } from '../../navigation/navigation.types';
import { ScreenContainer } from './ScreenContainer';
import { AppHeader } from './AppHeader';
import { TextLink } from '../ui/TextLink';
import { Modal } from '../ui/Modal';
import { useAppTheme } from '../../theme/ThemeProvider';
export function ManagerPage({
  backLabel,
  onBack,
  children,
  onRefresh,
  refreshing,
}: {
  backLabel: string;
  onBack: () => void;
  children: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const { colors } = useAppTheme();
  const [menu, setMenu] = useState(false);
  const navigation = useNavigation<NavigationProp<ManagerTabsParamList>>();
  return (
    <ScreenContainer onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ backgroundColor: colors.selected, paddingBottom: 8 }}>
        <AppHeader subtitle="Espace manager" onMenu={() => setMenu(true)} />
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
        <TextLink title={`‹  ${backLabel}`} onPress={onBack} />
      </View>
      <View style={{ padding: 24, paddingTop: 18, gap: 20 }}>{children}</View>
      <Modal visible={menu} title="Mon espace manager" onClose={() => setMenu(false)}>
        {(
          [
            { key: 'MoodMap', label: 'Mood map' },
            { key: 'Evolution', label: 'Évolution' },
            { key: 'Settings', label: 'Paramètres' },
          ] as const
        ).map((item) => (
          <TextLink
            key={item.key}
            title={item.label}
            onPress={() => {
              setMenu(false);
              navigation.navigate(item.key);
            }}
          />
        ))}
      </Modal>
    </ScreenContainer>
  );
}
