/**
 * Resolves the active palette from the device color scheme.
 * Learn more: https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, type ThemeName, type ThemePalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ActiveTheme = {
  colors: ThemePalette;
  scheme: ThemeName;
  isDark: boolean;
};

export function useTheme(): ActiveTheme {
  const scheme = useColorScheme();
  const resolved: ThemeName = scheme === 'dark' ? 'dark' : 'light';
  return {
    colors: Colors[resolved],
    scheme: resolved,
    isDark: resolved === 'dark',
  };
}
