import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/lib/query-client';
import { ToastProvider } from '@/components/ui/Toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { colors } from '@/design/tokens';
import { useOrders } from '@odyssey/api-client';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

function AppShell() {
  const { data: ordersData } = useOrders({ status: 'pending', limit: 100 });
  const pendingCount = ordersData?.total ?? 0;

  return (
    <View style={styles.shell}>
      <Sidebar pendingCount={pendingCount} />
      <View style={styles.main}>
        <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.bgBase,
  },
  main: {
    flex: 1,
    overflow: 'hidden',
  },
});
