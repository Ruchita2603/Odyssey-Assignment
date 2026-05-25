import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { colors, typography, spacing, radius, layout } from '@/design/tokens';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: '⌂' },
  { href: '/orders', label: 'Orders', icon: '📋' },
  { href: '/menu', label: 'Menu', icon: '🍽' },
  { href: '/crm', label: 'CRM', icon: '👥' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { href: '/ui-library', label: 'UI Library', icon: '🎨' },
];

export function Sidebar({ pendingCount }: { pendingCount?: number }) {
  const pathname = usePathname();
  const router = useRouter();

  const itemsWithBadges = NAV_ITEMS.map((item) =>
    item.href === '/orders' && pendingCount ? { ...item, badge: pendingCount } : item,
  );

  return (
    <View style={styles.sidebar}>
      {/* Logo */}
      <View style={styles.logo}>
        <View style={styles.logoMark}>
          <Text style={styles.logoIcon}>◈</Text>
        </View>
        <View>
          <Text style={styles.logoName}>Odyssey</Text>
          <Text style={styles.logoSub}>Kitchen</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Nav */}
      <View style={styles.nav}>
        {itemsWithBadges.map((item) => (
          <NavItemButton
            key={item.href}
            item={item}
            active={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
            onPress={() => router.push(item.href as never)}
          />
        ))}
      </View>

      <View style={styles.spacer} />

      {/* Bottom */}
      <View style={styles.divider} />
      <View style={[styles.nav, { marginTop: spacing[2] }]}>
        {BOTTOM_ITEMS.map((item) => (
          <NavItemButton
            key={item.href}
            item={item}
            active={pathname === item.href}
            onPress={() => router.push(item.href as never)}
          />
        ))}
      </View>
    </View>
  );
}

function NavItemButton({
  item,
  active,
  onPress,
}: {
  item: NavItem;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed, hovered }) => [
        styles.navItem,
        active && styles.navItemActive,
        (hovered as boolean | undefined) && !active && styles.navItemHover,
        pressed && styles.navItemPressed,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.navIcon, active && styles.navIconActive]}>{item.icon}</Text>
      <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={1}>
        {item.label}
      </Text>
      {item.badge !== undefined && item.badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.badge > 99 ? '99+' : item.badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: layout.sidebarWidth,
    height: '100%' as never,
    backgroundColor: colors.bgSurface,
    borderRightWidth: 1,
    borderRightColor: colors.borderDefault,
    paddingVertical: spacing[4],
    flexShrink: 0,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.brandMuted,
    borderWidth: 1,
    borderColor: `${colors.brand}40`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: 18, color: colors.brand },
  logoName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  logoSub: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderDefault,
    marginHorizontal: spacing[4],
    marginBottom: spacing[2],
  },
  nav: {
    paddingHorizontal: spacing[2],
    gap: spacing[0.5],
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2.5],
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    cursor: 'pointer' as never,
  },
  navItemActive: {
    backgroundColor: colors.brandMuted,
  },
  navItemHover: {
    backgroundColor: colors.bgHover,
  },
  navItemPressed: { opacity: 0.7 },
  navIcon: { fontSize: 16, width: 20, textAlign: 'center' },
  navIconActive: {},
  navLabel: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  navLabelActive: {
    color: colors.brand,
    fontWeight: typography.weights.semibold,
  },
  badge: {
    backgroundColor: colors.brand,
    borderRadius: radius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[1.5],
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
  },
  spacer: { flex: 1 },
});
