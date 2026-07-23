import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Fonts, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral';

function toneColors(tone: Tone, colors: ReturnType<typeof useTheme>['colors']) {
  const map: Record<Tone, { fg: string; bg: string }> = {
    primary: { fg: colors.primary, bg: colors.primarySoft },
    success: { fg: colors.success, bg: colors.successSoft },
    warning: { fg: colors.warning, bg: colors.warningSoft },
    danger: { fg: colors.danger, bg: colors.dangerSoft },
    info: { fg: colors.info, bg: colors.infoSoft },
    accent: { fg: colors.accent, bg: colors.primarySoft },
    neutral: { fg: colors.textSecondary, bg: colors.backgroundAlt },
  };
  return map[tone];
}

export type ChipProps = {
  label: string;
  icon?: IconName;
  tone?: Tone;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Rounded pill used for specialties, focus areas, languages and filters. */
export function Chip({ label, icon, tone = 'neutral', selected, onPress, style }: ChipProps) {
  const { colors } = useTheme();
  const c = toneColors(tone, colors);
  const bg = selected ? colors.primary : c.bg;
  const fg = selected ? colors.onPrimary : c.fg;

  const content = (
    <View style={[styles.chip, { backgroundColor: bg }, style]}>
      {icon ? <Icon name={icon} size={14} tint={fg} /> : null}
      <ThemedText variant="small" style={{ color: fg, fontFamily: Fonts.bold }}>
        {label}
      </ThemedText>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => (pressed ? styles.pressed : null)}>
        {content}
      </Pressable>
    );
  }
  return content;
}

/** A small status badge (soft background, colored text). */
export function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const { colors } = useTheme();
  const c = toneColors(tone, colors);
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.fg }]} />
      <ThemedText variant="caption" style={{ color: c.fg, fontFamily: Fonts.bold }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
  pressed: {
    opacity: 0.7,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
