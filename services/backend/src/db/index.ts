import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type DbEnv = {
  DATABASE_URL: string;
};

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Returns a Drizzle ORM instance. Lazily initialised and cached for the
 * lifetime of the Worker isolate (connection pooling happens at the
 * Cloudflare Hyperdrive / Neon layer in production).
 */
export function getDb(env: DbEnv) {
  if (!_db) {
    const client = postgres(env.DATABASE_URL, {
      max: 1, // Workers run one request at a time in the isolate
      idle_timeout: 20,
      connect_timeout: 10,
    });
    _db = drizzle(client, { schema, logger: env.DATABASE_URL.includes('localhost') });
  }
  return _db;
}

export type Db = ReturnType<typeof getDb>;

export { schema };
