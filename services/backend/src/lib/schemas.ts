import { OpenAPIHono } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import {
  menuCategories,
  menuItems,
  customers,
  orders,
  orderItems,
  settings,
  ORDER_TRANSITIONS,
  type OrderStatus,
} from '../db/schema';
import type { DbEnv } from '../db';

export type Env = {
  Bindings: DbEnv & { ENVIRONMENT?: string };
};

/** Factory: creates a fresh app for each Worker request context */
export function createApp() {
  return new OpenAPIHono<Env>();
}

// ─── Drizzle-Zod derived schemas ─────────────────────────────────────────────

export const MenuCategorySchema = createSelectSchema(menuCategories, {
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export const InsertMenuCategorySchema = createInsertSchema(menuCategories, {
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const MenuItemSchema = createSelectSchema(menuItems, {
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export const InsertMenuItemSchema = createInsertSchema(menuItems, {
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  price: z.number().int().positive().describe('Price in cents'),
  available: z.boolean().optional(),
  prepTimeMinutes: z.number().int().min(1).max(240).optional(),
  imageUrl: z.string().url().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateMenuItemSchema = InsertMenuItemSchema.partial().omit({ categoryId: true });

export const CustomerSchema = createSelectSchema(customers, {
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export const InsertCustomerSchema = createInsertSchema(customers, {
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  notes: z.string().max(1000).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const OrderItemInputSchema = z.object({
  menuItemId: z.number().int().positive(),
  quantity: z.number().int().positive().max(99),
});

export const InsertOrderSchema = z.object({
  customerId: z.number().int().positive().optional(),
  items: z.array(OrderItemInputSchema).min(1),
  notes: z.string().max(500).optional(),
});

export const OrderItemSchema = createSelectSchema(orderItems);
export const OrderSchema = createSelectSchema(orders, {
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).extend({
  items: z.array(
    OrderItemSchema.extend({
      menuItem: MenuItemSchema.optional(),
    }),
  ).optional(),
  customer: CustomerSchema.nullable().optional(),
});

export const OrderStatusActionSchema = z.object({
  action: z.enum(['confirm', 'start_preparing', 'mark_ready', 'complete', 'cancel']),
  notes: z.string().max(500).optional(),
});

const ACTION_TO_STATUS: Record<string, OrderStatus> = {
  confirm: 'confirmed',
  start_preparing: 'preparing',
  mark_ready: 'ready',
  complete: 'completed',
  cancel: 'cancelled',
};

export function resolveStatusAction(
  currentStatus: OrderStatus,
  action: string,
): { ok: true; nextStatus: OrderStatus } | { ok: false; error: string } {
  const nextStatus = ACTION_TO_STATUS[action] as OrderStatus | undefined;
  if (!nextStatus) return { ok: false, error: `Unknown action: ${action}` };

  const allowed = ORDER_TRANSITIONS[currentStatus];
  if (!allowed.includes(nextStatus)) {
    return {
      ok: false,
      error: `Cannot transition order from '${currentStatus}' to '${nextStatus}'. Allowed transitions: ${allowed.join(', ') || 'none'}`,
    };
  }
  return { ok: true, nextStatus };
}

export const SettingSchema = createSelectSchema(settings, {
  updatedAt: z.string().datetime(),
});
export const UpdateSettingSchema = z.object({
  value: z.string().min(1),
});
export const BulkUpdateSettingsSchema = z.object({
  settings: z.array(
    z.object({ key: z.string(), value: z.string() }),
  ),
});

// ─── Common response schemas ──────────────────────────────────────────────────

export const ErrorSchema = z.object({
  error: z.string(),
  details: z.unknown().optional(),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const DashboardSummarySchema = z.object({
  totalOrders: z.number(),
  totalRevenue: z.number().describe('Total revenue in cents'),
  pendingOrders: z.number(),
  confirmedOrders: z.number(),
  preparingOrders: z.number(),
  completedOrdersToday: z.number(),
  revenueToday: z.number().describe('Today revenue in cents'),
  popularItems: z.array(
    z.object({
      menuItemId: z.number(),
      name: z.string(),
      orderCount: z.number(),
    }),
  ),
});
