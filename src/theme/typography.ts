import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard mobile baseline width (375pt)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const scale = (size: number) => (SCREEN_WIDTH / guidelineBaseWidth) * size;
export const verticalScale = (size: number) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;

/**
 * moderateScale smoothly scales sizes according to device screen width.
 * factor 0.25 ensures text & UI scale proportionally without growing too large
 * on wider/higher-DPI Android devices (was 0.3 — too aggressive on 480dp+ screens).
 */
export const moderateScale = (size: number, factor = 0.25) => {
  const scaled = size + (scale(size) - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

/** Vertically-anchored moderate scale — use for heights & vertical paddings */
export const vms = (size: number, factor = 0.2) => {
  const scaled = size + (verticalScale(size) - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

/**
 * Poppins-first scale for job portal UI (titles, job cards, body, captions).
 * Use fontFamily from fontFamilies — on RN, prefer family over fontWeight for custom fonts.
 */
export const fontFamilies = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
} as const;

export type FontFamilyKey = keyof typeof fontFamilies;

export const typography = {
  /** Heading 1 — 28 Bold */
  h1: {
    fontFamily: fontFamilies.bold,
    fontSize: moderateScale(28),
  },
  /** Heading 2 — 24 Bold */
  h2: {
    fontFamily: fontFamilies.bold,
    fontSize: moderateScale(24),
  },
  /** Heading 3 — 20 Bold */
  h3: {
    fontFamily: fontFamilies.bold,
    fontSize: moderateScale(20),
  },
  /** Heading 4 — 16 Bold */
  h4: {
    fontFamily: fontFamilies.bold,
    fontSize: moderateScale(16),
  },
  /** App title / screen header — 21 Bold */
  appTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: moderateScale(21),
  },
  /** Section titles — 18 SemiBold */
  sectionTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: moderateScale(18),
  },
  /** Job title — 16 SemiBold */
  jobTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: moderateScale(16),
  },
  /** Large label — 16 SemiBold */
  labelLarge: {
    fontFamily: fontFamilies.semiBold,
    fontSize: moderateScale(16),
  },
  /** Important label (medium weight) — 14 SemiBold */
  labelMedium: {
    fontFamily: fontFamilies.semiBold,
    fontSize: moderateScale(14),
  },
  /** Small label — 12 SemiBold */
  labelSmall: {
    fontFamily: fontFamilies.semiBold,
    fontSize: moderateScale(12),
  },
  /** Body — 14 Regular */
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: moderateScale(14),
  },
  /** Small / meta — 12 Regular */
  small: {
    fontFamily: fontFamilies.regular,
    fontSize: moderateScale(12),
  },
  /** Tiny / caption — 10 Regular */
  tiny: {
    fontFamily: fontFamilies.regular,
    fontSize: moderateScale(10),
  },
} as const;

