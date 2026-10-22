import { View } from 'react-native';
import { TextArea } from '../ui/TextArea';
import { Text } from '../ui/Text';
import { COMMENT_MAX_LENGTH } from '../../services/checkin.schemas';
import { colors } from '../../theme/colors';

export function OptionalCommentInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <View style={{ gap: 2 }}>
      <TextArea
        label="Un commentaire à ajouter ? (Optionnel et anonyme)"
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        maxLength={COMMENT_MAX_LENGTH}
        disabled={disabled}
      />
      <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 17 }}>
        Pour préserver ton anonymat, évite les noms et les détails qui permettraient de te
        reconnaître.
      </Text>
    </View>
  );
}
