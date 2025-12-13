import { cookies } from "next/headers";

export interface SessionData {
  userId: number;
  role: "citizen" | "staff";
  departmentId?: string;
}

const SESSION_COOKIE_NAME = "session";

export async function createSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const sessionValue = Buffer.from(JSON.stringify(data)).toString("base64");

  cookieStore.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const decoded = Buffer.from(sessionCookie.value, "base64").toString(
      "utf-8",
    );
    return JSON.parse(decoded) as SessionData;
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
