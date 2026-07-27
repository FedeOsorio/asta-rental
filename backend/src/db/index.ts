import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from '../config/env.js';
import * as schema from './schema.js';

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL
});

// Unscoped global db (used for system operations like login/signup before tenant context)
export const db = drizzle(pool, { schema });

/**
 * Execute Drizzle ORM queries within a connection configured with `app.current_org` for Postgres RLS.
 */
export async function withTenantDb<T>(
  organizationId: string,
  callback: (tenantDb: ReturnType<typeof drizzle<typeof schema>>) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query(`SELECT set_config('app.current_org', $1, false)`, [organizationId]);
    const tenantDb = drizzle(client, { schema });
    return await callback(tenantDb);
  } finally {
    await client.query(`SELECT set_config('app.current_org', '', false)`).catch(() => {});
    client.release();
  }
}
