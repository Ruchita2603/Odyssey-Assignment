import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, FlatList } from 'react-native';
import { colors, typography, spacing, radius, shadows, zIndex } from '@/design/tokens';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

interface SelectProps<T extends string = string> {
  value?: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  label,
  error,
  disabled,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable
        style={[styles.trigger, !!error && styles.triggerError, disabled && styles.triggerDisabled]}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
      >
        <Text style={[styles.triggerText, !selected && styles.placeholder]}>
          {selected?.label ?? placeholder}
        </Text>
        <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
      </Pressable>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.option, item.value === value && styles.optionSelected]}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionLabel,
                        item.value === value && styles.optionLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.description && (
                      <Text style={styles.optionDesc}>{item.description}</Text>
                    )}
                  </View>
                  {item.value === value && <Text style={styles.checkmark}>✓</Text>}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing[1.5] },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  trigger: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[3],
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.md,
    cursor: 'pointer' as never,
  },
  triggerError: { borderColor: colors.error },
  triggerDisabled: { opacity: 0.5, cursor: 'not-allowed' as never },
  triggerText: { fontSize: typography.sizes.base, color: colors.textPrimary },
  placeholder: { color: colors.textDisabled },
  chevron: { fontSize: typography.sizes.xs, color: colors.textTertiary },
  errorText: { fontSize: typography.sizes.xs, color: colors.error },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    zIndex: zIndex.dropdown,
  },
  menu: {
    backgroundColor: colors.bgSurfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    minWidth: 240,
    maxHeight: 320,
    ...shadows.lg,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    gap: spacing[3],
    cursor: 'pointer' as never,
  },
  optionSelected: { backgroundColor: colors.bgActive },
  optionContent: { flex: 1, gap: spacing[0.5] },
  optionLabel: { fontSize: typography.sizes.base, color: colors.textPrimary },
  optionLabelSelected: { color: colors.brand, fontWeight: typography.weights.medium },
  optionDesc: { fontSize: typography.sizes.xs, color: colors.textTertiary },
  checkmark: { color: colors.brand, fontSize: typography.sizes.base },
} as Record<string, object>);
