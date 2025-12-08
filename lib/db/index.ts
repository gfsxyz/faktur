import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Singleton pattern to reuse database connection across hot reloads
const globalForDb = global as unknown as { db: ReturnType<typeof drizzle> };

let pool: Pool;

if (!globalForDb.db) {
  pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres@localhost:5432/faktur_dev",
  });
  globalForDb.db = drizzle(pool, { schema });
}

export const db = globalForDb.db;
