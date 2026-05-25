import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { colors, typography, spacing, radius, shadows } from './tokens';

// ─── Text style presets ───────────────────────────────────────────────────────

export const textStyles = StyleSheet.create({
  displayLg: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacings.tighter,
    lineHeight: typography.sizes['4xl'] * typography.lineHeights.tight,
  },
  displayMd: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacings.tight,
    lineHeight: typography.sizes['3xl'] * typography.lineHeights.tight,
  },
  h1: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacings.tight,
  },
  h2: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  h4: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  bodyLg: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: colors.textPrimary,
    lineHeight: typography.sizes.md * typography.lineHeights.normal,
  },
  body: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    color: colors.textPrimary,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  bodySm: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  caption: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textTertiary,
    letterSpacing: typography.letterSpacings.wide,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    letterSpacing: typography.letterSpacings.wide,
    textTransform: 'uppercase',
  },
  mono: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.mono,
    color: colors.textPrimary,
  },
} satisfies Record<string, TextStyle>);

// ─── Surface presets ──────────────────────────────────────────────────────────

export const surfaceStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing[5],
  },
  cardRaised: {
    backgroundColor: colors.bgSurfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing[5],
    ...shadows.md,
  },
  cardFlat: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    padding: spacing[4],
  },
  overlay: {
    backgroundColor: colors.bgSurfaceOverlay,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.lg,
  },
} satisfies Record<string, ViewStyle>);

// ─── Row / layout utilities ───────────────────────────────────────────────────

export const layoutStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowEnd: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  rowGap4: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  rowGap8: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  rowGap12: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  col: { flexDirection: 'column' },
  colGap4: { flexDirection: 'column', gap: spacing[1] },
  colGap8: { flexDirection: 'column', gap: spacing[2] },
  colGap12: { flexDirection: 'column', gap: spacing[3] },
  colGap16: { flexDirection: 'column', gap: spacing[4] },
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
} satisfies Record<string, ViewStyle>);
