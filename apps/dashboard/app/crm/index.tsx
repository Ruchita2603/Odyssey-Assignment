import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Modal as RNModal, ScrollView } from 'react-native';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useCustomers, useCustomer, useCreateCustomer } from '@odyssey/api-client';
import { useToast } from '@/components/ui/Toast';
import { formatCents, formatDate, initials } from '@odyssey/shared';
import { colors, typography, spacing, radius } from '@/design/tokens';
import type { CustomerSummary, OrderStatus } from '@odyssey/types';

export default function CRMScreen() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useCustomers({ page, limit: 20 });
  const customers = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <PageLayout
      title="CRM"
      subtitle={`${total} customers`}
      scrollable={false}
      noPadding
      actions={
        <Button variant="brand" onPress={() => setShowCreate(true)}>+ Customer</Button>
      }
    >
      {isLoading ? (
        <View style={styles.tableWrapper}>
          <TableHeader />
          <SkeletonTable rows={8} />
        </View>
      ) : customers.length === 0 ? (
        <EmptyState icon="👥" title="No customers yet" description="Customer records will appear here." />
      ) : (
        <View style={styles.tableWrapper}>
          <TableHeader />
          <FlatList
            data={customers}
            keyExtractor={(c) => String(c.id)}
            renderItem={({ item, index }) => (
              <CustomerRow
                customer={item}
                even={index % 2 === 0}
                onPress={() => setSelectedCustomer(item)}
              />
            )}
          />
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <Button variant="ghost" size="sm" disabled={page <= 1} onPress={() => setPage(p => p - 1)}>← Prev</Button>
              <Text style={styles.pageInfo}>Page {page} of {totalPages}</Text>
              <Button variant="ghost" size="sm" disabled={page >= totalPages} onPress={() => setPage(p => p + 1)}>Next →</Button>
            </View>
          )}
        </View>
      )}

      {selectedCustomer && (
        <CustomerDrawer customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}

      <CreateCustomerModal visible={showCreate} onClose={() => setShowCreate(false)} />
    </PageLayout>
  );
}

function TableHeader() {
  return (
    <View style={styles.tableHeader}>
      <Text style={[styles.th, { flex: 2 }]}>Customer</Text>
      <Text style={[styles.th, { flex: 1.5 }]}>Email</Text>
      <Text style={[styles.th, { flex: 0.8 }]}>Orders</Text>
      <Text style={[styles.th, { flex: 1 }]}>Total Spend</Text>
      <Text style={[styles.th, { flex: 1 }]}>Joined</Text>
    </View>
  );
}

