"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, deleteSession, getSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";

export interface SignupResult {
  success: boolean;
  error?: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

export async function signupUser(
  email: string,
  password: string,
  name: string | null,
  role: "citizen" | "staff",
  departmentId?: string,
): Promise<SignupResult> {
  try {
    // Check if email already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        error: "このメールアドレスは既に登録されています",
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    await db.insert(users).values({
      email,
      passwordHash,
      name,
      role,
      departmentId: role === "staff" ? departmentId : null,
    });

    // Get the created user
    const [newUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Create session
    await createSession({
      userId: newUser.id,
      role: newUser.role as "citizen" | "staff",
      departmentId: newUser.departmentId ?? undefined,
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      error: "登録に失敗しました。もう一度お試しください。",
    };
  }
}

export async function loginUser(
  email: string,
  password: string,
  role: "citizen" | "staff",
): Promise<LoginResult> {
  try {
    // Find user by email and role
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.role, role)))
      .limit(1);

    if (!user) {
      return {
        success: false,
        error: "メールアドレスまたはパスワードが正しくありません",
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return {
        success: false,
        error: "メールアドレスまたはパスワードが正しくありません",
      };
    }

    // Create session
    await createSession({
      userId: user.id,
      role: user.role as "citizen" | "staff",
      departmentId: user.departmentId ?? undefined,
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "ログインに失敗しました。もう一度お試しください。",
    };
  }
}

export async function logoutUser(): Promise<void> {
  await deleteSession();
  redirect("/");
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      departmentId: users.departmentId,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user ?? null;
}
