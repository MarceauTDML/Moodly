import { View, Pressable, StatusBar } from 'react-native';
import { type CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ManagerSettingsParamList } from '../../navigation/SettingsStack';
import type { RootStackParamList } from '../../navigation/navigation.types';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AppHeader } from '../../components/layout/AppHeader';
import { Card } from '../../components/ui/Card';
import { Text } from '../../components/ui/Text';
import { Icon, type IconName } from '../../components/ui/Icon';
import { Button } from '../../components/ui/Button';
import { Divider } from '../../components/ui/Divider';
import { AnonymityBanner } from '../../components/shared/AnonymityBanner';
import { useProfileQuery } from '../../store/api/usersApi';
import { useAuth } from '../../hooks/useAuth';
import { useAppTheme } from '../../theme/ThemeProvider';
import { AppearanceCard } from '../../components/settings/AppearanceCard';
export function SettingsScreen({ onBack }: { onBack?: () => void }) {
  const { colors, statusBarStyle } = useAppTheme();
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        NativeStackNavigationProp<ManagerSettingsParamList>,
        NativeStackNavigationProp<RootStackParamList>
      >
    >();
  const { currentData: profile } = useProfileQuery();
  const { session, signOut } = useAuth();
  const row = (title: string, icon: IconName, onPress: () => void) => (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 }}
    >
      <Icon name={icon} color={colors.primary} />
      <Text style={{ flex: 1 }}>{title}</Text>
      <Icon name="chevron" color={colors.muted} size={18} />
    </Pressable>
  );
  return (
    <ScreenContainer>
      <StatusBar barStyle={statusBarStyle} />
      <AppHeader
        title="Paramètres"
        subtitle={
          session?.user.role === 'COLLABORATEUR'
            ? 'Votre espace collaborateur'
            : 'Votre espace manager'
        }
        onBack={onBack}
      />
      <View style={{ padding: 24, gap: 22 }}>
        <Card>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <View style={{ padding: 14, borderRadius: 22, backgroundColor: colors.primarySoft }}>
              <Icon name="user" size={28} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ fontFamily: 'Inter-Medium', fontSize: 17 }}>
                {profile ? `${profile.firstName} ${profile.lastName}` : 'Mon compte'}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>
                {profile?.email ?? session?.user.email}
              </Text>
              <Text style={{ color: colors.primary, fontSize: 11 }}>
                {profile?.company?.name} ·{' '}
                {session?.user.role === 'ADMIN'
                  ? 'Administrateur'
                  : session?.user.role === 'COLLABORATEUR'
                    ? 'Collaborateur'
                    : 'Manager'}
              </Text>
            </View>
          </View>
        </Card>
        <Card style={{ gap: 0 }}>
          {session?.user.role !== 'COLLABORATEUR' && (
            <>
              {row('Collaborateurs', 'users', () => navigation.navigate('Collaborators'))}
              <Divider />
            </>
          )}
          {row('Mon profil et mon mot de passe', 'user', () => navigation.navigate('Profile'))}
          <Divider />
          {row('Préférences de notification', 'bell', () => navigation.navigate('Notifications'))}
          <Divider />
          {row('Besoin d’aide ?', 'info', () => navigation.navigate('Support'))}
        </Card>
        <AppearanceCard />
        <Card>
          <Text style={{ fontFamily: 'Inter-Medium' }}>Un regard collectif</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>
            La mood map aide à ouvrir le dialogue. Un score ne constitue pas un diagnostic
            individuel et ne permet pas de suivre une personne.
          </Text>
        </Card>
        <Button title="Se déconnecter" secondary onPress={signOut} />
        <AnonymityBanner />
      </View>
    </ScreenContainer>
  );
}
