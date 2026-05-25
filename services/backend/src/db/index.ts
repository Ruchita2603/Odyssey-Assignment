import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type DbEnv = {
  DATABASE_URL?: string;
};

export function getDb(env: DbEnv) {
  const url = env?.DATABASE_URL 
    ?? process.env['DATABASE_URL'] 
    ?? 'postgresql://postgres:password@localhost:5432/odyssey_restaurant';

  const client = postgres(url, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 30,
    ssl: false,
  });

  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof getDb>;
export { schema };