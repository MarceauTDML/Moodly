import { useState } from 'react';
import { ScrollView, Pressable } from 'react-native';
import { Modal } from '../ui/Modal';
import { Text } from '../ui/Text';
import { TextLink } from '../ui/TextLink';
import { useTeam } from '../../hooks/useTeam';
import { colors } from '../../theme/colors';
export function TeamPicker() {
  const { teams, team, select } = useTeam();
  const [open, setOpen] = useState(false);
  if (teams.length < 2) return null;
  return (
    <>
      <TextLink
        title={`Équipe : ${team?.name ?? 'Choisir'} ▾`}
        onPress={() => setOpen(true)}
        style={{ paddingHorizontal: 24 }}
      />
      <Modal visible={open} title="Choisir une équipe" onClose={() => setOpen(false)}>
        <ScrollView>
          {teams.map((t) => (
            <Pressable
              key={t.id}
              accessibilityRole="button"
              accessibilityState={{ selected: t.id === team?.id }}
              onPress={() => {
                select(t.id);
                setOpen(false);
              }}
              style={{
                padding: 18,
                marginVertical: 4,
                borderRadius: 12,
                backgroundColor: t.id === team?.id ? '#E9E8FB' : '#FFFFFF',
              }}
            >
              <Text style={{ color: t.id === team?.id ? colors.primary : colors.text }}>
                {t.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Modal>
    </>
  );
}
