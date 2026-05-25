import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, typography, spacing, layout } from '@/design/tokens';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  scrollable?: boolean;
  noPadding?: boolean;
}

export function PageLayout({
  title,
  subtitle,
  actions,
  children,
  scrollable = true,
  noPadding = false,
}: PageLayoutProps) {
  const content = (
    <View style={[styles.content, noPadding && styles.contentNoPadding]}>
      {children}
    </View>
  );

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {actions && <View style={styles.actions}>{actions}</View>}
      </View>

      {/* Content */}
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        <View style={styles.fillContent}>{content}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: layout.pagePadding,
    paddingTop: spacing[6],
    paddingBottom: spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    backgroundColor: colors.bgBase,
  },
  headerLeft: { gap: spacing[1] },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[1],
  },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  fillContent: { flex: 1 },
  content: {
    padding: layout.pagePadding,
    gap: spacing[6],
    flex: 1,
  },
  contentNoPadding: { padding: 0 },
});
