import { Modal, ScrollView, View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import type { MoodSubmission } from '../../types/checkin.types';

export function MoodSubmittedModal({
  visible,
  result,
  onClose,
  suggestSupport = false,
  onOpenSupport,
}: {
  visible: boolean;
  result: MoodSubmission | null;
  onClose: () => void;
  suggestSupport?: boolean;
  onOpenSupport?: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View accessibilityViewIsModal style={styles.dialog}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.check}>
              <Text accessible={false} style={{ fontSize: 33, color: '#42965D' }}>
                ✓
              </Text>
            </View>
            <Text accessibilityRole="header" style={styles.title}>
              {result?.title}
            </Text>
            <Text style={styles.message}>{result?.message}</Text>
            {suggestSupport && onOpenSupport && (
              <View style={styles.support}>
                <Text style={styles.supportText}>
                  Ces derniers jours ont l’air difficiles. Si tu en ressens le besoin, des personnes
                  peuvent t’écouter, en toute confidentialité.
                </Text>
                <Button title="Voir les ressources d’aide" secondary onPress={onOpenSupport} />
              </View>
            )}
            <View style={{ width: '100%', marginTop: 10 }}>
              <Button title="Compris" onPress={onClose} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#18213766',
  },
  dialog: {
    width: '100%',
    maxWidth: 370,
    maxHeight: '85%',
    borderRadius: 24,
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  content: { padding: 28, alignItems: 'center', gap: 18 },
  check: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F5EC',
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
    color: '#202736',
    fontFamily: 'Inter-Bold',
  },
  message: { fontSize: 14, lineHeight: 23, textAlign: 'center', color: '#758095' },
  support: { width: '100%', gap: 12, padding: 16, borderRadius: 16, backgroundColor: '#F3EFF9' },
  supportText: { fontSize: 13, lineHeight: 20, color: '#202736' },
});
