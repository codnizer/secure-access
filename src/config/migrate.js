const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function runMigrations() {
  try {
    const client = await pool.connect();
    console.log('Connected to the database for migrations.');

    // Create a table to track applied migrations
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('Migrations table ensured.');

    const migrationFiles = fs.readdirSync(path.join(__dirname, '../../migrations')).sort();

    for (const file of migrationFiles) {
      const migrationName = path.basename(file, '.sql');

      // Check if migration has already been applied
      const { rows } = await client.query('SELECT id FROM migrations WHERE name = $1', [migrationName]);
      if (rows.length > 0) {
        console.log(`Migration ${migrationName} already applied, skipping.`);
        continue;
      }

      console.log(`Applying migration: ${migrationName}`);
      const sql = fs.readFileSync(path.join(__dirname, '../../migrations', file), 'utf8');
      await client.query(sql);
      await client.query('INSERT INTO migrations (name) VALUES ($1)', [migrationName]);
      console.log(`Migration ${migrationName} applied successfully.`);
    }

    console.log('All migrations applied.');
    client.release();
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await pool.end(); // Close the pool after migrations
  }
}

runMigrations();