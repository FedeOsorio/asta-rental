import pg from 'pg';
import { env } from '../config/env.js';

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL
});

/**
 * Execute database queries within a connection configured with `app.current_org` for Postgres RLS.
 */
export async function withTenantClient<T>(
  organizationId: string,
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query(`SELECT set_config('app.current_org', $1, false)`, [organizationId]);
    return await callback(client);
  } finally {
    await client.query(`SELECT set_config('app.current_org', '', false)`).catch(() => {});
    client.release();
  }
}
