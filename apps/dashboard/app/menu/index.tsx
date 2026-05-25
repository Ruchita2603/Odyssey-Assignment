import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, Switch, StyleSheet } from 'react-native';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/Skeleton';
import {
  useMenuCategories,
  useMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useCreateMenuCategory,
  useUpdateMenuCategory,
} from '@odyssey/api-client';
import { useToast } from '@/components/ui/Toast';
import { formatCents, parseToCents } from '@odyssey/shared';
import { colors, typography, spacing, radius } from '@/design/tokens';
import type { MenuItem, MenuCategory } from '@odyssey/types';

export default function MenuScreen() {
  const { toast } = useToast();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showCatModal, setShowCatModal] = useState(false);

  const { data: categories, isLoading: catsLoading } = useMenuCategories();
  const { data: items, isLoading: itemsLoading } = useMenuItems(
    selectedCategoryId ? { categoryId: selectedCategoryId } : undefined,
  );

  const { mutate: updateItem } = useUpdateMenuItem({
    onSuccess: () => toast('Item updated', 'success'),
    onError: (e) => toast(e.error, 'error'),
  });

  const displayItems = items ?? [];
  const categoryOptions = (categories ?? []).map((c) => ({ value: String(c.id), label: c.name }));

  const openEdit = (item: MenuItem) => { setEditingItem(item); setShowItemModal(true); };
  const openCreate = () => { setEditingItem(null); setShowItemModal(true); };

  return (
    <PageLayout
      title="Menu"
      subtitle="Manage categories and items"
      scrollable={false}
      noPadding
      actions={
        <View style={styles.headerActions}>
          <Button variant="secondary" size="sm" onPress={() => setShowCatModal(true)}>+ Category</Button>
          <Button variant="brand" size="sm" onPress={openCreate}>+ Item</Button>
        </View>
      }
    >
      <View style={styles.layout}>
        {/* Category sidebar */}
        <View style={styles.catSidebar}>
          <Text style={styles.sidebarTitle}>Categories</Text>
          {catsLoading ? (
            <View style={styles.catLoading}>
              {[1, 2, 3, 4].map((i) => <View key={i} style={styles.catSkeleton} />)}
            </View>
          ) : (
            <>
              <Pressable
                style={[styles.catItem, selectedCategoryId === null && styles.catItemActive]}
                onPress={() => setSelectedCategoryId(null)}
              >
                <Text style={[styles.catLabel, selectedCategoryId === null && styles.catLabelActive]}>
                  All Items
                </Text>
                <Text style={styles.catCount}>{items?.length ?? '…'}</Text>
              </Pressable>
              {categories?.map((cat) => (
                <CategorySidebarItem
                  key={cat.id}
                  category={cat}
                  active={selectedCategoryId === cat.id}
                  count={(items ?? []).filter((i) => i.categoryId === cat.id).length}
                  onSelect={() => setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)}
                />
              ))}
            </>
          )}
        </View>

        {/* Items table */}
        <View style={styles.itemsArea}>
          {itemsLoading ? (
            <SkeletonTable rows={6} />
          ) : displayItems.length === 0 ? (
            <EmptyState
              icon="🍽"
              title="No items yet"
              description="Add your first menu item to get started."
              action={{ label: '+ Add Item', onPress: openCreate }}
            />
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 2 }]}>Name</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Category</Text>
                <Text style={[styles.th, { flex: 0.8 }]}>Price</Text>
                <Text style={[styles.th, { flex: 0.8 }]}>Prep Time</Text>
                <Text style={[styles.th, { flex: 0.6 }]}>Available</Text>
                <Text style={[styles.th, { flex: 0.5 }]}></Text>
              </View>
              <FlatList
                data={displayItems}
                keyExtractor={(i) => String(i.id)}
                renderItem={({ item }) => (
                  <MenuItemRow
                    item={item}
                    categoryName={categories?.find((c) => c.id === item.categoryId)?.name ?? '—'}
                    onEdit={() => openEdit(item)}
                    onToggleAvailable={() =>
                      updateItem({ id: item.id, available: !item.available })
                    }
                  />
                )}
              />
            </>
          )}
        </View>
      </View>

      <MenuItemModal
        visible={showItemModal}
        onClose={() => { setShowItemModal(false); setEditingItem(null); }}
        editingItem={editingItem}
        categoryOptions={categoryOptions}
      />

      <CategoryModal
        visible={showCatModal}
        onClose={() => setShowCatModal(false)}
      />
    </PageLayout>
  );
}

