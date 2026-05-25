import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '@/design/tokens';
import type { OrderStatus } from '@odyssey/types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand' | OrderStatus;
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  dot?: boolean;
}

const STATUS_VARIANT_MAP: Record<OrderStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'brand',
  ready: 'success',
  completed: 'default',
  cancelled: 'error',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const labels: Record<OrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return (
    <Badge variant={STATUS_VARIANT_MAP[status]} dot>
      {labels[status]}
    </Badge>
  );
}

export function Badge({ variant = 'default', size = 'md', children, dot }: BadgeProps) {
  const mappedVariant: BadgeVariant =
    variant in STATUS_VARIANT_MAP
      ? STATUS_VARIANT_MAP[variant as OrderStatus]
      : variant;

  return (
    <View style={[styles.base, styles[`variant_${mappedVariant}`], styles[`size_${size}`]]}>
      {dot && (
        <View
          style={[styles.dot, styles[`dotColor_${mappedVariant}`]]}
        />
      )}
      <Text style={[styles.text, styles[`textColor_${mappedVariant}`], styles[`textSize_${size}`]]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    gap: spacing[1.5],
    borderWidth: 1,
  },
  size_sm: { paddingHorizontal: spacing[2], paddingVertical: spacing[0.5] },
  size_md: { paddingHorizontal: spacing[3], paddingVertical: spacing[1] },

  variant_default: { backgroundColor: colors.bgSurfaceRaised, borderColor: colors.borderDefault },
  variant_success: { backgroundColor: colors.successBg, borderColor: `${colors.success}30` },
  variant_warning: { backgroundColor: colors.warningBg, borderColor: `${colors.warning}30` },
  variant_error: { backgroundColor: colors.errorBg, borderColor: `${colors.error}30` },
  variant_info: { backgroundColor: colors.infoBg, borderColor: `${colors.info}30` },
  variant_brand: { backgroundColor: colors.brandMuted, borderColor: `${colors.brand}30` },

  dot: { width: 6, height: 6, borderRadius: 3 },
  dotColor_default: { backgroundColor: colors.textSecondary },
  dotColor_success: { backgroundColor: colors.success },
  dotColor_warning: { backgroundColor: colors.warning },
  dotColor_error: { backgroundColor: colors.error },
  dotColor_info: { backgroundColor: colors.info },
  dotColor_brand: { backgroundColor: colors.brand },

  text: { fontWeight: typography.weights.medium },
  textColor_default: { color: colors.textSecondary },
  textColor_success: { color: colors.success },
  textColor_warning: { color: colors.warning },
  textColor_error: { color: colors.error },
  textColor_info: { color: colors.info },
  textColor_brand: { color: colors.brand },

  textSize_sm: { fontSize: typography.sizes.xs },
  textSize_md: { fontSize: typography.sizes.sm },
} as Record<string, object>);
