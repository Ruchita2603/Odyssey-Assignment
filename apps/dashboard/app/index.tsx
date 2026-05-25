import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useDashboardSummary, useOrders } from '@odyssey/api-client';
import { formatCents, formatDateTime } from '@odyssey/shared';
import { colors, typography, spacing } from '@/design/tokens';
import type { Order } from '@odyssey/types';

export default function HomeScreen() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: activeOrders } = useOrders({ status: 'preparing', limit: 5 });
  const { data: pendingOrders } = useOrders({ status: 'pending', limit: 5 });
  const router = useRouter();

  const liveOrders = [
    ...(activeOrders?.data ?? []),
    ...(pendingOrders?.data ?? []),
  ].slice(0, 8);

  return (
    <PageLayout
      title="Good evening 👋"
      subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
    >
      {/* KPI Grid */}
      <View style={styles.kpiGrid}>
        <StatCard
          title="Total Orders"
          value={summary?.totalOrders ?? '—'}
          icon="📋"
          accent={colors.info}
          loading={summaryLoading}
        />
        <StatCard
          title="Total Revenue"
          value={summary ? formatCents(summary.totalRevenue) : '—'}
          icon="💰"
          accent={colors.success}
          loading={summaryLoading}
        />
        <StatCard
          title="Pending"
          value={summary?.pendingOrders ?? '—'}
          icon="⏳"
          accent={colors.warning}
          loading={summaryLoading}
        />
        <StatCard
          title="Today's Revenue"
          value={summary ? formatCents(summary.revenueToday) : '—'}
          icon="📈"
          accent={colors.brand}
          loading={summaryLoading}
        />
        <StatCard
          title="Completed Today"
          value={summary?.completedOrdersToday ?? '—'}
          icon="✅"
          accent={colors.success}
          loading={summaryLoading}
        />
        <StatCard
          title="Preparing"
          value={summary?.preparingOrders ?? '—'}
          icon="🔥"
          accent={colors.info}
          loading={summaryLoading}
        />
      </View>

      {/* Two-column lower section */}
      <View style={styles.lowerGrid}>
        {/* Live Orders */}
        <Card style={styles.liveCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Orders</Text>
            <Pressable onPress={() => router.push('/orders')}>
              <Text style={styles.viewAll}>View all →</Text>
            </Pressable>
          </View>
          {liveOrders.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>No active orders right now</Text>
            </View>
          ) : (
            <FlatList
              data={liveOrders}
              keyExtractor={(o) => String(o.id)}
              scrollEnabled={false}
              renderItem={({ item }) => <LiveOrderRow order={item} onPress={() => router.push(`/orders/${item.id}` as never)} />}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </Card>

        {/* Popular Items */}
        <Card style={styles.popularCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Items</Text>
          </View>
          {summaryLoading ? (
            <SkeletonCard />
          ) : summary?.popularItems.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>No data yet</Text>
            </View>
          ) : (
            <View style={styles.popularList}>
              {summary?.popularItems.map((item, i) => (
                <View key={item.menuItemId} style={styles.popularRow}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.popularName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.popularCount}>{item.orderCount} orders</Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      </View>
    </PageLayout>
  );
}

function LiveOrderRow({ order, onPress }: { order: Order; onPress: () => void }) {
  return (
    <Pressable style={({ hovered }) => [styles.liveRow, (hovered as boolean | undefined) && styles.liveRowHover]} onPress={onPress}>
      <View style={styles.liveRowLeft}>
        <Text style={styles.orderId}>#{order.id}</Text>
        <Text style={styles.orderCustomer} numberOfLines={1}>
          {order.customer?.name ?? 'Walk-in'}
        </Text>
        <Text style={styles.orderTime}>{formatDateTime(order.createdAt)}</Text>
      </View>
      <View style={styles.liveRowRight}>
        <StatusBadge status={order.status} />
        <Text style={styles.orderTotal}>{formatCents(order.total)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
  },
  lowerGrid: {
    flexDirection: 'row',
    gap: spacing[4],
    flexWrap: 'wrap',
  },
  liveCard: { flex: 2, minWidth: 320, padding: spacing[5] },
  popularCard: { flex: 1, minWidth: 240, padding: spacing[5] },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  viewAll: {
    fontSize: typography.sizes.sm,
    color: colors.brand,
    cursor: 'pointer' as never,
  },
  separator: { height: 1, backgroundColor: colors.borderDefault },
  emptySection: { paddingVertical: spacing[8], alignItems: 'center' },
  emptyText: { color: colors.textTertiary, fontSize: typography.sizes.sm },

  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[1],
    borderRadius: 6,
    cursor: 'pointer' as never,
  },
  liveRowHover: { backgroundColor: colors.bgHover },
  liveRowLeft: { gap: spacing[0.5] },
  liveRowRight: { alignItems: 'flex-end', gap: spacing[1] },
  orderId: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.textPrimary },
  orderCustomer: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  orderTime: { fontSize: typography.sizes.xs, color: colors.textTertiary },
  orderTotal: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary },

  popularList: { gap: spacing[3] },
  popularRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.bgSurfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.textTertiary },
  popularName: { flex: 1, fontSize: typography.sizes.sm, color: colors.textPrimary },
  popularCount: { fontSize: typography.sizes.xs, color: colors.textTertiary },
});
