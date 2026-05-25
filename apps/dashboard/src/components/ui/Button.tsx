import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors, typography, spacing, radius } from '@/design/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'brand';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  children,
  fullWidth,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed, hovered }) => [
        styles.base,
        styles[`variant_${variant}`],
        styles[`size_${size}`],
        pressed && styles[`pressed_${variant}`],
        (hovered as boolean | undefined) && styles[`hover_${variant}`],
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'brand' ? colors.textInverse : colors.textPrimary}
        />
      ) : (
        <>
          {leftIcon}
          {typeof children === 'string' ? (
            <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>
              {children}
            </Text>
          ) : (
            children
          )}
          {rightIcon}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderColor: 'transparent',
    cursor: 'pointer' as never,
    userSelect: 'none' as never,
    transitionDuration: '150ms' as never,
  } as ViewStyle,

  // Variants
  variant_primary: {
    backgroundColor: colors.bgSurfaceRaised,
    borderColor: colors.borderStrong,
  },
  variant_secondary: {
    backgroundColor: 'transparent',
    borderColor: colors.borderDefault,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: colors.errorBg,
    borderColor: colors.error,
  },
  variant_brand: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },

  // Hover
  hover_primary: { backgroundColor: colors.bgActive, borderColor: colors.borderStrong },
  hover_secondary: { backgroundColor: colors.bgHover, borderColor: colors.borderStrong },
  hover_ghost: { backgroundColor: colors.bgHover },
  hover_danger: { backgroundColor: 'rgba(248, 113, 113, 0.18)', borderColor: colors.error },
  hover_brand: { backgroundColor: colors.brandHover, borderColor: colors.brandHover },

  // Pressed
  pressed_primary: { opacity: 0.7 },
  pressed_secondary: { opacity: 0.7 },
  pressed_ghost: { opacity: 0.6 },
  pressed_danger: { opacity: 0.7 },
  pressed_brand: { opacity: 0.85 },

  // Sizes
  size_sm: { height: 32, paddingHorizontal: spacing[3], borderRadius: radius.sm },
  size_md: { height: 40, paddingHorizontal: spacing[4], borderRadius: radius.md },
  size_lg: { height: 48, paddingHorizontal: spacing[6], borderRadius: radius.lg },

  disabled: { opacity: 0.4, cursor: 'not-allowed' as never },
  fullWidth: { width: '100%' as never },

  text: {
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacings.normal,
  },
  text_primary: { color: colors.textPrimary },
  text_secondary: { color: colors.textSecondary },
  text_ghost: { color: colors.textSecondary },
  text_danger: { color: colors.error },
  text_brand: { color: colors.textInverse },

  textSize_sm: { fontSize: typography.sizes.sm },
  textSize_md: { fontSize: typography.sizes.base },
  textSize_lg: { fontSize: typography.sizes.md },
} as Record<string, ViewStyle | TextStyle>);
