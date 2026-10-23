import type { ReactNode } from 'react';
import { ScrollView, View, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/ThemeProvider';
export function ScreenContainer({
  children,
  background: backgroundProp,
  onRefresh,
  refreshing = false,
}: {
  children: ReactNode;
  background?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const { colors } = useAppTheme();
  const background = backgroundProp ?? colors.background;
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: background }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top, paddingBottom: 24 }}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          ) : undefined
        }
      >
        <View style={{ flex: 1 }}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
