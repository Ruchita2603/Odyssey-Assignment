import { createRoute, z } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import {
  createApp,
  SettingSchema,
  BulkUpdateSettingsSchema,
  ErrorSchema,
} from '../lib/schemas';
import { getDb, schema } from '../db';

const app = createApp();

const listSettingsRoute = createRoute({
  method: 'get',
  path: '/settings',
  tags: ['Settings'],
  summary: 'List all settings',
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(SettingSchema) } },
      description: 'All settings',
    },
  },
});

app.openapi(listSettingsRoute, async (c) => {
  const db = getDb(c.env);
  const rows = await db.query.settings.findMany({
    orderBy: (t, { asc }) => [asc(t.key)],
  });
  return c.json(rows.map(serialize));
});

const getSettingRoute = createRoute({
  method: 'get',
  path: '/settings/{key}',
  tags: ['Settings'],
  request: { params: z.object({ key: z.string().min(1) }) },
  responses: {
    200: { content: { 'application/json': { schema: SettingSchema } }, description: 'Setting' },
    404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Not found' },
  },
});

app.openapi(getSettingRoute, async (c) => {
  const db = getDb(c.env);
  const { key } = c.req.valid('param');
  const row = await db.query.settings.findFirst({
    where: (t, { eq: eqOp }) => eqOp(t.key, key),
  });
  if (!row) return c.json({ error: 'Setting not found' }, 404);
  return c.json(serialize(row));
});

const bulkUpdateSettingsRoute = createRoute({
  method: 'put',
  path: '/settings',
  tags: ['Settings'],
  summary: 'Bulk upsert settings',
  request: {
    body: { content: { 'application/json': { schema: BulkUpdateSettingsSchema } }, required: true },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(SettingSchema) } },
      description: 'Updated settings',
    },
  },
});

app.openapi(bulkUpdateSettingsRoute, async (c) => {
  const db = getDb(c.env);
  const { settings: incoming } = c.req.valid('json');

  const updated = [];
  for (const { key, value } of incoming) {
    const [row] = await db
      .insert(schema.settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: schema.settings.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    if (row) updated.push(row);
  }

  return c.json(updated.map(serialize));
});

function serialize<T extends object>(row: T): T {
  return JSON.parse(JSON.stringify(row));
}

export { app as settingsRoutes };
