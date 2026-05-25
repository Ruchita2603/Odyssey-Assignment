import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const url =
  process.env['DATABASE_URL'] ??
  'postgresql://postgres:password@localhost:5432/odyssey_restaurant';

async function main() {
  console.log('Running migrations…');
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('Migrations complete.');
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
