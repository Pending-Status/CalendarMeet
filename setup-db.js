import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log('Setting up database tables...\n');

    // Create events table
    console.log('Creating events table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(21) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        "start" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end" TIMESTAMP WITH TIME ZONE,
        all_day BOOLEAN DEFAULT FALSE,
        type VARCHAR(64),
        recurrence JSONB,
        extended_props JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Events table created\n');

    // Create citext extension and users table
    console.log('Creating users table...');
    await client.query('CREATE EXTENSION IF NOT EXISTS citext;');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        firebase_uid VARCHAR(128) PRIMARY KEY,
        email CITEXT UNIQUE NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        photo_url TEXT,
        major VARCHAR(255),
        year VARCHAR(64),
        bio TEXT,
        interests TEXT[] DEFAULT '{}',
        friends TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table created\n');

    // Create event_attendees table
    console.log('Creating event_attendees table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_attendees (
        event_id VARCHAR(21) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_uid VARCHAR(128) NOT NULL,
        status VARCHAR(16) NOT NULL CHECK (status IN ('going', 'maybe', 'declined')),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (event_id, user_uid)
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS event_attendees_event_id_idx ON event_attendees(event_id);
    `);
    console.log('✓ Event attendees table created\n');

    console.log('✓ All database tables created successfully!');
  } catch (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
