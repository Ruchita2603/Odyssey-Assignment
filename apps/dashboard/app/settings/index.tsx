import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSettings, useUpdateSettings } from '@odyssey/api-client';
import { useToast } from '@/components/ui/Toast';
import { colors, typography, spacing } from '@/design/tokens';
import type { Setting } from '@odyssey/types';

type SettingsMap = Record<string, string>;

function toMap(settings: Setting[]): SettingsMap {
  return Object.fromEntries(settings.map((s) => [s.key, s.value]));
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};

export default function SettingsScreen() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useSettings();
  const [values, setValues] = useState<SettingsMap>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (settings) { setValues(toMap(settings)); setDirty(false); }
  }, [settings]);

  const set = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const { mutate: saveSettings, isPending } = useUpdateSettings({
    onSuccess: () => { toast('Settings saved', 'success'); setDirty(false); },
    onError: (e) => toast(e.error, 'error'),
  });

  const handleSave = () => {
    saveSettings(Object.entries(values).map(([key, value]) => ({ key, value })));
  };

  if (isLoading) {
    return (
      <PageLayout title="Settings">
        <View style={{ gap: spacing[5] }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={120} />)}
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Settings"
      subtitle="Restaurant configuration"
      actions={
        dirty ? (
          <Button variant="brand" onPress={handleSave} loading={isPending}>Save Changes</Button>
        ) : undefined
      }
    >
      {/* General */}
      <SettingsSection title="General" description="Basic restaurant information">
        <SettingRow label="Restaurant Name">
          <Input
            value={values['restaurant_name'] ?? ''}
            onChangeText={(v) => set('restaurant_name', v)}
            placeholder="Your restaurant name"
          />
        </SettingRow>
      </SettingsSection>

      {/* Order Management */}
      <SettingsSection title="Order Management" description="Control how orders are handled">
        <ToggleRow
          label="Auto-accept Orders"
          description="Automatically confirm incoming orders without manual review"
          value={values['auto_accept_orders'] === 'true'}
          onChange={(v) => set('auto_accept_orders', String(v))}
        />
        <ToggleRow
          label="Service Available"
          description="Turn off to pause all incoming orders"
          value={values['service_available'] === 'true'}
          onChange={(v) => set('service_available', String(v))}
        />
        <SettingRow label="Default Prep Time (minutes)" description="Default preparation time shown to customers">
          <Input
            value={values['default_prep_time_minutes'] ?? ''}
            onChangeText={(v) => set('default_prep_time_minutes', v)}
            keyboardType="number-pad"
            style={{ maxWidth: 120 } as never}
          />
        </SettingRow>
      </SettingsSection>

      {/* Opening Hours */}
      <SettingsSection title="Opening Hours" description="Set hours for each day (format: HH:MM-HH:MM)">
        {DAYS.map((day) => (
          <SettingRow key={day} label={DAY_LABELS[day] ?? day}>
            <Input
              value={values[`opening_hours_${day}`] ?? ''}
              onChangeText={(v) => set(`opening_hours_${day}`, v)}
              placeholder="11:00-22:00 or closed"
              style={{ maxWidth: 200 } as never}
            />
          </SettingRow>
        ))}
      </SettingsSection>

      {/* Save footer */}
      {dirty && (
        <View style={styles.saveBar}>
          <Text style={styles.saveBarText}>You have unsaved changes</Text>
          <Button variant="brand" onPress={handleSave} loading={isPending}>Save Changes</Button>
        </View>
      )}
    </PageLayout>
  );
}

function SettingsSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {description && <Text style={styles.sectionDesc}>{description}</Text>}
      </View>
      <Card style={styles.sectionCard}>
        {children}
      </Card>
    </View>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLabel}>
        <Text style={styles.settingLabelText}>{label}</Text>
        {description && <Text style={styles.settingDesc}>{description}</Text>}
      </View>
      <View style={styles.settingControl}>{children}</View>
    </View>
  );
}

function ToggleRow({ label, description, value, onChange }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLabel}>
        <Text style={styles.settingLabelText}>{label}</Text>
        {description && <Text style={styles.settingDesc}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.bgSurfaceRaised, true: `${colors.success}60` }}
        thumbColor={value ? colors.success : colors.textTertiary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing[3] },
  sectionHeader: { gap: spacing[0.5] },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  sectionDesc: { fontSize: typography.sizes.sm, color: colors.textTertiary },
  sectionCard: { gap: 0, padding: 0, overflow: 'hidden' },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    gap: spacing[4],
  },
  settingLabel: { flex: 1, gap: spacing[0.5] },
  settingLabelText: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: colors.textPrimary },
  settingDesc: { fontSize: typography.sizes.sm, color: colors.textTertiary, lineHeight: typography.sizes.sm * 1.4 },
  settingControl: { flexShrink: 0 },

  saveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.brandMuted,
    borderWidth: 1,
    borderColor: `${colors.brand}30`,
    borderRadius: 12,
    padding: spacing[4],
    paddingHorizontal: spacing[5],
  },
  saveBarText: { fontSize: typography.sizes.sm, color: colors.brand },
});
