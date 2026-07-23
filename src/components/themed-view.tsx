import { View, type ViewProps } from 'react-native';

import { type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  /** Palette key for the background color. Defaults to the app background. */
  color?: ThemeColor;
};

export function ThemedView({ style, color, ...rest }: ThemedViewProps) {
  const { colors } = useTheme();
  return (
    <View style={[{ backgroundColor: colors[color ?? 'background'] }, style]} {...rest} />
  );
}
