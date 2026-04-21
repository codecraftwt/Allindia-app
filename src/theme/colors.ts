export type ThemeMode = 'light' | 'dark';

/**
 * Job portal palette: trustworthy blue, clean neutrals, clear status colors.
 * Light: app bg gray, cards white. Dark: bg #111827, cards #1F2937.
 */
export type ThemeColors = {
  /** CTA, active tab, links */
  primary: string;
  /** Press states, strong headers */
  primaryDark: string;
  /** Subtle highlights, chips */
  primaryLight: string;
  /** Save / like (heart) */
  accent: string;
  onPrimary: string;
  onAccent: string;
  background: string;
  /** Cards, sheets, search bar fill */
  surface: string;
  surfaceSecondary: string;
  surfaceMuted: string;
  surfaceHighlight: string;
  textPrimary: string;
  textSecondary: string;
  /** Input placeholder, hints */
  textPlaceholder: string;
  border: string;
  /** Applied / success, job salary */
  success: string;
  successBackground: string;
  warning: string;
  warningBackground: string;
  error: string;
  muted: string;
  badgeBackground: string;
  badgeText: string;
  shadow: string;
  gold: string;
  yellowBackground: string;
  amberBackground: string;
  progressTrack: string;
  progressMuted: string;
  /** Bottom tab inactive icon/label */
  tabInactive: string;
};

export const lightColors: ThemeColors = {
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  primaryLight: '#3B82F6',
  accent: '#EF4444',
  onPrimary: '#FFFFFF',
  onAccent: '#FFFFFF',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  surfaceMuted: '#F9FAFB',
  surfaceHighlight: '#EFF6FF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textPlaceholder: '#9CA3AF',
  border: '#E5E7EB',
  success: '#16A34A',
  successBackground: '#DCFCE7',
  warning: '#F59E0B',
  warningBackground: '#FEF3C7',
  error: '#DC2626',
  muted: '#D1D5DB',
  badgeBackground: 'rgba(37, 99, 235, 0.12)',
  badgeText: '#1E40AF',
  shadow: 'rgba(17, 24, 39, 0.08)',
  gold: '#FFD700',
  yellowBackground: '#FEF9C3',
  amberBackground: '#FDE68A',
  progressTrack: '#E5E7EB',
  progressMuted: '#D1D5DB',
  tabInactive: '#9CA3AF',
};

export const darkColors: ThemeColors = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  accent: '#F87171',
  onPrimary: '#FFFFFF',
  onAccent: '#111827',
  background: '#111827',
  surface: '#1F2937',
  surfaceSecondary: '#374151',
  surfaceMuted: '#1F2937',
  surfaceHighlight: '#1E3A5F',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textPlaceholder: '#6B7280',
  border: '#374151',
  success: '#22C55E',
  successBackground: '#14532D',
  warning: '#FBBF24',
  warningBackground: '#78350F',
  error: '#EF4444',
  muted: '#4B5563',
  badgeBackground: 'rgba(59, 130, 246, 0.2)',
  badgeText: '#BFDBFE',
  shadow: 'rgba(0, 0, 0, 0.35)',
  gold: '#FACC15',
  yellowBackground: '#422006',
  amberBackground: '#713F12',
  progressTrack: '#374151',
  progressMuted: '#4B5563',
  tabInactive: '#6B7280',
};
