import { Pressable, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/navigation.types';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Text } from '../../components/ui/Text';
import { Icon } from '../../components/ui/Icon';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useTypography } from '../../theme/typography';
export function WelcomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Welcome'>) {
  const { colors } = useAppTheme();
  const typography = useTypography();
  return (
    <ScreenContainer>
      <View style={{ padding: 24, paddingTop: 42, gap: 36 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ backgroundColor: colors.primarySoft, padding: 10, borderRadius: 15 }}>
            <Icon name="smile" size={28} />
          </View>
          <Text style={{ fontSize: 26 }}>Mood Map</Text>
        </View>
        <View style={{ gap: 12 }}>
          <Text accessibilityRole="header" style={typography.title}>
            Bienvenue
          </Text>
          <Text style={{ color: colors.muted, lineHeight: 24 }}>
            La mood map pour suivre comment se portent les collaborateurs de votre entreprise.
          </Text>
        </View>
        <View style={{ gap: 16 }}>
          <Text style={typography.heading}>Choisissez votre espace</Text>
          {[
            {
              portal: 'employee' as const,
              title: 'Vous êtes collaborateur ?',
              description: 'Partagez votre humeur du jour en toute confidentialité.',
              icon: 'smile' as const,
            },
            {
              portal: 'manager' as const,
              title: 'Vous êtes manager ?',
              description: 'Prenez soin de votre équipe et suivez son humeur collective.',
              icon: 'users' as const,
            },
          ].map((item) => (
            <Pressable
              key={item.portal}
              accessibilityRole="button"
              onPress={() => navigation.navigate('Login', { portal: item.portal })}
              style={({ pressed }) => ({
                padding: 22,
                backgroundColor: colors.input,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 22,
                gap: 14,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Icon name={item.icon} size={26} />
                <Text style={{ flex: 1, fontSize: 17, fontFamily: 'Inter-Medium' }}>
                  {item.title}
                </Text>
                <Icon name="chevron" size={18} />
              </View>
              <Text style={{ color: colors.muted, lineHeight: 21, fontSize: 13 }}>
                {item.description}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Icon name="lock" color={colors.success} size={20} />
          <Text style={{ flex: 1, fontSize: 12, lineHeight: 19, color: colors.muted }}>
            Seules les tendances collectives sont partagées avec les managers.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
