import { Linking, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/navigation.types';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AppHeader } from '../../components/layout/AppHeader';
import { Card } from '../../components/ui/Card';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { useMoodOptionsQuery } from '../../store/api/moodsApi';
import { useAppTheme } from '../../theme/ThemeProvider';

const call = (phone: string) => void Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);

// Ressources toujours accessibles : l'application n'enregistre ni l'ouverture ni les appels.
export function SupportScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Support'>) {
  const { colors } = useAppTheme();
  const resources = useMoodOptionsQuery().currentData?.supportResources ?? [];
  return (
    <ScreenContainer>
      <AppHeader title="Besoin d’aide ?" onBack={navigation.goBack} />
      <View style={{ padding: 24, gap: 18 }}>
        <Text style={{ color: colors.muted }}>
          Si tu traverses une période difficile, tu n’as pas à rester seul·e. Ces contacts sont
          confidentiels. Mood Map ne sait pas si tu les consultes.
        </Text>
        <Card>
          <Text style={{ fontFamily: 'Inter-Medium', fontSize: 17 }}>3114</Text>
          <Text style={{ color: colors.muted }}>
            Numéro national de prévention du suicide. Gratuit, 24 h/24 et 7 j/7, pour toi ou pour un
            proche.
          </Text>
          <Button title="Appeler le 3114" onPress={() => call('3114')} />
        </Card>
        <Card>
          <Text style={{ fontFamily: 'Inter-Medium', fontSize: 17 }}>Santé au travail</Text>
          <Text style={{ color: colors.muted }}>
            Le médecin du travail est tenu au secret médical. Tu peux demander un rendez-vous à tout
            moment, sans passer par ton manager.
          </Text>
        </Card>
        {resources.map((resource) => (
          <Card key={resource.label}>
            <Text style={{ fontFamily: 'Inter-Medium', fontSize: 17 }}>{resource.label}</Text>
            {resource.description && (
              <Text style={{ color: colors.muted }}>{resource.description}</Text>
            )}
            {resource.phone && (
              <Button
                title={`Appeler le ${resource.phone}`}
                onPress={() => call(resource.phone!)}
              />
            )}
            {resource.url && (
              <Button
                title="Ouvrir le site"
                secondary
                onPress={() => void Linking.openURL(resource.url!)}
              />
            )}
          </Card>
        ))}
        <Text style={{ color: colors.muted, fontSize: 12 }}>
          En cas de danger immédiat, appelle le 15 ou le 112.
        </Text>
      </View>
    </ScreenContainer>
  );
}
