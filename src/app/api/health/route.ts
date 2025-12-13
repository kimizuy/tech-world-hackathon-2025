import { pool } from "@/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Simple query to verify database connection
    const result = await pool.query(
      "SELECT NOW() as current_time, version() as pg_version"
    );
    const row = result.rows[0];

    return NextResponse.json({
      status: "healthy",
      database: {
        connected: true,
        currentTime: row.current_time,
        version: row.pg_version,
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
