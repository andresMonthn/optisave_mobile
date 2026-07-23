import { type PropsWithChildren, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Collapsible({
  children,
  title,
  defaultOpen = false,
}: PropsWithChildren & { title: string; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { colors } = useTheme();

  return (
    <View>
      <Pressable
        style={({ pressed }) => [styles.heading, pressed && styles.pressed]}
        onPress={() => setIsOpen((v) => !v)}>
        <ThemedText variant="callout">{title}</ThemedText>
        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} tint={colors.textSecondary} />
      </Pressable>
      {isOpen ? (
        <Animated.View entering={FadeIn.duration(180)} style={styles.content}>
          {children}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
});
