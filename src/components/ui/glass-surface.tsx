/**
 * GlassSurface — the building block for every card / panel in the app.
 *
 * Rendering strategy:
 *  - iOS 26+ (Liquid Glass available): native <GlassView> material.
 *  - Everywhere else: <BlurView> + a translucent tint overlay.
 *
 * Hard rules for this product:
 *  - NO borders, ever (depth comes from shadow only).
 *  - Rounded corners, content clipped to the radius.
 *
 * Layout contract:
 *  - `style`        → outer box (sizing/positioning: width, margin, alignSelf,
 *                     flexGrow) plus the shadow.
 *  - `contentStyle` → the container that lays out the children (gap,
 *                     flexDirection, justifyContent, alignItems, minHeight).
 *  The blur lives on a padding-less clip layer so it always bleeds edge to
 *  edge (a padded parent would otherwise inset absolutely-filled children).
 */

import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';
import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Glass, Radius, elevation } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const LIQUID_GLASS = isLiquidGlassAvailable();

export type GlassSurfaceProps = {
  children?: ReactNode;
  /** Corner radius. Defaults to Radius.lg. */
  radius?: number;
  /** Opacity of the frosted tint. 'strong' reads better over busy content. */
  tone?: 'regular' | 'strong';
  /** Drop a shadow for depth. */
  elevated?: boolean | 'sm' | 'md' | 'lg';
  /** Uniform inner padding. */
  padding?: number;
  /** Outer box style (sizing/positioning). */
  style?: StyleProp<ViewStyle>;
  /** Children-container style (gap/flex/justify/minHeight). */
  contentStyle?: StyleProp<ViewStyle>;
  /** Blur strength override (BlurView path only). */
  intensity?: number;
};

export function GlassSurface({
  children,
  radius = Radius.lg,
  tone = 'regular',
  elevated = 'md',
  padding,
  style,
  contentStyle,
  intensity,
}: GlassSurfaceProps) {
  const { colors, isDark } = useTheme();

  const shadow = elevated ? elevation(colors, elevated === true ? 'md' : elevated) : null;
  const overlayColor = tone === 'strong' ? colors.surfaceGlassStrong : colors.surfaceGlass;

  return (
    <View
      style={[
        // backgroundColor is required for Android `elevation` shadows to render;
        // it sits behind the clip layer so it is never actually visible.
        { borderRadius: radius, backgroundColor: colors.surfaceGlassStrong },
        shadow,
        style,
      ]}>
      <View style={[styles.clip, { borderRadius: radius, backgroundColor: colors.surfaceGlassStrong }]}>
        {/* Full-bleed glass background */}
        {LIQUID_GLASS ? (
          <GlassView
            glassEffectStyle="regular"
            colorScheme={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <>
            <BlurView
              intensity={intensity ?? Glass.blurIntensity}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor }]} />
          </>
        )}

        {/* Foreground content */}
        <View style={[{ padding: padding ?? 0 }, contentStyle]}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
});
