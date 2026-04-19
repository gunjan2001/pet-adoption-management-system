// drizzle.config.ts  (now in server/ — references local schema + root migrations)
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load local .env file
dotenv.config({ path: "./.env" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "../drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
