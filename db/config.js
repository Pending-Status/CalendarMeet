import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
export const isTestEnv =
  process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

// Create a connection pool (disabled in tests to avoid touching real DBs)
let pool;
if (isTestEnv) {
  const notAvailable = () => {
    throw new Error('Database access is disabled while running tests');
  };
  pool = {
    query: notAvailable,
    connect: notAvailable,
  };
} else {
  pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'calendarmeet',
    password: process.env.PGPASSWORD,
    port: parseInt(process.env.PGPORT || '5432'),
  });

  // Test the connection
  pool.connect((err, client, release) => {
    if (err) {
      console.error('Error connecting to PostgreSQL:', err);
    } else {
      console.log('Successfully connected to PostgreSQL');
      release();
    }
  });
}

export default pool;
