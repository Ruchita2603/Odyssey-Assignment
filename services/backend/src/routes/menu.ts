import { createRoute, z } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import { createApp } from '../lib/schemas';
import {
  MenuCategorySchema,
  InsertMenuCategorySchema,
  MenuItemSchema,
  InsertMenuItemSchema,
  UpdateMenuItemSchema,
  ErrorSchema,
} from '../lib/schemas';
import { getDb, schema } from '../db';

const app = createApp();

// ─── Categories ──────────────────────────────────────────────────────────────

const listCategoriesRoute = createRoute({
  method: 'get',
  path: '/menu/categories',
  tags: ['Menu'],
  summary: 'List all menu categories',
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(MenuCategorySchema) } },
      description: 'List of categories',
    },
  },
});

app.openapi(listCategoriesRoute, async (c) => {
  const db = getDb(c.env);
  const rows = await db.query.menuCategories.findMany({
    orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.name)],
  });
  return c.json(rows.map(serialize));
});

const createCategoryRoute = createRoute({
  method: 'post',
  path: '/menu/categories',
  tags: ['Menu'],
  summary: 'Create a menu category',
  request: {
    body: { content: { 'application/json': { schema: InsertMenuCategorySchema } }, required: true },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: MenuCategorySchema } },
      description: 'Created category',
    },
    422: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Validation error' },
  },
});

app.openapi(createCategoryRoute, async (c) => {
  const db = getDb(c.env);
  const body = c.req.valid('json');
  const [row] = await db.insert(schema.menuCategories).values(body).returning();
  if (!row) return c.json({ error: 'Insert failed' }, 500 as never);
  return c.json(serialize(row), 201);
});

const updateCategoryRoute = createRoute({
  method: 'put',
  path: '/menu/categories/{id}',
  tags: ['Menu'],
  summary: 'Update a menu category',
  request: {
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: { content: { 'application/json': { schema: InsertMenuCategorySchema.partial() } }, required: true },
  },
  responses: {
    200: { content: { 'application/json': { schema: MenuCategorySchema } }, description: 'Updated category' },
    404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Not found' },
  },
});

app.openapi(updateCategoryRoute, async (c) => {
  const db = getDb(c.env);
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');
  const [row] = await db
    .update(schema.menuCategories)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(schema.menuCategories.id, id))
    .returning();
  if (!row) return c.json({ error: 'Category not found' }, 404);
  return c.json(serialize(row));
});

const deleteCategoryRoute = createRoute({
  method: 'delete',
  path: '/menu/categories/{id}',
  tags: ['Menu'],
  summary: 'Delete a menu category',
  request: {
    params: z.object({ id: z.coerce.number().int().positive() }),
  },
  responses: {
    204: { description: 'Deleted' },
    404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Not found' },
  },
});

app.openapi(deleteCategoryRoute, async (c) => {
  const db = getDb(c.env);
  const { id } = c.req.valid('param');
  const [row] = await db
    .delete(schema.menuCategories)
    .where(eq(schema.menuCategories.id, id))
    .returning({ id: schema.menuCategories.id });
  if (!row) return c.json({ error: 'Category not found' }, 404);
  return new Response(null, { status: 204 });
});

// ─── Items ────────────────────────────────────────────────────────────────────

const listItemsRoute = createRoute({
  method: 'get',
  path: '/menu/items',
  tags: ['Menu'],
  summary: 'List menu items',
  request: {
    query: z.object({
      categoryId: z.coerce.number().int().positive().optional(),
      available: z.enum(['true', 'false']).optional(),
    }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(MenuItemSchema) } },
      description: 'List of menu items',
    },
  },
});

app.openapi(listItemsRoute, async (c) => {
  const db = getDb(c.env);
  const { categoryId, available } = c.req.valid('query');

  const rows = await db.query.menuItems.findMany({
    where: (t, { eq: eqOp, and }) => {
      const conditions = [];
      if (categoryId !== undefined) conditions.push(eqOp(t.categoryId, categoryId));
      if (available !== undefined) conditions.push(eqOp(t.available, available === 'true'));
      return conditions.length > 0 ? and(...conditions) : undefined;
    },
    orderBy: (t, { asc }) => [asc(t.name)],
  });
  return c.json(rows.map(serialize));
});

const getItemRoute = createRoute({
  method: 'get',
  path: '/menu/items/{id}',
  tags: ['Menu'],
  request: { params: z.object({ id: z.coerce.number().int().positive() }) },
  responses: {
    200: { content: { 'application/json': { schema: MenuItemSchema } }, description: 'Menu item' },
    404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Not found' },
  },
});

app.openapi(getItemRoute, async (c) => {
  const db = getDb(c.env);
  const { id } = c.req.valid('param');
  const row = await db.query.menuItems.findFirst({ where: (t, { eq: eqOp }) => eqOp(t.id, id) });
  if (!row) return c.json({ error: 'Menu item not found' }, 404);
  return c.json(serialize(row));
});

const createItemRoute = createRoute({
  method: 'post',
  path: '/menu/items',
  tags: ['Menu'],
  summary: 'Create a menu item',
  request: {
    body: { content: { 'application/json': { schema: InsertMenuItemSchema } }, required: true },
  },
  responses: {
    201: { content: { 'application/json': { schema: MenuItemSchema } }, description: 'Created item' },
    404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Category not found' },
    422: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Validation error' },
  },
});

app.openapi(createItemRoute, async (c) => {
  const db = getDb(c.env);
  const body = c.req.valid('json');

  // Verify category exists
  const cat = await db.query.menuCategories.findFirst({
    where: (t, { eq: eqOp }) => eqOp(t.id, body.categoryId),
  });
  if (!cat) return c.json({ error: 'Category not found' }, 404);

  const [row] = await db.insert(schema.menuItems).values(body).returning();
  if (!row) return c.json({ error: 'Insert failed' }, 500 as never);
  return c.json(serialize(row), 201);
});

const updateItemRoute = createRoute({
  method: 'put',
  path: '/menu/items/{id}',
  tags: ['Menu'],
  request: {
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: { content: { 'application/json': { schema: UpdateMenuItemSchema } }, required: true },
  },
  responses: {
    200: { content: { 'application/json': { schema: MenuItemSchema } }, description: 'Updated item' },
    404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Not found' },
  },
});

app.openapi(updateItemRoute, async (c) => {
  const db = getDb(c.env);
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');
  const [row] = await db
    .update(schema.menuItems)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(schema.menuItems.id, id))
    .returning();
  if (!row) return c.json({ error: 'Menu item not found' }, 404);
  return c.json(serialize(row));
});

const deleteItemRoute = createRoute({
  method: 'delete',
  path: '/menu/items/{id}',
  tags: ['Menu'],
  request: { params: z.object({ id: z.coerce.number().int().positive() }) },
  responses: {
    204: { description: 'Deleted' },
    404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Not found' },
  },
});

app.openapi(deleteItemRoute, async (c) => {
  const db = getDb(c.env);
  const { id } = c.req.valid('param');
  const [row] = await db
    .delete(schema.menuItems)
    .where(eq(schema.menuItems.id, id))
    .returning({ id: schema.menuItems.id });
  if (!row) return c.json({ error: 'Menu item not found' }, 404);
  return new Response(null, { status: 204 });
});

// Serialize dates to ISO strings for consistent JSON output
function serialize<T extends object>(row: T): T {
  return JSON.parse(JSON.stringify(row));
}

export { app as menuRoutes };
