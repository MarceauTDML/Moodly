import { View } from 'react-native';
import { TagPill } from './TagPill';
import { checkinTagSchema } from '../../services/checkin.schemas';
import type { CheckinTag, MoodOptions } from '../../types/checkin.types';

export function TagSelector({
  options,
  value,
  onToggle,
  disabled,
}: {
  options: MoodOptions['tags'];
  value: CheckinTag[];
  onToggle: (value: CheckinTag) => void;
  disabled?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {checkinTagSchema.options.map((code) => {
        const tag = options.find((item) => item.code === code);
        return tag ? (
          <TagPill
            key={code}
            label={tag.label}
            selected={value.includes(code)}
            disabled={disabled}
            onPress={() => onToggle(code)}
          />
        ) : null;
      })}
    </View>
  );
}
