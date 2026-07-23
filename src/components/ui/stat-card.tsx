import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { Fonts, FontSize, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type StatCardProps = {
  label: string;
  value: string;
  icon?: IconName;
  /** Accent used for the icon chip and delta. */
  accent?: ThemeColor;
  /** e.g. "+12%" — colored by `trend`. */
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  onPress?: () => void;
};

/**
 * Analytics KPI tile. Borderless by design (product rule: analytics
 * buttons/cards never carry a border) — depth is the card shadow only.
 */
export function StatCard({ label, value, icon, accent = 'primary', delta, trend = 'flat', onPress }: StatCardProps) {
  const { colors } = useTheme();
  const softKey = `${accent}Soft` as ThemeColor;
  const softBg = colors[softKey] ?? colors.primarySoft;
  const trendColor =
    trend === 'up' ? colors.success : trend === 'down' ? colors.danger : colors.textMuted;

  return (
    <Card onPress={onPress} padding={Spacing.lg} contentStyle={styles.card} tone="regular">
      <View style={styles.topRow}>
        {icon ? (
          <View style={[styles.iconChip, { backgroundColor: softBg }]}>
            <Icon name={icon} size={18} tint={colors[accent]} />
          </View>
        ) : null}
        {delta ? (
          <ThemedText variant="caption" style={{ color: trendColor, fontFamily: Fonts.bold }}>
            {delta}
          </ThemedText>
        ) : null}
      </View>
      <ThemedText style={styles.value}>{value}</ThemedText>
      <ThemedText variant="caption" color="textSecondary">
        {label}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 118,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconChip: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: Fonts.black,
    fontSize: FontSize.h1,
    marginTop: Spacing.md,
  },
});
