import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { CreateOrderModal } from '@/components/features/CreateOrderModal';
import { useOrders } from '@odyssey/api-client';
import { formatCents, formatDateTime } from '@odyssey/shared';
import { colors, typography, spacing, radius } from '@/design/tokens';
import type { Order, OrderStatus } from '@odyssey/types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrdersScreen() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, isFetching } = useOrders({
    status: statusFilter || undefined,
    page,
    limit: 20,
  });

  const orders = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <PageLayout
      title="Orders"
      subtitle={`${total} total orders`}
      scrollable={false}
      noPadding
      actions={
        <Button variant="brand" onPress={() => setShowCreate(true)} leftIcon={<Text style={{ color: '#0A0A0F', fontSize: 16 }}>+</Text>}>
          New Order
        </Button>
      }
    >
      {/* Filter bar */}
      <View style={styles.filterBar}>
        <Select
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          options={STATUS_OPTIONS}
          placeholder="Filter by status"
        />
        {isFetching && !isLoading && (
          <Text style={styles.refreshing}>Refreshing…</Text>
        )}
      </View>

      {/* Table */}
      {isLoading ? (
        <View style={styles.tableWrapper}>
          <TableHeader />
          <SkeletonTable rows={8} />
        </View>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No orders found"
          description={statusFilter ? `No ${statusFilter} orders.` : 'Orders will appear here once placed.'}
          action={statusFilter ? { label: 'Clear filter', onPress: () => setStatusFilter('') } : undefined}
        />
      ) : (
        <View style={styles.tableWrapper}>
          <TableHeader />
          <FlatList
            data={orders}
            keyExtractor={(o) => String(o.id)}
            renderItem={({ item, index }) => (
              <OrderRow
                order={item}
                even={index % 2 === 0}
                onPress={() => router.push(`/orders/${item.id}` as never)}
              />
            )}
          />
          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <Button variant="ghost" size="sm" disabled={page <= 1} onPress={() => setPage(p => p - 1)}>← Prev</Button>
              <Text style={styles.pageInfo}>Page {page} of {totalPages}</Text>
              <Button variant="ghost" size="sm" disabled={page >= totalPages} onPress={() => setPage(p => p + 1)}>Next →</Button>
            </View>
          )}
        </View>
      )}

      <CreateOrderModal visible={showCreate} onClose={() => setShowCreate(false)} />
    </PageLayout>
  );
}

function TableHeader() {
  return (
    <View style={styles.tableHeader}>
      <Text style={[styles.th, { flex: 0.5 }]}>#</Text>
      <Text style={[styles.th, { flex: 1.5 }]}>Customer</Text>
      <Text style={[styles.th, { flex: 1 }]}>Status</Text>
      <Text style={[styles.th, { flex: 1 }]}>Items</Text>
      <Text style={[styles.th, { flex: 1 }]}>Total</Text>
      <Text style={[styles.th, { flex: 1.2 }]}>Placed</Text>
    </View>
  );
}

function OrderRow({ order, even, onPress }: { order: Order; even: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={({ hovered }) => [styles.tableRow, even && styles.tableRowEven, (hovered as boolean | undefined) && styles.tableRowHover]}
      onPress={onPress}
    >
      <Text style={[styles.td, styles.tdId, { flex: 0.5 }]}>#{order.id}</Text>
      <Text style={[styles.td, { flex: 1.5 }]} numberOfLines={1}>
        {order.customer?.name ?? 'Walk-in'}
      </Text>
      <View style={{ flex: 1 }}>
        <StatusBadge status={order.status as OrderStatus} />
      </View>
      <Text style={[styles.td, { flex: 1 }]}>{order.items?.length ?? 0} items</Text>
      <Text style={[styles.td, styles.tdAmount, { flex: 1 }]}>{formatCents(order.total)}</Text>
      <Text style={[styles.td, styles.tdMuted, { flex: 1.2 }]}>{formatDateTime(order.createdAt)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  refreshing: { fontSize: typography.sizes.xs, color: colors.textTertiary },
  tableWrapper: { flex: 1 },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    backgroundColor: colors.bgSurface,
  },
  th: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    cursor: 'pointer' as never,
  },
  tableRowEven: { backgroundColor: 'rgba(255,255,255,0.01)' },
  tableRowHover: { backgroundColor: colors.bgHover },
  td: { fontSize: typography.sizes.sm, color: colors.textPrimary },
  tdId: { fontWeight: typography.weights.semibold, color: colors.textTertiary },
  tdAmount: { fontWeight: typography.weights.semibold },
  tdMuted: { color: colors.textTertiary },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
  pageInfo: { fontSize: typography.sizes.sm, color: colors.textSecondary },
});
