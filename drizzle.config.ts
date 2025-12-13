import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local for Next.js compatibility
config({ path: ".env.local" });

const parseDbUrl = (url: string) => {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 3306,
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1),
  };
};

const dbCredentials = parseDbUrl(process.env.DATABASE_URL!);

export default defineConfig({
  dialect: "mysql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials,
});
