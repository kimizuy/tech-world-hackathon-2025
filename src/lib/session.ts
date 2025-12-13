import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionUser = {
  id: number;
  email: string;
};

export type SessionData = {
  user?: SessionUser;
};

declare module "iron-session" {
  interface IronSessionData {
    user?: SessionUser;
  }
}

export const sessionOptions: SessionOptions = {
  cookieName: "tw_session",
  password: process.env.SESSION_PASSWORD ?? "",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
    path: "/",
  },
};

export async function getSession() {
  const secret = process.env.SESSION_PASSWORD;
  if (!secret) {
    throw new Error("Missing SESSION_PASSWORD env var");
  }

  if (secret.length < 32) {
    throw new Error("SESSION_PASSWORD must be at least 32 characters");
  }

  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
