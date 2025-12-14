import { NextResponse } from "next/server";

/**
 * Mock face verification endpoint
 * Always returns success for development/testing
 */
export async function POST() {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return NextResponse.json({
    is_match: true,
    similarity: 0.85 + Math.random() * 0.1, // 0.85-0.95
    threshold: 0.4,
    message: "本人確認に成功しました",
  });
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    mode: "mock",
    message: "This is a mock face verification endpoint",
  });
}
