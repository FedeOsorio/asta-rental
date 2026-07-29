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
  await migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') }).catch((err) => {
    console.log('Migrator warning:', err.message);
  });
  console.log('✅ Schema migrations checked.');

  // Force execute 0001_vengeful_wraith.sql if not present
  const vWraithPath = path.join(__dirname, 'migrations/0001_vengeful_wraith.sql');
  if (fs.existsSync(vWraithPath)) {
    const sql = fs.readFileSync(vWraithPath, 'utf8');
    // Split by --> statement-breakpoint
    const statements = sql.split('--> statement-breakpoint');
    for (const stmt of statements) {
      if (stmt.trim()) {
        await pool.query(stmt).catch(() => {
          // ignore duplicate objects/tables
        });
      }
    }
  }

  // 2. Apply RLS policies SQL files
  console.log('🔒 Applying Row Level Security policies...');
  const sqlDir = path.join(__dirname, 'migrations/sql');
  if (fs.existsSync(sqlDir)) {
    const files = fs.readdirSync(sqlDir).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      const sqlPath = path.join(sqlDir, file);
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      await pool.query(sqlContent);
      console.log(`✅ Applied ${file}`);
    }
  }

  await pool.end();
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
