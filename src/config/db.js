const { Pool } = require('pg');
require('dotenv').config(); // This will load .env variables if running locally,
                           // but in Docker, environment variables are passed directly.

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST, // This will be 'db' when running in Docker Compose
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // In a production setup, you might have a more robust error handling/restart strategy.
  // For development, exiting is fine.
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};