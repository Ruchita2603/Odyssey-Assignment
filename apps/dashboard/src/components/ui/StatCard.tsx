import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '@/design/tokens';
import { Skeleton } from './Skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: { value: string; positive: boolean };
  icon?: string;
  accent?: string;
  loading?: boolean;
}

export function StatCard({ title, value, change, icon, accent = colors.brand, loading }: StatCardProps) {
  if (loading) {
    return (
      <View style={styles.card}>
        <Skeleton height={12} width={80} />
        <Skeleton height={36} width="60%" style={{ marginTop: spacing[2] }} />
        <Skeleton height={12} width={60} style={{ marginTop: spacing[2] }} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon && (
          <View style={[styles.iconBadge, { backgroundColor: `${accent}18` }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      {change && (
        <Text style={[styles.change, change.positive ? styles.positive : styles.negative]}>
          {change.positive ? '↑' : '↓'} {change.value}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 180,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing[5],
    gap: spacing[1],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 16 },
  value: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    letterSpacing: -1,
  },
  change: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginTop: spacing[1],
  },
  positive: { color: colors.success },
  negative: { color: colors.error },
});
