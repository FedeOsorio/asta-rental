import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('🔄 Running Drizzle migrations...');
  
  // 1. Run Drizzle schema migrations
  await migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') });
  console.log('✅ Schema migrations completed.');

  // 2. Apply RLS policies SQL
  console.log('🔒 Applying Row Level Security policies...');
  const rlsSqlPath = path.join(__dirname, 'migrations/sql/001_enable_rls.sql');
  if (fs.existsSync(rlsSqlPath)) {
    const rlsSql = fs.readFileSync(rlsSqlPath, 'utf8');
    await pool.query(rlsSql);
    console.log('✅ RLS policies applied successfully.');
  }

  await pool.end();
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
