import { createRoute, z } from '@hono/zod-openapi';
import { eq, desc, inArray } from 'drizzle-orm';
import {
  createApp,
  InsertOrderSchema,
  OrderSchema,
  OrderStatusActionSchema,
  ErrorSchema,
  PaginationSchema,
  resolveStatusAction,
} from '../lib/schemas';
import { getDb, schema } from '../db';

const app = createApp();

const listOrdersRoute = createRoute({
  method: 'get',
  path: '/orders',
  tags: ['Orders'],
  summary: 'List orders with optional filters',
  request: {
    query: PaginationSchema.extend({
      status: z
        .enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])
        .optional(),
      customerId: z.coerce.number().int().positive().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(OrderSchema),
            total: z.number(),
            page: z.number(),
            limit: z.number(),
          }),
        },
      },
      description: 'Paginated orders',
    },
  },
});

app.openapi(listOrdersRoute, async (c) => {
  const db = getDb(c.env);
  const { status, customerId, page, limit } = c.req.valid('query');
  const offset = (page - 1) * limit;

  const rows = await db.query.orders.findMany({
    where: (t, { eq: eqOp, and }) => {
      const conditions = [];
      if (status) conditions.push(eqOp(t.status, status));
      if (customerId !== undefined) conditions.push(eqOp(t.customerId, customerId));
      return conditions.length > 0 ? and(...conditions) : undefined;
    },
    with: {
      customer: true,
      items: {
        with: { menuItem: true },
      },
    },
    orderBy: (t, { desc: descFn }) => [descFn(t.createdAt)],
    limit,
    offset,
  });

  // Count total for pagination
  const allRows = await db.query.orders.findMany({
    where: (t, { eq: eqOp, and }) => {
      const conditions = [];
      if (status) conditions.push(eqOp(t.status, status));
      if (customerId !== undefined) conditions.push(eqOp(t.customerId, customerId));
      return conditions.length > 0 ? and(...conditions) : undefined;
    },
    columns: { id: true },
  });

  return c.json({
    data: rows.map(serialize),
    total: allRows.length,
    page,
    limit,
  });
});

const getOrderRoute = createRoute({
  method: 'get',
  path: '/orders/{id}',
  tags: ['Orders'],
  request: { params: z.object({ id: z.coerce.number().int().positive() }) },
  responses: {
    200: { content: { 'application/json': { schema: OrderSchema } }, description: 'Order' },
    404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Not found' },
  },
});

app.openapi(getOrderRoute, async (c) => {
  const db = getDb(c.env);
  const { id } = c.req.valid('param');

  const row = await db.query.orders.findFirst({
    where: (t, { eq: eqOp }) => eqOp(t.id, id),
    with: {
      customer: true,
      items: { with: { menuItem: true } },
    },
  });
  if (!row) return c.json({ error: 'Order not found' }, 404);
  return c.json(serialize(row));
});

const createOrderRoute = createRoute({
  method: 'post',
  path: '/orders',
  tags: ['Orders'],
  summary: 'Create a new order',
  request: {
    body: { content: { 'application/json': { schema: InsertOrderSchema } }, required: true },
  },
  responses: {
    201: { content: { 'application/json': { schema: OrderSchema } }, description: 'Created order' },
    400: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Business rule violation' },
    422: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Validation error' },
  },
});

app.openapi(createOrderRoute, async (c) => {
  const db = getDb(c.env);
  const body = c.req.valid('json');

  // Fetch all requested menu items
  const menuItemIds = body.items.map((i) => i.menuItemId);
  const menuItemRows = await db.query.menuItems.findMany({
    where: (t, { inArray: inArrayOp }) => inArrayOp(t.id, menuItemIds),
  });

  // Reject unavailable items
  const unavailable = menuItemRows.filter((mi) => !mi.available);
  if (unavailable.length > 0) {
    return c.json(
      {
        error: 'Some menu items are not available',
        details: unavailable.map((i) => ({ id: i.id, name: i.name })),
      },
      400,
    );
  }

  // Reject missing items
  if (menuItemRows.length !== menuItemIds.length) {
    return c.json({ error: 'One or more menu items not found' }, 400);
  }

  // Calculate totals server-side
  const itemMap = new Map(menuItemRows.map((mi) => [mi.id, mi]));
  const lineItems = body.items.map((i) => {
    const mi = itemMap.get(i.menuItemId)!;
    return {
      menuItemId: i.menuItemId,
      quantity: i.quantity,
      unitPrice: mi.price,
      subtotal: mi.price * i.quantity,
    };
  });
  const subtotal = lineItems.reduce((s, l) => s + l.subtotal, 0);
  const total = subtotal; // extend here for taxes/fees

  // Verify customer if provided
  if (body.customerId !== undefined) {
    const cust = await db.query.customers.findFirst({
      where: (t, { eq: eqOp }) => eqOp(t.id, body.customerId!),
    });
    if (!cust) return c.json({ error: 'Customer not found' }, 400);
  }

  const [order] = await db
    .insert(schema.orders)
    .values({ customerId: body.customerId ?? null, subtotal, total, notes: body.notes })
    .returning();

  if (!order) return c.json({ error: 'Insert failed' }, 500 as never);

  await db.insert(schema.orderItems).values(
    lineItems.map((l) => ({ orderId: order.id, ...l })),
  );

  const full = await db.query.orders.findFirst({
    where: (t, { eq: eqOp }) => eqOp(t.id, order.id),
    with: { customer: true, items: { with: { menuItem: true } } },
  });

  return c.json(serialize(full!), 201);
});

const orderActionRoute = createRoute({
  method: 'post',
  path: '/orders/{id}/actions',
  tags: ['Orders'],
  summary: 'Transition order status via explicit action',
  request: {
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: { content: { 'application/json': { schema: OrderStatusActionSchema } }, required: true },
  },
  responses: {
    200: { content: { 'application/json': { schema: OrderSchema } }, description: 'Updated order' },
    400: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Invalid transition' },
    404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Not found' },
  },
});

app.openapi(orderActionRoute, async (c) => {
  const db = getDb(c.env);
  const { id } = c.req.valid('param');
  const { action } = c.req.valid('json');

  const order = await db.query.orders.findFirst({
    where: (t, { eq: eqOp }) => eqOp(t.id, id),
  });
  if (!order) return c.json({ error: 'Order not found' }, 404);

  const result = resolveStatusAction(order.status, action);
  if (!result.ok) return c.json({ error: result.error }, 400);

  await db
    .update(schema.orders)
    .set({ status: result.nextStatus, updatedAt: new Date() })
    .where(eq(schema.orders.id, id));

  const full = await db.query.orders.findFirst({
    where: (t, { eq: eqOp }) => eqOp(t.id, id),
    with: { customer: true, items: { with: { menuItem: true } } },
  });

  return c.json(serialize(full!));
});

function serialize<T extends object>(row: T): T {
  return JSON.parse(JSON.stringify(row));
}

export { app as orderRoutes };
