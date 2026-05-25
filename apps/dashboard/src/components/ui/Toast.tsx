import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';
import { Animated, View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows, zIndex } from '@/design/tokens';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration = 3500) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-4), { id, message, variant, duration }]);
    },
    [],
  );

  const value: ToastContextValue = {
    toast,
    success: (m) => toast(m, 'success'),
    error: (m) => toast(m, 'error'),
    warning: (m) => toast(m, 'warning'),
    info: (m) => toast(m, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 120, friction: 8 }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
        onDismiss(toast.id),
      );
    }, toast.duration ?? 3500);

    return () => clearTimeout(timer);
  }, []);

  const icons: Record<ToastVariant, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <Animated.View style={[styles.toast, styles[`toast_${toast.variant}`], { opacity, transform: [{ translateY }] }]}>
      <Text style={[styles.icon, styles[`icon_${toast.variant}`]]}>{icons[toast.variant]}</Text>
      <Text style={styles.message} numberOfLines={3}>{toast.message}</Text>
      <Pressable onPress={() => onDismiss(toast.id)} hitSlop={8}>
        <Text style={styles.dismiss}>✕</Text>
      </Pressable>
    </Animated.View>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as never,
    bottom: spacing[6],
    right: spacing[6],
    gap: spacing[2],
    zIndex: zIndex.toast,
    pointerEvents: 'box-none' as never,
    maxWidth: 400,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    minWidth: 280,
    ...shadows.md,
  },
  toast_success: { backgroundColor: colors.successBg, borderColor: `${colors.success}40` },
  toast_error: { backgroundColor: colors.errorBg, borderColor: `${colors.error}40` },
  toast_warning: { backgroundColor: colors.warningBg, borderColor: `${colors.warning}40` },
  toast_info: { backgroundColor: colors.infoBg, borderColor: `${colors.info}40` },

  icon: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold },
  icon_success: { color: colors.success },
  icon_error: { color: colors.error },
  icon_warning: { color: colors.warning },
  icon_info: { color: colors.info },

  message: { flex: 1, fontSize: typography.sizes.sm, color: colors.textPrimary, lineHeight: typography.sizes.sm * 1.4 },
  dismiss: { fontSize: typography.sizes.xs, color: colors.textTertiary, padding: spacing[1] },
} as Record<string, object>);
