import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { useMenuItems, useMenuCategories, useCustomers, useCreateOrder } from '@odyssey/api-client';
import { useToast } from '@/components/ui/Toast';
import { formatCents } from '@odyssey/shared';
import { colors, typography, spacing, radius } from '@/design/tokens';
import type { MenuItem } from '@odyssey/types';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface LineItem {
  menuItem: MenuItem;
  quantity: number;
}

export function CreateOrderModal({ visible, onClose }: Props) {
  const { toast } = useToast();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineItem[]>([]);

  const { data: categories } = useMenuCategories();
  const { data: items } = useMenuItems(
    selectedCategoryId ? { categoryId: Number(selectedCategoryId), available: true } : { available: true },
  );
  const { data: customersData } = useCustomers();
  const { mutate: createOrder, isPending } = useCreateOrder({
    onSuccess: (order) => {
      toast(`Order #${order.id} created!`, 'success');
      handleClose();
    },
    onError: (err) => toast(err.error ?? 'Failed to create order', 'error'),
  });

  const handleClose = () => {
    setLines([]);
    setSelectedCategoryId('');
    setSelectedCustomerId('');
    setNotes('');
    onClose();
  };

  const addItem = (item: MenuItem) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.menuItem.id === item.id);
      if (existing) return prev.map((l) => l.menuItem.id === item.id ? { ...l, quantity: l.quantity + 1 } : l);
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQty = (itemId: number, delta: number) => {
    setLines((prev) =>
      prev
        .map((l) => l.menuItem.id === itemId ? { ...l, quantity: l.quantity + delta } : l)
        .filter((l) => l.quantity > 0),
    );
  };

  const subtotal = lines.reduce((s, l) => s + l.menuItem.price * l.quantity, 0);

  const handleSubmit = () => {
    if (lines.length === 0) { toast('Add at least one item', 'warning'); return; }
    createOrder({
      customerId: selectedCustomerId ? Number(selectedCustomerId) : undefined,
      items: lines.map((l) => ({ menuItemId: l.menuItem.id, quantity: l.quantity })),
      notes: notes || undefined,
    });
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...(categories ?? []).map((c) => ({ value: String(c.id), label: c.name })),
  ];

  const customerOptions = [
    { value: '', label: 'Walk-in customer' },
    ...(customersData?.data ?? []).map((c) => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title="New Order"
      subtitle="Select items and assign a customer"
      size="lg"
      footer={
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerTotal}>Total: {formatCents(subtotal)}</Text>
            <Text style={styles.footerItems}>{lines.length} item types</Text>
          </View>
          <View style={styles.footerActions}>
            <Button variant="ghost" onPress={handleClose}>Cancel</Button>
            <Button variant="brand" onPress={handleSubmit} loading={isPending} disabled={lines.length === 0}>
              Place Order
            </Button>
          </View>
        </View>
      }
    >
      <View style={styles.body}>
        {/* Left: Item picker */}
        <View style={styles.picker}>
          <Select value={selectedCategoryId} onChange={setSelectedCategoryId} options={categoryOptions} label="Category" />
          <View style={styles.itemGrid}>
            {(items ?? []).map((item) => (
              <Pressable
                key={item.id}
                style={({ hovered, pressed }) => [
                  styles.itemCard,
                  !item.available && styles.itemUnavailable,
                  (hovered as boolean | undefined) && item.available && styles.itemCardHover,
                  (pressed && item.available) && styles.itemCardPressed,
                ]}
                onPress={() => item.available && addItem(item)}
                disabled={!item.available}
              >
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemPrice}>{formatCents(item.price)}</Text>
                {!item.available && <Text style={styles.unavailableLabel}>Unavailable</Text>}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Right: Cart */}
        <View style={styles.cart}>
          <Text style={styles.cartTitle}>Order Summary</Text>
          <Select value={selectedCustomerId} onChange={setSelectedCustomerId} options={customerOptions} label="Customer" />
          <Input
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Special instructions…"
            multiline
            style={{ height: 72, paddingTop: spacing[2] } as never}
          />
          {lines.length === 0 ? (
            <Text style={styles.emptyCart}>No items added yet</Text>
          ) : (
            <View style={styles.lineItems}>
              {lines.map((line) => (
                <View key={line.menuItem.id} style={styles.lineItem}>
                  <Text style={styles.lineName} numberOfLines={1}>{line.menuItem.name}</Text>
                  <View style={styles.lineQty}>
                    <Pressable style={styles.qtyBtn} onPress={() => updateQty(line.menuItem.id, -1)}>
                      <Text style={styles.qtyBtnText}>−</Text>
                    </Pressable>
                    <Text style={styles.qtyValue}>{line.quantity}</Text>
                    <Pressable style={styles.qtyBtn} onPress={() => updateQty(line.menuItem.id, 1)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.lineTotal}>{formatCents(line.menuItem.price * line.quantity)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  body: { flexDirection: 'row', gap: spacing[5], minHeight: 400 },
  picker: { flex: 1.4, gap: spacing[4] },
  cart: { flex: 1, gap: spacing[4], borderLeftWidth: 1, borderLeftColor: colors.borderDefault, paddingLeft: spacing[5] },

  itemGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  itemCard: {
    width: '47%' as never,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing[3],
    gap: spacing[1],
    cursor: 'pointer' as never,
  },
  itemCardHover: { borderColor: colors.brand, backgroundColor: colors.brandMuted },
  itemCardPressed: { opacity: 0.7 },
  itemUnavailable: { opacity: 0.4, cursor: 'not-allowed' as never },
  itemName: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.textPrimary },
  itemPrice: { fontSize: typography.sizes.xs, color: colors.brand, fontWeight: typography.weights.semibold },
  unavailableLabel: { fontSize: typography.sizes.xs, color: colors.error },

  cartTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  emptyCart: { fontSize: typography.sizes.sm, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing[6] },
  lineItems: { gap: spacing[2] },
  lineItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  lineName: { flex: 1, fontSize: typography.sizes.sm, color: colors.textPrimary },
  lineQty: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  qtyBtn: {
    width: 24, height: 24, borderRadius: radius.sm,
    backgroundColor: colors.bgSurfaceRaised,
    alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer' as never,
  },
  qtyBtnText: { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  qtyValue: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary, minWidth: 20, textAlign: 'center' },
  lineTotal: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.brand, minWidth: 56, textAlign: 'right' },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerTotal: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  footerItems: { fontSize: typography.sizes.xs, color: colors.textTertiary },
  footerActions: { flexDirection: 'row', gap: spacing[3] },
} as Record<string, object>);
