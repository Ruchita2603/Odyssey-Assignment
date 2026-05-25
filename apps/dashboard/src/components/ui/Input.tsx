import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, typography, spacing, radius } from '@/design/tokens';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  leftElement,
  rightElement,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputWrapperFocused,
          !!error && styles.inputWrapperError,
          props.editable === false && styles.inputWrapperDisabled,
        ]}
      >
        {leftElement && <View style={styles.leftElement}>{leftElement}</View>}

        <TextInput
          style={[
            styles.input,
            leftElement ? styles.inputWithLeft : null,
            rightElement ? styles.inputWithRight : null,
          ]}
          placeholderTextColor={colors.textDisabled}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>

      {(error || hint) && (
        <Text style={[styles.helper, error ? styles.helperError : styles.helperHint]}>
          {error ?? hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[1.5],
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.md,
    overflow: 'hidden',
    transitionDuration: '150ms' as never,
  },
  inputWrapperFocused: {
    borderColor: colors.borderFocus,
    backgroundColor: colors.bgSurfaceRaised,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  inputWrapperDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing[3],
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    height: '100%' as never,
    outlineWidth: 0 as never,
  },
  inputWithLeft: {
    paddingLeft: spacing[1],
  },
  inputWithRight: {
    paddingRight: spacing[1],
  },
  leftElement: {
    paddingLeft: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightElement: {
    paddingRight: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  helper: {
    fontSize: typography.sizes.xs,
  },
  helperError: {
    color: colors.error,
  },
  helperHint: {
    color: colors.textTertiary,
  },
});
