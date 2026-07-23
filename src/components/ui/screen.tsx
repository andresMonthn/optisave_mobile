import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ScreenProps = {
  children: ReactNode;
  /** Wrap content in a ScrollView (default true). */
  scroll?: boolean;
  /** Horizontal padding. */
  padded?: boolean;
  /** Leave room at the bottom for the floating tab bar (default true). */
  tabBarInset?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  header?: ReactNode;
};

/**
 * App screen chrome: themed gradient background with soft color "blobs"
 * that give the glass surfaces something to refract, plus safe-area handling.
 */
export function Screen({
  children,
  scroll = true,
  padded = true,
  tabBarInset = true,
  contentContainerStyle,
  header,
}: ScreenProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const bottomPad = (tabBarInset ? BottomInset : Spacing.xl) + insets.bottom;
  const innerStyle: StyleProp<ViewStyle> = [
    styles.inner,
    padded ? { paddingHorizontal: Spacing.lg } : null,
    { paddingBottom: bottomPad },
    contentContainerStyle,
  ];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background, colors.backgroundAlt]}
        style={StyleSheet.absoluteFill}
      />
      {/* Decorative color fields (kept subtle; help the blur read as glass). */}
      <View
        pointerEvents="none"
        style={[
          styles.blob,
          {
            backgroundColor: colors.primary,
            opacity: isDark ? 0.16 : 0.1,
            top: -80,
            right: -60,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.blob,
          {
            backgroundColor: colors.accent,
            opacity: isDark ? 0.14 : 0.08,
            bottom: 40,
            left: -80,
          },
        ]}
      />

      <View style={[styles.safe, { paddingTop: insets.top }]}>
        {header}
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={innerStyle}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, innerStyle]}>{children}</View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  blob: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
  },
});
