/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const fblaBlue = '#003DA5';
const fblaBlueDark = '#002B73';
const fblaYellow = '#FFD200';
const fblaWhite = '#FBFCFF';
const ink = '#0A1733';
const muted = '#5D6B8A';
const line = '#DCE6FF';
const surface = '#FFFFFF';
const surfaceSoft = '#F3F7FF';

const tintColorLight = fblaBlue;
const tintColorDark = fblaYellow;

export const FBLATheme = {
  blue: fblaBlue,
  blueDark: fblaBlueDark,
  blueMid: '#174FB3',
  blueSoft: '#EAF1FF',
  yellow: fblaYellow,
  yellowSoft: '#FFF4B8',
  white: fblaWhite,
  surface,
  surfaceSoft,
  surfaceRaised: '#FEFFFF',
  ink,
  muted,
  mutedStrong: '#344468',
  line,
  lineStrong: '#BFD0FF',
  lineSoft: '#EEF3FF',
  success: '#157A4E',
  danger: '#C92A2A',
  shadow: '#001A4F',
  radius: {
    sm: 10,
    md: 12,
    lg: 16,
    xl: 20,
    hero: 26,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },
  shadowStyle: {
    shadowColor: '#001A4F',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
};

export const Colors = {
  light: {
    text: ink,
    background: fblaWhite,
    tint: tintColorLight,
    icon: muted,
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: fblaBlueDark,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
