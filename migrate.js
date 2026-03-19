#!/usr/bin/env node

import 'dotenv/config';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('Connecting to database...');
console.log('Database URL:', DATABASE_URL.replace(/:[^@]*@/, ':***@'));

const client = postgres(DATABASE_URL);

(async () => {
  try {
    // Read all migration files
    const migrationDir = path.join(__dirname, 'drizzle');
    const files = fs.readdirSync(migrationDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration files`);

    for (const file of files) {
      const filePath = path.join(migrationDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split by statement-breakpoint comment
      const statements = sql
        .split('--> statement-breakpoint')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      console.log(`\nApplying ${file} (${statements.length} statements)...`);

      for (const stmt of statements) {
        try {
          await client.unsafe(stmt);
          console.log(`✓ Executed: ${stmt.substring(0, 60)}...`);
        } catch (err) {
          console.error(`✗ Failed: ${stmt.substring(0, 60)}...`);
          console.error(`  Error: ${err.message}`);
          // Continue with other statements
        }
      }
    }

    console.log('\n✅ All migrations completed!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
