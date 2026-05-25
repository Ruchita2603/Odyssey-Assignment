import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import {
  corsMiddleware,
  loggerMiddleware,
  errorHandler,
  notFoundHandler,
} from './middleware';
import { menuRoutes } from './routes/menu';
import { orderRoutes } from './routes/orders';
import { customerRoutes } from './routes/customers';
import { settingsRoutes } from './routes/settings';
import { dashboardRoutes } from './routes/dashboard';

export type Env = {
  Bindings: {
    DATABASE_URL: string;
    ENVIRONMENT?: string;
  };
};

const app = new OpenAPIHono<Env>();

// ─── Global middleware ────────────────────────────────────────────────────────
app.use('*', corsMiddleware);
app.use('*', loggerMiddleware);
app.use('*', errorHandler);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() }),
);

// ─── API routes ───────────────────────────────────────────────────────────────
app.route('/', menuRoutes);
app.route('/', orderRoutes);
app.route('/', customerRoutes);
app.route('/', settingsRoutes);
app.route('/', dashboardRoutes);

// ─── OpenAPI spec ─────────────────────────────────────────────────────────────
app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    title: 'Odyssey Restaurant API',
    version: '1.0.0',
    description: 'Restaurant operations backend — menu, orders, customers, settings.',
  },
  servers: [
    { url: 'http://localhost:8787', description: 'Local development' },
    { url: 'https://odyssey-backend.workers.dev', description: 'Production' },
  ],
});

app.get('/docs', swaggerUI({ url: '/openapi.json' }));

app.notFound(notFoundHandler);

export default app;
