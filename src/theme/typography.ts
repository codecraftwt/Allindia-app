/**
 * Poppins-first scale for job portal UI (titles, job cards, body, captions).
 * Use fontFamily from fontFamilies — on RN, prefer family over fontWeight for custom fonts.
 */
export const fontFamilies = {
  regular: 'Poppins-Regular',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
} as const;

export type FontFamilyKey = keyof typeof fontFamilies;

export const typography = {
  /** App title / screen header — 20–22 Bold */
  appTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 21,
    lineHeight: 28,
  },
  /** Section titles — 18 SemiBold */
  sectionTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  /** Job title — 16 SemiBold */
  jobTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  /** Body — 14 Regular */
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  /** Small / meta — 12 Regular */
  small: {
    fontFamily: fontFamilies.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  /** Tiny / caption — 10 Regular */
  tiny: {
    fontFamily: fontFamilies.regular,
    fontSize: 10,
    lineHeight: 14,
  },
  /** Important label (medium weight) */
  labelMedium: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
} as const;
