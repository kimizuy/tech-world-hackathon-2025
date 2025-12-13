import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Connection pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Export the drizzle instance
export const db = drizzle({ client: pool });

// Export pool for direct access if needed (e.g., health checks)
export { pool };
