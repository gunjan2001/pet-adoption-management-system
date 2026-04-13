// drizzle.config.ts  (stays at root — references server schema + root migrations)
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load server .env so DATABASE_URL is available when running from root
dotenv.config({ path: "./server/.env" });

export default defineConfig({
  schema: "./server/src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
