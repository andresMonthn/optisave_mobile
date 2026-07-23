import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { GlassSurface, type GlassSurfaceProps } from '@/components/ui/glass-surface';
import { Radius, Spacing } from '@/constants/theme';

export type CardProps = GlassSurfaceProps & {
  onPress?: () => void;
};

/**
 * A borderless glass card. Optionally pressable.
 * (No component in this app draws a border — depth is shadow only.)
 */
export function Card({ onPress, style, padding = Spacing.lg, radius = Radius.lg, ...rest }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed ? styles.pressed : null, style as StyleProp<ViewStyle>]}>
        <GlassSurface padding={padding} radius={radius} {...rest} />
      </Pressable>
    );
  }
  return <GlassSurface padding={padding} radius={radius} style={style} {...rest} />;
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