function CustomerRow({ customer, even, onPress }: { customer: CustomerSummary; even: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={({ hovered }) => [styles.tableRow, even && styles.rowEven, (hovered as boolean | undefined) && styles.rowHover]}
      onPress={onPress}
    >
      <View style={[styles.customerCell, { flex: 2 }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(customer.name)}</Text>
        </View>
        <View>
          <Text style={styles.customerName}>{customer.name}</Text>
          {customer.phone && <Text style={styles.customerPhone}>{customer.phone}</Text>}
        </View>
      </View>
      <Text style={[styles.td, { flex: 1.5 }]} numberOfLines={1}>{customer.email ?? '—'}</Text>
      <Text style={[styles.td, styles.orderCount, { flex: 0.8 }]}>{customer.orderCount}</Text>
      <Text style={[styles.td, styles.spend, { flex: 1 }]}>{formatCents(customer.totalSpend)}</Text>
      <Text style={[styles.td, styles.muted, { flex: 1 }]}>{formatDate(customer.createdAt)}</Text>
    </Pressable>
  );
}

function CustomerDrawer({ customer, onClose }: { customer: CustomerSummary; onClose: () => void }) {
  const { data } = useCustomer(customer.id);

  return (
    <RNModal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.drawerBackdrop}>
        <Pressable style={styles.drawerBackdropPressable} onPress={onClose} />
        <View style={styles.drawer}>
          <View style={styles.drawerHeader}>
            <View style={styles.drawerAvatar}>
              <Text style={styles.drawerAvatarText}>{initials(customer.name)}</Text>
            </View>
            <View style={styles.drawerInfo}>
              <Text style={styles.drawerName}>{customer.name}</Text>
              {customer.email && <Text style={styles.drawerMeta}>{customer.email}</Text>}
              {customer.phone && <Text style={styles.drawerMeta}>{customer.phone}</Text>}
            </View>
            <Button variant="ghost" size="sm" onPress={onClose}>✕</Button>
          </View>

          <View style={styles.drawerStats}>
            <View style={styles.drawerStat}>
              <Text style={styles.drawerStatValue}>{customer.orderCount}</Text>
              <Text style={styles.drawerStatLabel}>Orders</Text>
            </View>
            <View style={styles.drawerStatDivider} />
            <View style={styles.drawerStat}>
              <Text style={styles.drawerStatValue}>{formatCents(customer.totalSpend)}</Text>
              <Text style={styles.drawerStatLabel}>Total Spend</Text>
            </View>
          </View>

          <Text style={styles.drawerSectionTitle}>Recent Orders</Text>
          <ScrollView style={styles.drawerOrders}>
            {data?.recentOrders?.length === 0 ? (
              <Text style={styles.noOrders}>No orders yet</Text>
            ) : (
              data?.recentOrders?.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderCardTop}>
                    <Text style={styles.orderCardId}>#{order.id}</Text>
                    <StatusBadge status={order.status as OrderStatus} />
                    <Text style={styles.orderCardTotal}>{formatCents(order.total)}</Text>
                  </View>
                  <Text style={styles.orderCardDate}>{formatDate(order.createdAt)}</Text>
                  {order.items?.length && (
                    <Text style={styles.orderCardItems} numberOfLines={1}>
                      {order.items.map(i => i.menuItem?.name ?? `Item #${i.menuItemId}`).join(', ')}
                    </Text>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

function CreateCustomerModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const { mutate, isPending } = useCreateCustomer({
    onSuccess: () => { toast('Customer created', 'success'); setName(''); setEmail(''); setPhone(''); onClose(); },
    onError: (e) => toast(e.error, 'error'),
  });

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="New Customer"
      size="sm"
      footer={
        <View style={{ flexDirection: 'row', gap: spacing[3], justifyContent: 'flex-end' }}>
          <Button variant="ghost" onPress={onClose}>Cancel</Button>
          <Button variant="brand" onPress={() => { if (!name.trim()) { toast('Name required', 'warning'); return; } mutate({ name: name.trim(), email: email || undefined, phone: phone || undefined }); }} loading={isPending}>Create</Button>
        </View>
      }
    >
      <View style={{ gap: spacing[4] }}>
        <Input label="Name *" value={name} onChangeText={setName} placeholder="Full name" />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="customer@email.com" keyboardType="email-address" />
        <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="+1 555 000 0000" keyboardType="phone-pad" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tableWrapper: { flex: 1 },
  tableHeader: { flexDirection: 'row', paddingHorizontal: spacing[6], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.borderDefault, backgroundColor: colors.bgSurface },
  th: { fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[6], paddingVertical: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.borderDefault, cursor: 'pointer' as never },
  rowEven: { backgroundColor: 'rgba(255,255,255,0.01)' },
  rowHover: { backgroundColor: colors.bgHover },
  td: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  customerCell: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.brandMuted, borderWidth: 1, borderColor: `${colors.brand}30`, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.brand },
  customerName: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  customerPhone: { fontSize: typography.sizes.xs, color: colors.textTertiary },
  orderCount: { fontWeight: typography.weights.semibold, color: colors.textPrimary },
  spend: { fontWeight: typography.weights.semibold, color: colors.success },
  muted: { color: colors.textTertiary },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[4], paddingVertical: spacing[4], borderTopWidth: 1, borderTopColor: colors.borderDefault },
  pageInfo: { fontSize: typography.sizes.sm, color: colors.textSecondary },

  drawerBackdrop: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)' },
  drawerBackdropPressable: { flex: 1 },
  drawer: { width: 400, backgroundColor: colors.bgSurfaceRaised, borderLeftWidth: 1, borderLeftColor: colors.borderStrong, padding: spacing[6], gap: spacing[5] },
  drawerHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[4] },
  drawerAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.brandMuted, borderWidth: 1, borderColor: `${colors.brand}30`, alignItems: 'center', justifyContent: 'center' },
  drawerAvatarText: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.brand },
  drawerInfo: { flex: 1, gap: spacing[1] },
  drawerName: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textPrimary },
  drawerMeta: { fontSize: typography.sizes.sm, color: colors.textTertiary },
  drawerStats: { flexDirection: 'row', backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderDefault, padding: spacing[4] },
  drawerStat: { flex: 1, alignItems: 'center', gap: spacing[1] },
  drawerStatValue: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.textPrimary },
  drawerStatLabel: { fontSize: typography.sizes.xs, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8 },
  drawerStatDivider: { width: 1, backgroundColor: colors.borderDefault, marginHorizontal: spacing[4] },
  drawerSectionTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  drawerOrders: { flex: 1 },
  noOrders: { color: colors.textTertiary, fontSize: typography.sizes.sm, textAlign: 'center', paddingVertical: spacing[8] },
  orderCard: { backgroundColor: colors.bgSurface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderDefault, padding: spacing[4], marginBottom: spacing[3], gap: spacing[1] },
  orderCardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  orderCardId: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.textTertiary },
  orderCardTotal: { marginLeft: 'auto' as never, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  orderCardDate: { fontSize: typography.sizes.xs, color: colors.textTertiary },
  orderCardItems: { fontSize: typography.sizes.xs, color: colors.textSecondary },
} as Record<string, object>);
