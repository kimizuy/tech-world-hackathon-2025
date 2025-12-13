import { mysqlTable, varchar, timestamp, int } from "drizzle-orm/mysql-core";

export const waitingQueue = mysqlTable("waiting_queue", {
  id: int("id").primaryKey().autoincrement(),
  citizenId: int("citizen_id").notNull(), // references users.id
  departmentId: varchar("department_id", { length: 50 }).notNull(),
  ticketNumber: int("ticket_number").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // "waiting" | "in_progress" | "completed"
  staffId: int("staff_id"), // assigned staff
  roomId: varchar("room_id", { length: 100 }), // LiveKit room
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type WaitingQueueEntry = typeof waitingQueue.$inferSelect;
export type NewWaitingQueueEntry = typeof waitingQueue.$inferInsert;
