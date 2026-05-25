import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/design/tokens';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = radius.sm, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as never, height, borderRadius },
        { opacity },
        style,
      ]}
    />
  );
}

// Preset skeleton layouts
export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Skeleton height={12} width={80} />
      <Skeleton height={32} width="60%" style={{ marginTop: spacing[2] }} />
      <Skeleton height={12} width="40%" style={{ marginTop: spacing[2] }} />
    </View>
  );
}

export function SkeletonRow() {
  return (
    <View style={styles.row}>
      <Skeleton width={32} height={32} borderRadius={radius.full} />
      <View style={{ flex: 1, gap: spacing[1.5] }}>
        <Skeleton height={14} width="60%" />
        <Skeleton height={12} width="40%" />
      </View>
      <Skeleton height={24} width={72} borderRadius={radius.full} />
    </View>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <View style={styles.table}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.tableRow}>
          <Skeleton height={14} width="20%" />
          <Skeleton height={14} width="30%" />
          <Skeleton height={14} width="15%" />
          <Skeleton height={24} width={72} borderRadius={radius.full} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.bgSurfaceRaised,
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing[5],
    gap: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  table: { gap: 0 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    gap: spacing[4],
  },
} as Record<string, object>);
