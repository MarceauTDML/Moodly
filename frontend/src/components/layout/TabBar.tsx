import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Icon, type IconName } from '../ui/Icon';
import { Text } from '../ui/Text';
import { colors } from '../../theme/colors';
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const icons: Record<string, IconName> = {
    MoodMap: 'smile',
    Evolution: 'chart',
    Settings: 'settings',
  };
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#FCFCFF',
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 12),
        borderTopWidth: 1,
        borderTopColor: '#F3F0F8',
      }}
    >
      {state.routes.map((route, index) => {
        const selected = state.index === index;
        const color = selected ? colors.primary : '#9299B5';
        const options = descriptors[route.key]?.options;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={options?.title}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!selected && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              minHeight: 48,
            }}
          >
            <Icon name={icons[route.name] ?? 'smile'} color={color} size={23} />
            <Text
              style={{
                color,
                fontSize: 10,
                lineHeight: 16,
                fontFamily: selected ? 'Inter-Medium' : 'Inter-Regular',
              }}
            >
              {options?.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
