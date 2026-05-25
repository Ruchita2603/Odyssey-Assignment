import { createRoute, z } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import {
  createApp,
  CustomerSchema,
  InsertCustomerSchema,
  OrderSchema,
  ErrorSchema,
  PaginationSchema,
} from '../lib/schemas';
import { getDb, schema } from '../db';

const app = createApp();

const listCustomersRoute = createRoute({
  method: 'get',
  path: '/customers',
  tags: ['Customers'],
  request: { query: PaginationSchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(
              CustomerSchema.extend({
                orderCount: z.number(),
                totalSpend: z.number(),
              }),
            ),
            total: z.number(),
            page: z.number(),
            limit: z.number(),
          }),
        },
      },
      description: 'Paginated customers with spend summary',
    },
  },
});

app.openapi(listCustomersRoute, async (c) => {
  const db = getDb(c.env);
  const { page, limit } = c.req.valid('query');
  const offset = (page - 1) * limit;

  const rows = await db.query.customers.findMany({
    with: { orders: { columns: { total: true, status: true } } },
    orderBy: (t, { desc: descFn }) => [descFn(t.createdAt)],
    limit,
    offset,
  });

  const total = await db.query.customers.findMany({ columns: { id: true } });

  const enriched = rows.map((c) => ({
    ...c,
    orderCount: c.orders.length,
    totalSpend: c.orders
      .filter((o) => o.status === 'completed')
      .reduce((s, o) => s + o.total, 0),
    orders: undefined,
  }));

  return c.json({ data: enriched.map(serialize), total: total.length, page, limit });
});

const getCustomerRoute = createRoute({
  method: 'get',
  path: '/customers/{id}',
  tags: ['Customers'],
  request: { params: z.object({ id: z.coerce.number().int().positive() }) },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: CustomerSchema.extend({
            orderCount: z.number(),
            totalSpend: z.number(),
            recentOrders: z.array(OrderSchema),
          }),
        },
      },
      description: 'Customer with order history',
    },
    404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Not found' },
  },
});

app.openapi(getCustomerRoute, async (c) => {
  const db = getDb(c.env);
  const { id } = c.req.valid('param');

  const row = await db.query.customers.findFirst({
    where: (t, { eq: eqOp }) => eqOp(t.id, id),
    with: {
      orders: {
        with: { items: { with: { menuItem: true } } },
        orderBy: (t, { desc: descFn }) => [descFn(t.createdAt)],
        limit: 10,
      },
    },
  });
  if (!row) return c.json({ error: 'Customer not found' }, 404);

  const { orders: customerOrders, ...customerData } = row;

  return c.json(
    serialize({
      ...customerData,
      orderCount: customerOrders.length,
      totalSpend: customerOrders
        .filter((o) => o.status === 'completed')
        .reduce((s, o) => s + o.total, 0),
      recentOrders: customerOrders,
    }),
  );
});

const createCustomerRoute = createRoute({
  method: 'post',
  path: '/customers',
  tags: ['Customers'],
  request: {
    body: { content: { 'application/json': { schema: InsertCustomerSchema } }, required: true },
  },
  responses: {
    201: { content: { 'application/json': { schema: CustomerSchema } }, description: 'Created customer' },
    409: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Email conflict' },
    422: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Validation error' },
  },
});

app.openapi(createCustomerRoute, async (c) => {
  const db = getDb(c.env);
  const body = c.req.valid('json');

  if (body.email) {
    const existing = await db.query.customers.findFirst({
      where: (t, { eq: eqOp }) => eqOp(t.email, body.email!),
    });
    if (existing) return c.json({ error: 'A customer with this email already exists' }, 409);
  }

  const [row] = await db.insert(schema.customers).values(body).returning();
  if (!row) return c.json({ error: 'Insert failed' }, 500 as never);
  return c.json(serialize(row), 201);
});

const updateCustomerRoute = createRoute({
  method: 'put',
  path: '/customers/{id}',
  tags: ['Customers'],
  request: {
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: { content: { 'application/json': { schema: InsertCustomerSchema.partial() } }, required: true },
  },
  responses: {
    200: { content: { 'application/json': { schema: CustomerSchema } }, description: 'Updated customer' },
    404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Not found' },
  },
});

app.openapi(updateCustomerRoute, async (c) => {
  const db = getDb(c.env);
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');
  const [row] = await db
    .update(schema.customers)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(schema.customers.id, id))
    .returning();
  if (!row) return c.json({ error: 'Customer not found' }, 404);
  return c.json(serialize(row));
});

function serialize<T extends object>(row: T): T {
  return JSON.parse(JSON.stringify(row));
}

export { app as customerRoutes };
