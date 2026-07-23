import { useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconButton } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Top header for tab screens: title, optional subtitle and right-aligned slot. */
export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.flex}>
        {subtitle ? (
          <ThemedText variant="small" color="textSecondary">
            {subtitle}
          </ThemedText>
        ) : null}
        <ThemedText variant="h1">{title}</ThemedText>
      </View>
      {right}
    </View>
  );
}

/** Header for detail screens: back button + title. */
export function DetailHeader({ title, right }: { title?: string; right?: ReactNode }) {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <View style={styles.detail}>
      <IconButton name="chevron-back" onPress={() => router.back()} background={colors.backgroundAlt} />
      {title ? (
        <ThemedText variant="title" numberOfLines={1} style={styles.detailTitle}>
          {title}
        </ThemedText>
      ) : (
        <View style={styles.flex} />
      )}
      {right ?? <View style={{ width: 42 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  detailTitle: {
    flex: 1,
  },
});
