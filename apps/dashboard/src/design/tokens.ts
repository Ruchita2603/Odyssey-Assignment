// ─── Design Tokens ────────────────────────────────────────────────────────────
// Single source of truth for all visual constants in the Odyssey dashboard.
// Never use raw values in components; always use these tokens.

// ─── Color Palette ────────────────────────────────────────────────────────────

const palette = {
  // Neutrals
  ink0: '#FFFFFF',
  ink50: '#F7F7F9',
  ink100: '#EDEDF2',
  ink200: '#D9D9E4',
  ink300: '#B4B4C8',
  ink400: '#8585A4',
  ink500: '#5C5C7A',
  ink600: '#3D3D58',
  ink700: '#28283D',
  ink800: '#16162A',
  ink900: '#0A0A0F',

  // Brand — warm amber
  brand50: '#FFF8EC',
  brand100: '#FFEEC8',
  brand200: '#FFD980',
  brand300: '#FFC140',
  brand400: '#F5A800',
  brand500: '#D48900',
  brand600: '#A86B00',
  brand700: '#7C4E00',
  brand800: '#4F3100',
  brand900: '#291900',

  // Semantic
  green50: '#EDFAF3',
  green400: '#22C55E',
  green600: '#16A34A',

  amber50: '#FFFBEB',
  amber400: '#FBBF24',
  amber600: '#D97706',

  red50: '#FEF2F2',
  red400: '#F87171',
  red600: '#DC2626',

  blue50: '#EFF6FF',
  blue400: '#60A5FA',
  blue600: '#2563EB',

  purple50: '#F5F3FF',
  purple400: '#A78BFA',
  purple600: '#7C3AED',
} as const;

// ─── Semantic Color Tokens ────────────────────────────────────────────────────

export const colors = {
  // Backgrounds
  bgBase: palette.ink900,
  bgSurface: palette.ink800,
  bgSurfaceRaised: palette.ink700,
  bgSurfaceOverlay: palette.ink600,
  bgHover: 'rgba(255,255,255,0.04)',
  bgActive: 'rgba(255,255,255,0.08)',

  // Text
  textPrimary: palette.ink0,
  textSecondary: palette.ink300,
  textTertiary: palette.ink400,
  textDisabled: palette.ink500,
  textInverse: palette.ink900,

  // Borders
  borderDefault: palette.ink700,
  borderStrong: palette.ink600,
  borderFocus: palette.brand400,

  // Brand
  brand: palette.brand400,
  brandHover: palette.brand300,
  brandMuted: 'rgba(245, 168, 0, 0.12)',

  // Semantic states
  success: palette.green400,
  successBg: 'rgba(34, 197, 94, 0.10)',
  warning: palette.amber400,
  warningBg: 'rgba(251, 191, 36, 0.10)',
  error: palette.red400,
  errorBg: 'rgba(248, 113, 113, 0.10)',
  info: palette.blue400,
  infoBg: 'rgba(96, 165, 250, 0.10)',

  // Order status colors
  statusPending: palette.amber400,
  statusPendingBg: 'rgba(251, 191, 36, 0.10)',
  statusConfirmed: palette.blue400,
  statusConfirmedBg: 'rgba(96, 165, 250, 0.10)',
  statusPreparing: palette.purple400,
  statusPreparingBg: 'rgba(167, 139, 250, 0.10)',
  statusReady: palette.green400,
  statusReadyBg: 'rgba(34, 197, 94, 0.10)',
  statusCompleted: palette.ink300,
  statusCompletedBg: 'rgba(180, 180, 200, 0.10)',
  statusCancelled: palette.red400,
  statusCancelledBg: 'rgba(248, 113, 113, 0.10)',
} as const;

export type ColorToken = keyof typeof colors;

// ─── Typography ───────────────────────────────────────────────────────────────

export const typography = {
  families: {
    sans: 'System', // System default, override with custom font
    mono: 'Courier',
  },
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
  },
  letterSpacings: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────
// 4px base unit

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

export type SpacingToken = keyof typeof spacing;

// ─── Radius ───────────────────────────────────────────────────────────────────

export const radius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// ─── Shadows / Elevation ──────────────────────────────────────────────────────

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  brand: {
    shadowColor: palette.brand400,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

// ─── Animation ────────────────────────────────────────────────────────────────

export const animation = {
  durationFast: 100,
  durationNormal: 200,
  durationSlow: 350,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ─── Layout ───────────────────────────────────────────────────────────────────

export const layout = {
  sidebarWidth: 240,
  sidebarCollapsedWidth: 64,
  headerHeight: 60,
  contentMaxWidth: 1280,
  pagePadding: spacing[6],
  cardPadding: spacing[5],
  tableCellPadding: spacing[4],
} as const;

// ─── Z-index ──────────────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
} as const;
