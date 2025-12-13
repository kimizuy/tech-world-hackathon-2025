import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Connection pool configuration for TiDB (MySQL compatible)
export const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Export the drizzle instance
export const db = drizzle({ client: pool });