function CategorySidebarItem({ category, active, count, onSelect }: { category: MenuCategory; active: boolean; count: number; onSelect: () => void }) {
  return (
    <Pressable
      style={({ hovered }) => [styles.catItem, active && styles.catItemActive, (hovered as boolean | undefined) && !active && styles.catItemHover]}
      onPress={onSelect}
    >
      <Text style={[styles.catLabel, active && styles.catLabelActive]} numberOfLines={1}>{category.name}</Text>
      <Text style={styles.catCount}>{count}</Text>
    </Pressable>
  );
}

function MenuItemRow({ item, categoryName, onEdit, onToggleAvailable }: { item: MenuItem; categoryName: string; onEdit: () => void; onToggleAvailable: () => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 2 }}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        {item.description && <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>}
      </View>
      <Text style={[styles.td, { flex: 1.5 }]} numberOfLines={1}>{categoryName}</Text>
      <Text style={[styles.td, styles.priceText, { flex: 0.8 }]}>{formatCents(item.price)}</Text>
      <Text style={[styles.td, { flex: 0.8 }]}>{item.prepTimeMinutes}m</Text>
      <View style={{ flex: 0.6 }}>
        <Switch
          value={item.available}
          onValueChange={onToggleAvailable}
          trackColor={{ false: colors.bgSurfaceRaised, true: `${colors.success}60` }}
          thumbColor={item.available ? colors.success : colors.textTertiary}
        />
      </View>
      <View style={{ flex: 0.5, alignItems: 'flex-end' }}>
        <Button variant="ghost" size="sm" onPress={onEdit}>Edit</Button>
      </View>
    </View>
  );
}

function MenuItemModal({ visible, onClose, editingItem, categoryOptions }: { visible: boolean; onClose: () => void; editingItem: MenuItem | null; categoryOptions: { value: string; label: string }[] }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [prepTime, setPrepTime] = useState('15');

  React.useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setDescription(editingItem.description ?? '');
      setPrice((editingItem.price / 100).toFixed(2));
      setCategoryId(String(editingItem.categoryId));
      setPrepTime(String(editingItem.prepTimeMinutes));
    } else {
      setName(''); setDescription(''); setPrice(''); setCategoryId(''); setPrepTime('15');
    }
  }, [editingItem, visible]);

  const { mutate: createItem, isPending: creating } = useCreateMenuItem({
    onSuccess: () => { toast('Item created', 'success'); onClose(); },
    onError: (e) => toast(e.error, 'error'),
  });
  const { mutate: updateItem, isPending: updating } = useUpdateMenuItem({
    onSuccess: () => { toast('Item updated', 'success'); onClose(); },
    onError: (e) => toast(e.error, 'error'),
  });

  const handleSave = () => {
    if (!name.trim()) { toast('Name is required', 'warning'); return; }
    if (!categoryId) { toast('Select a category', 'warning'); return; }
    const priceCents = parseToCents(price);
    if (priceCents <= 0) { toast('Enter a valid price', 'warning'); return; }

    if (editingItem) {
      updateItem({ id: editingItem.id, name: name.trim(), description: description || undefined, price: priceCents, prepTimeMinutes: Number(prepTime) });
    } else {
      createItem({ name: name.trim(), description: description || undefined, price: priceCents, categoryId: Number(categoryId), prepTimeMinutes: Number(prepTime) });
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={editingItem ? 'Edit Item' : 'New Menu Item'}
      size="md"
      footer={
        <View style={{ flexDirection: 'row', gap: spacing[3], justifyContent: 'flex-end' }}>
          <Button variant="ghost" onPress={onClose}>Cancel</Button>
          <Button variant="brand" onPress={handleSave} loading={creating || updating}>{editingItem ? 'Save Changes' : 'Create Item'}</Button>
        </View>
      }
    >
      <View style={styles.form}>
        <Input label="Name *" value={name} onChangeText={setName} placeholder="e.g. Wagyu Burger" />
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="Optional description" multiline style={{ height: 72, paddingTop: spacing[2] } as never} />
        <View style={styles.formRow}>
          <Input label="Price *" value={price} onChangeText={setPrice} placeholder="24.00" keyboardType="decimal-pad" containerStyle={{ flex: 1 }} leftElement={<Text style={styles.currency}>$</Text>} />
          <Input label="Prep Time (min)" value={prepTime} onChangeText={setPrepTime} keyboardType="number-pad" containerStyle={{ flex: 1 }} />
        </View>
        <Select label="Category *" value={categoryId} onChange={setCategoryId} options={[{ value: '', label: 'Select category…' }, ...categoryOptions]} />
      </View>
    </Modal>
  );
}

function CategoryModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { mutate: createCat, isPending } = useCreateMenuCategory({
    onSuccess: () => { toast('Category created', 'success'); setName(''); setDescription(''); onClose(); },
    onError: (e) => toast(e.error, 'error'),
  });
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="New Category"
      size="sm"
      footer={
        <View style={{ flexDirection: 'row', gap: spacing[3], justifyContent: 'flex-end' }}>
          <Button variant="ghost" onPress={onClose}>Cancel</Button>
          <Button variant="brand" onPress={() => { if (!name.trim()) { toast('Name required', 'warning'); return; } createCat({ name: name.trim(), description: description || undefined }); }} loading={isPending}>Create</Button>
        </View>
      }
    >
      <View style={styles.form}>
        <Input label="Name *" value={name} onChangeText={setName} placeholder="e.g. Desserts" />
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="Optional" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', gap: spacing[2] },
  layout: { flex: 1, flexDirection: 'row' },
  catSidebar: {
    width: 200, borderRightWidth: 1, borderRightColor: colors.borderDefault,
    padding: spacing[4], gap: spacing[1],
  },
  sidebarTitle: { fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing[2] },
  catLoading: { gap: spacing[2] },
  catSkeleton: { height: 36, borderRadius: radius.md, backgroundColor: colors.bgSurfaceRaised },
  catItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[2.5], paddingHorizontal: spacing[3], borderRadius: radius.md, cursor: 'pointer' as never },
  catItemActive: { backgroundColor: colors.brandMuted },
  catItemHover: { backgroundColor: colors.bgHover },
  catLabel: { fontSize: typography.sizes.sm, color: colors.textSecondary, flex: 1 },
  catLabelActive: { color: colors.brand, fontWeight: typography.weights.semibold },
  catCount: { fontSize: typography.sizes.xs, color: colors.textTertiary, backgroundColor: colors.bgSurfaceRaised, paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: radius.full },

  itemsArea: { flex: 1 },
  tableHeader: { flexDirection: 'row', paddingHorizontal: spacing[5], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.borderDefault, backgroundColor: colors.bgSurface },
  th: { fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[5], paddingVertical: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.borderDefault },
  td: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  itemName: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.textPrimary },
  itemDesc: { fontSize: typography.sizes.xs, color: colors.textTertiary, marginTop: 2 },
  priceText: { fontWeight: typography.weights.semibold, color: colors.brand },

  form: { gap: spacing[4] },
  formRow: { flexDirection: 'row', gap: spacing[3] },
  currency: { fontSize: typography.sizes.base, color: colors.textTertiary },
} as Record<string, object>);
