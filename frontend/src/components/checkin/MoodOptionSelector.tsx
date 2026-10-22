import { View } from 'react-native';
import { MoodButton } from './MoodButton';
import type { CheckinMood, MoodOptions } from '../../types/checkin.types';

const order: CheckinMood[] = ['EPANOUI', 'BIEN', 'MOYEN', 'STRESSE'];
export function MoodOptionSelector({
  options,
  value,
  onChange,
  disabled,
}: {
  options: MoodOptions['moods'];
  value: CheckinMood | null;
  onChange: (value: CheckinMood) => void;
  disabled?: boolean;
}) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Ton humeur du jour"
      style={{ flexDirection: 'row', gap: 12 }}
    >
      {order.map((code) => {
        const option = options.find((item) => item.code === code);
        return option ? (
          <MoodButton
            key={code}
            {...option}
            selected={value === code}
            disabled={disabled}
            onPress={() => onChange(code)}
          />
        ) : null;
      })}
    </View>
  );
}
