/**
 * OptiSave Mobile — Design System
 * -------------------------------------------------------------
 * UI language: soft "glassmorphism" (translucent surfaces + blur),
 * depth expressed through SHADOWS only — NO borders on cards or
 * analytics buttons (hard product requirement), convention colors
 * for light/dark (no neon), and Arial / Arial Black typography.
 *
 * Platform notes for the typeface:
 *  - iOS & Web ship Arial natively, so it renders exactly.
 *  - Android has no Arial license; the closest system stack is used
 *    (`sans-serif` / `sans-serif-black`) as a graceful fallback.
 */

import { Platform } from 'react-native';

/* ------------------------------------------------------------------ */
/*  Palette                                                            */
/* ------------------------------------------------------------------ */

export const Colors = {
  light: {
    // Backgrounds
    background: '#F4F6FB',
    backgroundAlt: '#EAEEF6',
    // Opaque surface used when a solid card is needed
    surface: '#FFFFFF',
    // Translucent surface used behind the blur for the glass look
    surfaceGlass: 'rgba(255,255,255,0.62)',
    surfaceGlassStrong: 'rgba(255,255,255,0.82)',
    // Text
    text: '#101828',
    textSecondary: '#475467',
    textMuted: '#98A2B3',
    onPrimary: '#FFFFFF',
    // Brand + semantic (convention colors, deliberately NOT neon)
    primary: '#208AEF',
    primarySoft: 'rgba(32,138,239,0.12)',
    accent: '#0E7C7B',
    success: '#1F9254',
    successSoft: 'rgba(31,146,84,0.12)',
    warning: '#B25E09',
    warningSoft: 'rgba(178,94,9,0.12)',
    danger: '#D92D20',
    dangerSoft: 'rgba(217,45,32,0.12)',
    info: '#3538CD',
    infoSoft: 'rgba(53,56,205,0.12)',
    // Utility
    divider: 'rgba(16,24,40,0.08)',
    shadow: '#0B1220',
    star: '#F5A623',
    // Tab bar + glass tint
    tabBarGlass: 'rgba(255,255,255,0.70)',
    glassTint: 'rgba(255,255,255,0.45)',
  },
  dark: {
    background: '#0B0E14',
    backgroundAlt: '#11151D',
    surface: '#161B24',
    surfaceGlass: 'rgba(22,27,36,0.55)',
    surfaceGlassStrong: 'rgba(22,27,36,0.78)',
    text: '#F2F4F7',
    textSecondary: '#B0B8C4',
    textMuted: '#6B7480',
    onPrimary: '#FFFFFF',
    primary: '#3D9BF5',
    primarySoft: 'rgba(61,155,245,0.18)',
    accent: '#2DD4BF',
    success: '#3CCB7F',
    successSoft: 'rgba(60,203,127,0.16)',
    warning: '#F2A65A',
    warningSoft: 'rgba(242,166,90,0.16)',
    danger: '#F97066',
    dangerSoft: 'rgba(249,112,102,0.16)',
    info: '#8098F9',
    infoSoft: 'rgba(128,152,249,0.16)',
    divider: 'rgba(255,255,255,0.08)',
    shadow: '#000000',
    star: '#F5A623',
    tabBarGlass: 'rgba(18,22,30,0.72)',
    glassTint: 'rgba(18,22,30,0.40)',
  },
} as const;

export type ThemeName = keyof typeof Colors;
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type ThemePalette = (typeof Colors)[ThemeName];

/* ------------------------------------------------------------------ */
/*  Typography — Arial / Arial Black                                  */
/* ------------------------------------------------------------------ */

export const Fonts = {
  regular: Platform.select({
    ios: 'Arial',
    android: 'sans-serif',
    web: 'Arial, Helvetica, sans-serif',
    default: 'Arial',
  }) as string,
  medium: Platform.select({
    ios: 'Arial',
    android: 'sans-serif-medium',
    web: 'Arial, Helvetica, sans-serif',
    default: 'Arial',
  }) as string,
  bold: Platform.select({
    ios: 'Arial-BoldMT',
    android: 'sans-serif',
    web: 'Arial, Helvetica, sans-serif',
    default: 'Arial',
  }) as string,
  // Arial Black — used for headings / big numbers
  black: Platform.select({
    ios: 'Arial-Black',
    android: 'sans-serif-black',
    web: '"Arial Black", Arial, sans-serif',
    default: 'Arial',
  }) as string,
  mono: Platform.select({
    ios: 'ui-monospace',
    android: 'monospace',
    web: 'ui-monospace, SFMono-Regular, monospace',
    default: 'monospace',
  }) as string,
};

/* ------------------------------------------------------------------ */
/*  Spacing / Radius / Layout                                          */
/* ------------------------------------------------------------------ */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  huge: 48,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const FontSize = {
  caption: 12,
  small: 13,
  body: 15,
  callout: 17,
  title: 20,
  h2: 24,
  h1: 30,
  display: 40,
} as const;

/* ------------------------------------------------------------------ */
/*  Elevation (shadows only — depth without borders)                  */
/* ------------------------------------------------------------------ */

type Elevation = {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
};

export function elevation(theme: ThemePalette, level: 'sm' | 'md' | 'lg' = 'md'): Elevation {
  const isDark = theme.background === Colors.dark.background;
  const base = {
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: level === 'lg' ? 12 : level === 'md' ? 8 : 4 },
  };
  const opacity = isDark
    ? { sm: 0.4, md: 0.5, lg: 0.6 }[level]
    : { sm: 0.06, md: 0.1, lg: 0.16 }[level];
  const radius = { sm: 10, md: 20, lg: 30 }[level];
  const elev = { sm: 2, md: 6, lg: 12 }[level];
  return { ...base, shadowOpacity: opacity, shadowRadius: radius, elevation: elev };
}

/* ------------------------------------------------------------------ */
/*  Glass configuration (consumed by <GlassSurface />)                */
/* ------------------------------------------------------------------ */

export const Glass = {
  blurIntensity: Platform.select({ ios: 40, android: 60, default: 40 }) as number,
  tabBarBlurIntensity: Platform.select({ ios: 55, android: 80, default: 55 }) as number,
} as const;

/* ------------------------------------------------------------------ */
/*  Navigation layout constants                                        */
/* ------------------------------------------------------------------ */

export const FloatingTabBar = {
  height: 64,
  horizontalMargin: 16,
  bottomOffset: Platform.select({ ios: 24, android: 16, default: 16 }) as number,
} as const;

/** Space a scroll view should leave at the bottom so content clears the floating bar. */
export const BottomInset =
  FloatingTabBar.height + FloatingTabBar.bottomOffset + Spacing.lg;

export const MaxContentWidth = 720;
