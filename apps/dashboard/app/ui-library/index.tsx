import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton, SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { colors, typography, spacing, radius, shadows } from '@/design/tokens';

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'] as const;

export default function UILibraryScreen() {
  const { toast, success, error, warning, info } = useToast();
  const [inputVal, setInputVal] = useState('');
  const [selectVal, setSelectVal] = useState('');

  return (
    <PageLayout title="UI Library" subtitle="Design system components and tokens">
      {/* Color Tokens */}
      <Section title="Color Tokens">
        <SubSection title="Brand & Accent">
          <View style={styles.swatchRow}>
            {[colors.brand, colors.brandHover, colors.brandMuted].map((c, i) => (
              <Swatch key={i} color={c} label={['Brand', 'Hover', 'Muted'][i] ?? ''} />
            ))}
          </View>
        </SubSection>
        <SubSection title="Semantic">
          <View style={styles.swatchRow}>
            {[colors.success, colors.warning, colors.error, colors.info].map((c, i) => (
              <Swatch key={i} color={c} label={['Success', 'Warning', 'Error', 'Info'][i] ?? ''} />
            ))}
          </View>
        </SubSection>
        <SubSection title="Backgrounds">
          <View style={styles.swatchRow}>
            {[colors.bgBase, colors.bgSurface, colors.bgSurfaceRaised, colors.bgSurfaceOverlay].map((c, i) => (
              <Swatch key={i} color={c} label={['Base', 'Surface', 'Raised', 'Overlay'][i] ?? ''} border />
            ))}
          </View>
        </SubSection>
        <SubSection title="Text">
          <View style={styles.swatchRow}>
            {[colors.textPrimary, colors.textSecondary, colors.textTertiary, colors.textDisabled].map((c, i) => (
              <Swatch key={i} color={c} label={['Primary', 'Secondary', 'Tertiary', 'Disabled'][i] ?? ''} />
            ))}
          </View>
        </SubSection>
      </Section>

      {/* Typography */}
      <Section title="Typography">
        {[
          { style: styles.displayLg, label: 'Display LG — 36px Bold' },
          { style: styles.displayMd, label: 'Display MD — 30px Bold' },
          { style: styles.h1, label: 'Heading 1 — 24px Semibold' },
          { style: styles.h2, label: 'Heading 2 — 20px Semibold' },
          { style: styles.h3, label: 'Heading 3 — 18px Semibold' },
          { style: styles.body, label: 'Body — 15px Regular' },
          { style: styles.bodySm, label: 'Body SM — 13px Regular' },
          { style: styles.label, label: 'LABEL — 13px Semibold Uppercase' },
          { style: styles.caption, label: 'Caption — 11px Medium' },
        ].map((item, i) => (
          <Text key={i} style={item.style}>{item.label}</Text>
        ))}
      </Section>

      {/* Spacing */}
      <Section title="Spacing Scale">
        <View style={styles.spacingGrid}>
          {[0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => {
            const px = spacing[n as keyof typeof spacing] ?? n * 4;
            return (
              <View key={n} style={styles.spacingItem}>
                <View style={[styles.spacingBar, { width: px, height: 16 }]} />
                <Text style={styles.spacingLabel}>{n} ({px}px)</Text>
              </View>
            );
          })}
        </View>
      </Section>

      {/* Buttons */}
      <Section title="Buttons">
        <SubSection title="Variants">
          <View style={styles.componentRow}>
            <Button variant="brand">Brand</Button>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </View>
        </SubSection>
        <SubSection title="Sizes">
          <View style={styles.componentRow}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </View>
        </SubSection>
        <SubSection title="States">
          <View style={styles.componentRow}>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </View>
        </SubSection>
      </Section>

      {/* Badges */}
      <Section title="Badges & Status">
        <SubSection title="Variants">
          <View style={styles.componentRow}>
            <Badge variant="default">Default</Badge>
            <Badge variant="success" dot>Success</Badge>
            <Badge variant="warning" dot>Warning</Badge>
            <Badge variant="error" dot>Error</Badge>
            <Badge variant="info" dot>Info</Badge>
            <Badge variant="brand" dot>Brand</Badge>
          </View>
        </SubSection>
        <SubSection title="Order Statuses">
          <View style={styles.componentRow}>
            {ORDER_STATUSES.map((s) => <StatusBadge key={s} status={s} />)}
          </View>
        </SubSection>
      </Section>

      {/* Cards / Surfaces */}
      <Section title="Cards & Surfaces">
        <View style={styles.cardRow}>
          <Card style={styles.demoCard}>
            <Text style={styles.cardLabel}>Default</Text>
            <Text style={styles.cardBody}>Standard surface with border</Text>
          </Card>
          <Card variant="raised" style={styles.demoCard}>
            <Text style={styles.cardLabel}>Raised</Text>
            <Text style={styles.cardBody}>Elevated with shadow</Text>
          </Card>
          <Card variant="flat" style={styles.demoCard}>
            <Text style={styles.cardLabel}>Flat</Text>
            <Text style={styles.cardBody}>No padding variant</Text>
          </Card>
          <Card variant="brand" style={styles.demoCard}>
            <Text style={[styles.cardLabel, { color: colors.brand }]}>Brand</Text>
            <Text style={styles.cardBody}>Brand tinted surface</Text>
          </Card>
        </View>
      </Section>

      {/* Inputs */}
      <Section title="Form Controls">
        <View style={styles.formDemo}>
          <Input label="Text Input" value={inputVal} onChangeText={setInputVal} placeholder="Type something…" />
          <Input label="With Error" value="" onChangeText={() => {}} placeholder="Invalid value" error="This field is required" />
          <Input label="With Hint" value="" onChangeText={() => {}} placeholder="Enter your email" hint="We'll never share your email" />
          <Input label="Disabled" value="Disabled value" editable={false} />
          <Select
            label="Select"
            value={selectVal}
            onChange={setSelectVal}
            options={[
              { value: '', label: 'Choose an option' },
              { value: 'a', label: 'Option A', description: 'First option' },
              { value: 'b', label: 'Option B', description: 'Second option' },
              { value: 'c', label: 'Option C' },
            ]}
          />
        </View>
      </Section>

      {/* Stat Cards */}
      <Section title="Stat Cards">
        <View style={styles.statRow}>
          <StatCard title="Total Orders" value="1,284" icon="📋" accent={colors.info} />
          <StatCard title="Revenue" value="$48,200" change={{ value: '12% this week', positive: true }} icon="💰" accent={colors.success} />
          <StatCard title="Pending" value="7" icon="⏳" accent={colors.warning} />
          <StatCard title="Loading" value="—" icon="📈" accent={colors.brand} loading />
        </View>
      </Section>

      {/* Skeleton States */}
      <Section title="Skeleton Loading">
        <View style={styles.skeletonDemo}>
          <SkeletonCard />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </View>
      </Section>

      {/* Empty State */}
      <Section title="Empty States">
        <EmptyState
          icon="🍽"
          title="No items found"
          description="Try adjusting your search or filters to find what you're looking for."
          action={{ label: 'Clear Filters', onPress: () => {} }}
        />
      </Section>

      {/* Toast */}
      <Section title="Toast Notifications">
        <View style={styles.componentRow}>
          <Button variant="secondary" onPress={() => success('Order confirmed successfully!')}>Success</Button>
          <Button variant="secondary" onPress={() => error('Failed to process request')}>Error</Button>
          <Button variant="secondary" onPress={() => warning('Item stock is running low')}>Warning</Button>
          <Button variant="secondary" onPress={() => info('New order received')}>Info</Button>
        </View>
      </Section>

      {/* Radius */}
      <Section title="Border Radius">
        <View style={styles.radiusRow}>
          {Object.entries(radius).map(([key, val]) => (
            <View key={key} style={styles.radiusItem}>
              <View style={[styles.radiusBox, { borderRadius: val }]} />
              <Text style={styles.radiusLabel}>{key} ({val}px)</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Shadows */}
      <Section title="Elevation / Shadows">
        <View style={styles.shadowRow}>
          {Object.keys(shadows).map((key) => (
            <View key={key} style={[styles.shadowBox, (shadows as Record<string, object>)[key] as never]}>
              <Text style={styles.shadowLabel}>{key}</Text>
            </View>
          ))}
        </View>
      </Section>
    </PageLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.subSection}>
      <Text style={styles.subSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Swatch({ color, label, border }: { color: string; label: string; border?: boolean }) {
  return (
    <View style={styles.swatchItem}>
      <View style={[styles.swatch, { backgroundColor: color }, border && styles.swatchBorder]} />
      <Text style={styles.swatchLabel}>{label}</Text>
      <Text style={styles.swatchHex}>{color}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing[4] },
  sectionTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textPrimary, paddingBottom: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.borderDefault },
  sectionBody: { gap: spacing[5] },
  subSection: { gap: spacing[3] },
  subSectionTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8 },

  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  swatchItem: { alignItems: 'center', gap: spacing[1.5] },
  swatch: { width: 64, height: 64, borderRadius: radius.md },
  swatchBorder: { borderWidth: 1, borderColor: colors.borderStrong },
  swatchLabel: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, color: colors.textSecondary },
  swatchHex: { fontSize: typography.sizes.xs, color: colors.textTertiary, fontFamily: 'Courier' },

  displayLg: { fontSize: 36, fontWeight: '700', color: colors.textPrimary, letterSpacing: -1 },
  displayMd: { fontSize: 30, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },
  h1: { fontSize: 24, fontWeight: '600', color: colors.textPrimary },
  h2: { fontSize: 20, fontWeight: '600', color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 15, color: colors.textPrimary, lineHeight: 22 },
  bodySm: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  caption: { fontSize: 11, fontWeight: '500', color: colors.textTertiary },

  spacingGrid: { gap: spacing[3] },
  spacingItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  spacingBar: { backgroundColor: colors.brand, borderRadius: 2 },
  spacingLabel: { fontSize: typography.sizes.xs, color: colors.textTertiary, fontFamily: 'Courier' },

  componentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3], alignItems: 'center' },
  cardRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[4] },
  demoCard: { flex: 1, minWidth: 180, gap: spacing[2] },
  cardLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  cardBody: { fontSize: typography.sizes.xs, color: colors.textTertiary },

  formDemo: { maxWidth: 480, gap: spacing[4] },

  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[4] },

  skeletonDemo: { gap: spacing[3] },

  radiusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[5] },
  radiusItem: { alignItems: 'center', gap: spacing[2] },
  radiusBox: { width: 56, height: 56, backgroundColor: colors.bgSurfaceRaised, borderWidth: 1, borderColor: colors.borderStrong },
  radiusLabel: { fontSize: typography.sizes.xs, color: colors.textTertiary, textAlign: 'center' },

  shadowRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[6] },
  shadowBox: { width: 80, height: 80, backgroundColor: colors.bgSurface, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  shadowLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary, fontWeight: typography.weights.medium },
} as Record<string, object>);
