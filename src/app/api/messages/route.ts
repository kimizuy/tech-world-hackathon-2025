import { db } from "@/db";
import { messages } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all messages
export async function GET() {
  try {
    const result = await db
      .select()
      .from(messages)
      .orderBy(desc(messages.createdAt))
      .limit(50);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

// POST: Create a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, content } = body;

    if (!username || !content) {
      return NextResponse.json(
        { error: "Username and content are required" },
        { status: 400 },
      );
    }

    await db.insert(messages).values({
      username,
      content,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to create message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 },
    );
  }
}
