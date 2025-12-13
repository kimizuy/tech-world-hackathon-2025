import { pool } from "@/db";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";

interface VersionRow extends RowDataPacket {
  current_time: Date;
  version: string;
}

export async function GET() {
  try {
    // Simple query to verify database connection (MySQL/TiDB compatible)
    const [rows] = await pool.query<VersionRow[]>(
      "SELECT NOW() as `current_time`, VERSION() as `version`"
    );
    const row = rows[0];

    return NextResponse.json({
      status: "healthy",
      database: {
        connected: true,
        currentTime: row.current_time,
        version: row.version,
      },
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        database: {
          connected: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 503 }
    );
  }
}
