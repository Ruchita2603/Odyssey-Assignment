/**
 * Exports the OpenAPI spec from the running backend and writes it to
 * packages/api-client/openapi.json for Orval to consume.
 *
 * Usage: pnpm gen:contract (runs after backend dev server is up)
 * Or: tsx src/lib/export-spec.ts (generate spec directly without server)
 */
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import the app directly to extract the spec without a running server
import app from '../index';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  // Mock env for spec generation (no real DB call needed)
  const req = new Request('http://localhost/openapi.json');
  const res = await app.fetch(req, { DATABASE_URL: '' } as never, {} as never);
  const spec = await res.json();

  const outDir = resolve(__dirname, '../../../../packages/api-client');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'openapi.json');
  writeFileSync(outPath, JSON.stringify(spec, null, 2));
  console.log(`OpenAPI spec written to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
