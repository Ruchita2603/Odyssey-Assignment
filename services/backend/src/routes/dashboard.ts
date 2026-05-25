import { createRoute } from '@hono/zod-openapi';
import { createApp, DashboardSummarySchema } from '../lib/schemas';
import { getDb } from '../db';

const app = createApp();

const dashboardSummaryRoute = createRoute({
  method: 'get',
  path: '/dashboard/summary',
  tags: ['Dashboard'],
  summary: 'Get KPI summary for the home dashboard',
  responses: {
    200: {
      content: { 'application/json': { schema: DashboardSummarySchema } },
      description: 'Dashboard summary data',
    },
  },
});

app.openapi(dashboardSummaryRoute, async (c) => {
  const db = getDb(c.env);

  const allOrders = await db.query.orders.findMany({
    with: { items: { with: { menuItem: { columns: { name: true } } } } },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ordersToday = allOrders.filter((o) => new Date(o.createdAt) >= today);

  const totalRevenue = allOrders
    .filter((o) => o.status === 'completed')
    .reduce((s, o) => s + o.total, 0);

  const revenueToday = ordersToday
    .filter((o) => o.status === 'completed')
    .reduce((s, o) => s + o.total, 0);

  // Popular items — count across all non-cancelled orders
  const itemCounts = new Map<number, { name: string; count: number }>();
  for (const order of allOrders) {
    if (order.status === 'cancelled') continue;
    for (const item of order.items) {
      const mi = item.menuItem;
      if (!mi) continue;
      const existing = itemCounts.get(item.menuItemId);
      if (existing) {
        existing.count += item.quantity;
      } else {
        itemCounts.set(item.menuItemId, { name: mi.name, count: item.quantity });
      }
    }
  }

  const popularItems = [...itemCounts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([menuItemId, { name, count }]) => ({ menuItemId, name, orderCount: count }));

  return c.json({
    totalOrders: allOrders.length,
    totalRevenue,
    pendingOrders: allOrders.filter((o) => o.status === 'pending').length,
    confirmedOrders: allOrders.filter((o) => o.status === 'confirmed').length,
    preparingOrders: allOrders.filter((o) => o.status === 'preparing').length,
    completedOrdersToday: ordersToday.filter((o) => o.status === 'completed').length,
    revenueToday,
    popularItems,
  });
});

export { app as dashboardRoutes };
