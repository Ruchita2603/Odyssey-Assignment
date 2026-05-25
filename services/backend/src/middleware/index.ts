import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { MiddlewareHandler } from 'hono';

export const corsMiddleware = cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
});

export const loggerMiddleware = logger();

export const notFoundHandler = () =>
  Response.json({ error: 'Not found' }, { status: 404 });

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
