import { pool, db } from './src/db/index.js';
import * as schema from './src/db/schema.js';
import { drizzle } from 'drizzle-orm/node-postgres';

async function test() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname IN ('app_user', 'postgres')");
    console.log(res.rows);
  } finally {
    client.release();
  }
  process.exit(0);
}
test();
