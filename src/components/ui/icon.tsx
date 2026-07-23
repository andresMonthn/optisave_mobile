import Ionicons from '@expo/vector-icons/Ionicons';
import { type ComponentProps } from 'react';

import { type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export type IconProps = {
  name: IconName;
  size?: number;
  /** Palette key. Defaults to primary text color. */
  color?: ThemeColor;
  /** Raw color that overrides the palette lookup. */
  tint?: string;
};

export function Icon({ name, size = 20, color, tint }: IconProps) {
  const { colors } = useTheme();
  return <Ionicons name={name} size={size} color={tint ?? colors[color ?? 'text']} />;
}
