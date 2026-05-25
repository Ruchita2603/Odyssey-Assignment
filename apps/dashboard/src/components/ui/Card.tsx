import React from 'react';
import { View, StyleSheet, type ViewProps, type ViewStyle } from 'react-native';
import { colors, spacing, radius, shadows } from '@/design/tokens';

type CardVariant = 'default' | 'raised' | 'flat' | 'brand';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: number;
  style?: ViewStyle;
}

export function Card({ variant = 'default', padding, style, children, ...props }: CardProps) {
  return (
    <View
      style={[styles.base, styles[`variant_${variant}`], padding !== undefined && { padding }, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  variant_default: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.borderDefault,
    padding: spacing[5],
  },
  variant_raised: {
    backgroundColor: colors.bgSurfaceRaised,
    borderColor: colors.borderStrong,
    padding: spacing[5],
    ...shadows.md,
  },
  variant_flat: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.borderDefault,
    padding: spacing[4],
  },
  variant_brand: {
    backgroundColor: colors.brandMuted,
    borderColor: `${colors.brand}25`,
    padding: spacing[5],
  },
} as Record<string, object>);
