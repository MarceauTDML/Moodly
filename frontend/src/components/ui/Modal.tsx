import { Modal as NativeModal, View, Pressable, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import { Text } from './Text';
import { IconButton } from './IconButton';
import { typography } from '../../theme/typography';
export function Modal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <NativeModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Fermer le menu"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View accessibilityViewIsModal style={styles.content}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={typography.heading}>
              {title}
            </Text>
            <IconButton icon="close" label="Fermer" onPress={onClose} />
          </View>
          {children}
        </View>
      </View>
    </NativeModal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#18213766',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 430,
    maxHeight: '85%',
    backgroundColor: '#F9F7FC',
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
