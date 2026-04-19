// src/config/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../db/schema"; // ← no .js

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in .env — server cannot start");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max:                    20,
  idleTimeoutMillis:  30_000,
  connectionTimeoutMillis: 2_000,
});

// Handle pool events for better debugging and stability
// pool.on("connect", () => {
//   console.log("✅ PostgreSQL pool connected");
// });

// To log the error if any occur during connection acquisition or query execution
// pool.on("error", (err: Error) => {
//   console.error("❌ Unexpected PostgreSQL pool error:", err.message);
//   process.exit(-1);
// });

export const db = drizzle(pool, { schema });

export default db;