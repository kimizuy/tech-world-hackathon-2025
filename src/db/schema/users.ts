import { mysqlTable, varchar, timestamp, int } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }),
  role: varchar("role", { length: 20 }).notNull(), // "citizen" | "staff"
  departmentId: varchar("department_id", { length: 50 }), // staff only: "resident", "tax", etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
