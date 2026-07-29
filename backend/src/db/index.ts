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
    await client.query('BEGIN');
    await client.query(`SET LOCAL ROLE app_user`);
    await client.query(`SELECT set_config('app.current_org', $1, true)`, [organizationId]);
    
    const tenantDb = drizzle(client, { schema });
    const result = await callback(tenantDb);
    
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
