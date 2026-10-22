import { Modal, ScrollView, View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import type { MoodSubmission } from '../../types/checkin.types';

export function MoodSubmittedModal({
  visible,
  result,
  onClose,
}: {
  visible: boolean;
  result: MoodSubmission | null;
  onClose: () => void;
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
});
