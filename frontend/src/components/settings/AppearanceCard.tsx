import { Pressable, View } from 'react-native';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { useAppTheme } from '../../theme/ThemeProvider';
import type { ThemeMode } from '../../services/themePreference.storage';

const OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'system', label: 'Système' },
  { mode: 'light', label: 'Clair' },
  { mode: 'dark', label: 'Sombre' },
];

// Choix mémorisé sur ce téléphone ; « Système » suit le réglage clair/sombre de l'appareil.
export function AppearanceCard() {
  const { colors, mode, setMode } = useAppTheme();
  return (
    <Card>
      <Text style={{ fontFamily: 'Inter-Medium' }}>Apparence</Text>
      <View
        accessibilityRole="radiogroup"
        style={{
          flexDirection: 'row',
          gap: 4,
          padding: 4,
          borderRadius: 12,
          backgroundColor: colors.primarySoft,
        }}
      >
        {OPTIONS.map((option) => {
          const selected = option.mode === mode;
          return (
            <Pressable
              key={option.mode}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => setMode(option.mode)}
              style={{
                flex: 1,
                minHeight: 40,
                borderRadius: 9,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? colors.surface : 'transparent',
              }}
            >
              <Text
                style={{
                  color: selected ? colors.primary : colors.muted,
                  fontFamily: 'Inter-Medium',
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}
