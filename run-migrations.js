import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log('Running database migrations...');

    // Read and execute migrations in order
    const migrations = [
      '001_create_events_table.sql',
      '002_create_users_table.sql',
      '003_create_event_attendees.sql'
    ];

    for (const migration of migrations) {
      const filePath = join(__dirname, 'db', 'migrations', migration);
      const sql = readFileSync(filePath, 'utf8');

      console.log(`Running migration: ${migration}`);
      await client.query(sql);
      console.log(`✓ ${migration} completed`);
    }

    console.log('\n✓ All migrations completed successfully!');
  } catch (err) {
    console.error('Error running migrations:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
