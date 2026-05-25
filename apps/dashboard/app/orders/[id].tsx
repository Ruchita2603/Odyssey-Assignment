import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import { useOrder, useOrderAction } from '@odyssey/api-client';
import { useToast } from '@/components/ui/Toast';
import { formatCents, formatDateTime, getAvailableActions } from '@odyssey/shared';
import { colors, typography, spacing, radius } from '@/design/tokens';
import type { OrderStatus } from '@odyssey/types';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [confirmAction, setConfirmAction] = useState<{ action: string; label: string; variant: 'primary' | 'danger' } | null>(null);

  const { data: order, isLoading } = useOrder(Number(id));
  const { mutate: doAction, isPending } = useOrderAction({
    onSuccess: (updated) => {
      toast(`Order #${updated.id} updated to ${updated.status}`, 'success');
      setConfirmAction(null);
    },
    onError: (err) => toast(err.error ?? 'Action failed', 'error'),
  });

  if (isLoading) {
    return (
      <PageLayout title="Order">
        <Text style={styles.loading}>Loading…</Text>
      </PageLayout>
    );
  }

  if (!order) {
    return (
      <PageLayout title="Order not found">
        <Button variant="ghost" onPress={() => router.back()}>← Back to Orders</Button>
      </PageLayout>
    );
  }

  const availableActions = getAvailableActions(order.status as OrderStatus);

  return (
    <PageLayout
      title={`Order #${order.id}`}
      subtitle={`Placed ${formatDateTime(order.createdAt)}`}
      actions={
        <Button variant="ghost" size="sm" onPress={() => router.back()}>← Orders</Button>
      }
    >
      {/* Status & Actions row */}
      <View style={styles.topRow}>
        <View style={styles.statusBlock}>
          <Text style={styles.fieldLabel}>Status</Text>
          <StatusBadge status={order.status as OrderStatus} />
        </View>
        <View style={styles.actionsRow}>
          {availableActions.map((a) => (
            <Button
              key={a.action}
              variant={a.variant === 'danger' ? 'danger' : 'brand'}
              size="sm"
              onPress={() => setConfirmAction(a)}
              loading={isPending && confirmAction?.action === a.action}
            >
              {a.label}
            </Button>
          ))}
        </View>
      </View>

      <View style={styles.grid}>
        {/* Order Items */}
        <Card style={styles.itemsCard}>
          <Text style={styles.cardTitle}>Order Items</Text>
          {order.items?.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemQty}>×{item.quantity}</Text>
                <View>
                  <Text style={styles.itemName}>{item.menuItem?.name ?? `Item #${item.menuItemId}`}</Text>
                  <Text style={styles.itemUnit}>{formatCents(item.unitPrice)} each</Text>
                </View>
              </View>
              <Text style={styles.itemSubtotal}>{formatCents(item.subtotal)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCents(order.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.grandTotal]}>Total</Text>
            <Text style={[styles.totalValue, styles.grandTotal]}>{formatCents(order.total)}</Text>
          </View>
        </Card>

        {/* Customer & Meta */}
        <View style={styles.sideColumn}>
          <Card>
            <Text style={styles.cardTitle}>Customer</Text>
            {order.customer ? (
              <View style={styles.customerBlock}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.avatarText}>
                    {order.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.customerName}>{order.customer.name}</Text>
                  {order.customer.email && <Text style={styles.customerMeta}>{order.customer.email}</Text>}
                  {order.customer.phone && <Text style={styles.customerMeta}>{order.customer.phone}</Text>}
                </View>
              </View>
            ) : (
              <Text style={styles.walkIn}>Walk-in customer</Text>
            )}
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Order ID</Text>
                <Text style={styles.detailVal}>#{order.id}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Created</Text>
                <Text style={styles.detailVal}>{formatDateTime(order.createdAt)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Updated</Text>
                <Text style={styles.detailVal}>{formatDateTime(order.updatedAt)}</Text>
              </View>
              {order.notes && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Notes</Text>
                  <Text style={styles.detailVal}>{order.notes}</Text>
                </View>
              )}
            </View>
          </Card>
        </View>
      </View>

      {/* Confirm action modal */}
      <ConfirmModal
        visible={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction && doAction({ id: order.id, action: confirmAction.action })}
        title={confirmAction?.label ?? ''}
        message={`Are you sure you want to ${confirmAction?.label?.toLowerCase()} order #${order.id}?`}
        confirmLabel={confirmAction?.label ?? 'Confirm'}
        variant={confirmAction?.variant === 'danger' ? 'danger' : 'primary'}
        loading={isPending}
      />
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  loading: { color: colors.textTertiary, padding: spacing[8], textAlign: 'center' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing[4],
  },
  statusBlock: { gap: spacing[2] },
  fieldLabel: { fontSize: typography.sizes.xs, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8 },
  actionsRow: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' },
  grid: { flexDirection: 'row', gap: spacing[5], flexWrap: 'wrap' },
  itemsCard: { flex: 2, minWidth: 320, gap: spacing[3] },
  sideColumn: { flex: 1, minWidth: 240, gap: spacing[4] },
  cardTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.textPrimary, marginBottom: spacing[4] },

  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[2] },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], flex: 1 },
  itemQty: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.textTertiary, width: 28 },
  itemName: { fontSize: typography.sizes.base, color: colors.textPrimary, fontWeight: typography.weights.medium },
  itemUnit: { fontSize: typography.sizes.xs, color: colors.textTertiary },
  itemSubtotal: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary },

  divider: { height: 1, backgroundColor: colors.borderDefault, marginVertical: spacing[3] },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[1] },
  totalLabel: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  totalValue: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  grandTotal: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.textPrimary },

  customerBlock: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  customerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.brandMuted,
    borderWidth: 1, borderColor: `${colors.brand}30`,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.brand },
  customerName: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  customerMeta: { fontSize: typography.sizes.xs, color: colors.textTertiary, marginTop: 2 },
  walkIn: { fontSize: typography.sizes.sm, color: colors.textTertiary, fontStyle: 'italic' },

  detailsGrid: { gap: spacing[3] },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing[4] },
  detailKey: { fontSize: typography.sizes.sm, color: colors.textTertiary },
  detailVal: { fontSize: typography.sizes.sm, color: colors.textPrimary, flex: 1, textAlign: 'right' },
});
