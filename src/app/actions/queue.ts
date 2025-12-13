"use server";

import { db } from "@/db";
import { waitingQueue, users } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, and, sql, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface QueueEntry {
  id: number;
  citizenId: number;
  citizenName: string | null;
  departmentId: string;
  ticketNumber: number;
  status: string;
  staffId: number | null;
  roomId: string | null;
  createdAt: Date;
}

export interface JoinQueueResult {
  success: boolean;
  ticketNumber?: number;
  error?: string;
}

export async function joinQueue(
  departmentId: string,
): Promise<JoinQueueResult> {
  const session = await getSession();
  if (!session || session.role !== "citizen") {
    return { success: false, error: "ログインが必要です" };
  }

  try {
    // Check if citizen already has an active queue entry
    const existing = await db
      .select()
      .from(waitingQueue)
      .where(
        and(
          eq(waitingQueue.citizenId, session.userId),
          eq(waitingQueue.status, "waiting"),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return {
        success: true,
        ticketNumber: existing[0].ticketNumber,
      };
    }

    // Get next ticket number for this department today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [lastTicket] = await db
      .select({ maxTicket: sql<number>`MAX(${waitingQueue.ticketNumber})` })
      .from(waitingQueue)
      .where(
        and(
          eq(waitingQueue.departmentId, departmentId),
          sql`${waitingQueue.createdAt} >= ${today}`,
        ),
      );

    const ticketNumber = (lastTicket?.maxTicket ?? 0) + 1;

    // Insert queue entry
    await db.insert(waitingQueue).values({
      citizenId: session.userId,
      departmentId,
      ticketNumber,
      status: "waiting",
    });

    return { success: true, ticketNumber };
  } catch (error) {
    console.error("Join queue error:", error);
    return { success: false, error: "待機キューへの登録に失敗しました" };
  }
}

export async function getWaitingCitizens(
  departmentId: string,
): Promise<QueueEntry[]> {
  const session = await getSession();
  if (!session || session.role !== "staff") {
    return [];
  }

  const entries = await db
    .select({
      id: waitingQueue.id,
      citizenId: waitingQueue.citizenId,
      citizenName: users.name,
      departmentId: waitingQueue.departmentId,
      ticketNumber: waitingQueue.ticketNumber,
      status: waitingQueue.status,
      staffId: waitingQueue.staffId,
      roomId: waitingQueue.roomId,
      createdAt: waitingQueue.createdAt,
    })
    .from(waitingQueue)
    .leftJoin(users, eq(waitingQueue.citizenId, users.id))
    .where(
      and(
        eq(waitingQueue.departmentId, departmentId),
        eq(waitingQueue.status, "waiting"),
      ),
    )
    .orderBy(waitingQueue.ticketNumber);

  return entries;
}

export interface StartConsultationResult {
  success: boolean;
  roomId?: string;
  error?: string;
}

export async function startConsultation(
  queueId: number,
): Promise<StartConsultationResult> {
  const session = await getSession();
  if (!session || session.role !== "staff") {
    return { success: false, error: "職員としてログインが必要です" };
  }

  try {
    // Generate unique room ID
    const roomId = `consultation-${nanoid(10)}`;

    // Update queue entry
    await db
      .update(waitingQueue)
      .set({
        status: "in_progress",
        staffId: session.userId,
        roomId,
        updatedAt: new Date(),
      })
      .where(eq(waitingQueue.id, queueId));

    return { success: true, roomId };
  } catch (error) {
    console.error("Start consultation error:", error);
    return { success: false, error: "相談の開始に失敗しました" };
  }
}

export async function completeConsultation(queueId: number): Promise<boolean> {
  const session = await getSession();
  if (!session || session.role !== "staff") {
    return false;
  }

  try {
    await db
      .update(waitingQueue)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(waitingQueue.id, queueId));

    return true;
  } catch (error) {
    console.error("Complete consultation error:", error);
    return false;
  }
}

export async function getCitizenQueueStatus(): Promise<QueueEntry | null> {
  const session = await getSession();
  if (!session || session.role !== "citizen") {
    return null;
  }

  const [entry] = await db
    .select({
      id: waitingQueue.id,
      citizenId: waitingQueue.citizenId,
      citizenName: users.name,
      departmentId: waitingQueue.departmentId,
      ticketNumber: waitingQueue.ticketNumber,
      status: waitingQueue.status,
      staffId: waitingQueue.staffId,
      roomId: waitingQueue.roomId,
      createdAt: waitingQueue.createdAt,
    })
    .from(waitingQueue)
    .leftJoin(users, eq(waitingQueue.citizenId, users.id))
    .where(
      and(
        eq(waitingQueue.citizenId, session.userId),
        sql`${waitingQueue.status} IN ('waiting', 'in_progress')`,
      ),
    )
    .orderBy(desc(waitingQueue.createdAt))
    .limit(1);

  return entry ?? null;
}

export async function getQueuePosition(
  departmentId: string,
  ticketNumber: number,
): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(waitingQueue)
    .where(
      and(
        eq(waitingQueue.departmentId, departmentId),
        eq(waitingQueue.status, "waiting"),
        sql`${waitingQueue.ticketNumber} < ${ticketNumber}`,
      ),
    );

  return result?.count ?? 0;
}
