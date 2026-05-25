import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { colors, typography, spacing, radius, shadows, zIndex } from '@/design/tokens';
import { Button } from './Button';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function Modal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  style,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.container, styles[`size_${size}`], style]} onPress={() => {}}>
          {/* Header */}
          {(title || subtitle) && (
            <View style={styles.header}>
              <View style={styles.headerText}>
                {title && <Text style={styles.title}>{title}</Text>}
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
              <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>
          )}

          {/* Body */}
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {/* Footer */}
          {footer && <View style={styles.footer}>{footer}</View>}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <View style={styles.confirmFooter}>
          <Button variant="ghost" onPress={onClose} style={styles.footerBtn}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onPress={onConfirm} loading={loading} style={styles.footerBtn}>
            {confirmLabel}
          </Button>
        </View>
      }
    >
      <Text style={styles.confirmMessage}>{message}</Text>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    zIndex: zIndex.modal,
  },
  container: {
    backgroundColor: colors.bgSurfaceRaised,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    maxHeight: '90%' as never,
    width: '100%' as never,
    ...shadows.lg,
  },
  size_sm: { maxWidth: 400 },
  size_md: { maxWidth: 540 },
  size_lg: { maxWidth: 720 },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: spacing[5],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  headerText: { flex: 1, gap: spacing[1] },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  closeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    marginLeft: spacing[2],
    cursor: 'pointer' as never,
  },
  closeIcon: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
  },
  body: { flexShrink: 1 },
  bodyContent: { padding: spacing[5] },
  footer: {
    padding: spacing[5],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },

  confirmFooter: {
    flexDirection: 'row',
    gap: spacing[3],
    justifyContent: 'flex-end',
  },
  footerBtn: { minWidth: 96 },
  confirmMessage: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: typography.sizes.base * 1.5,
  },
} as Record<string, object>);
