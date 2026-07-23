import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Fonts, FontSize, Radius, Spacing, elevation } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

const HEIGHT: Record<Size, number> = { sm: 38, md: 48, lg: 54 };
const PADDING: Record<Size, number> = { sm: Spacing.md, md: Spacing.lg, lg: Spacing.xl };
const FONT: Record<Size, number> = { sm: FontSize.small, md: FontSize.body, lg: FontSize.callout };

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const palette: Record<Variant, { bg: string; fg: string; elevated: boolean }> = {
    primary: { bg: colors.primary, fg: colors.onPrimary, elevated: true },
    secondary: { bg: colors.primarySoft, fg: colors.primary, elevated: false },
    ghost: { bg: 'transparent', fg: colors.primary, elevated: false },
    danger: { bg: colors.danger, fg: colors.onPrimary, elevated: true },
  };
  const { bg, fg, elevated } = palette[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          height: HEIGHT[size],
          paddingHorizontal: PADDING[size],
          backgroundColor: bg,
          borderRadius: Radius.pill,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        elevated ? elevation(colors, 'sm') : null,
        fullWidth ? styles.fullWidth : null,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={FONT[size] + 3} tint={fg} /> : null}
          <ThemedText style={{ color: fg, fontFamily: Fonts.bold, fontSize: FONT[size] }}>
            {label}
          </ThemedText>
          {iconRight ? <Icon name={iconRight} size={FONT[size] + 3} tint={fg} /> : null}
        </View>
      )}
    </Pressable>
  );
}

/** Circular icon-only button (glassless, borderless) for headers & rows. */
export function IconButton({
  name,
  onPress,
  size = 42,
  tint,
  background,
}: {
  name: IconName;
  onPress?: () => void;
  size?: number;
  tint?: string;
  background?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        {
          width: size,
          height: size,
          borderRadius: Radius.pill,
          backgroundColor: background ?? colors.primarySoft,
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      <Icon name={name} size={size * 0.46} tint={tint ?? colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
