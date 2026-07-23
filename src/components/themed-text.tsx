import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, FontSize, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'title'
  | 'callout'
  | 'body'
  | 'small'
  | 'caption';

type Weight = 'regular' | 'medium' | 'bold' | 'black';

export type ThemedTextProps = TextProps & {
  variant?: Variant;
  /** Palette key for the text color. Defaults to the primary text color. */
  color?: ThemeColor;
  /** Overrides the weight implied by the variant. */
  weight?: Weight;
};

export function ThemedText({
  style,
  variant = 'body',
  color,
  weight,
  ...rest
}: ThemedTextProps) {
  const { colors } = useTheme();
  const family = weight ? Fonts[weight] : undefined;

  return (
    <Text
      style={[
        { color: colors[color ?? 'text'] },
        styles[variant],
        family ? { fontFamily: family } : null,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: Fonts.black,
    fontSize: FontSize.display,
    lineHeight: FontSize.display + 4,
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: Fonts.black,
    fontSize: FontSize.h1,
    lineHeight: FontSize.h1 + 4,
    letterSpacing: -0.4,
  },
  h2: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.h2,
    lineHeight: FontSize.h2 + 6,
    letterSpacing: -0.3,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.title,
    lineHeight: FontSize.title + 6,
  },
  callout: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.callout,
    lineHeight: FontSize.callout + 6,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.body,
    lineHeight: FontSize.body + 8,
  },
  small: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.small,
    lineHeight: FontSize.small + 6,
  },
  caption: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.caption,
    lineHeight: FontSize.caption + 4,
  },
});
