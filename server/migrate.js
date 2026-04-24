#!/usr/bin/env node

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client);

(async () => {
  try {
    console.log('Running migrations...');

    await migrate(db, {
      migrationsFolder: '../drizzle/migrations',
    });

    console.log('✅ Migrations completed');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
})();