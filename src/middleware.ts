import { NextRequest, NextResponse } from "next/server";

interface SessionData {
  userId: number;
  role: "citizen" | "staff";
  departmentId?: string;
}

function getSessionFromCookie(request: NextRequest): SessionData | null {
  const sessionCookie = request.cookies.get("session");
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

// Routes that require citizen authentication
const citizenProtectedRoutes = ["/user/reception", "/user/department"];

// Routes that require staff authentication
const staffProtectedRoutes = ["/office/dashboard", "/office/assign"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = getSessionFromCookie(request);

  // Check citizen protected routes
  for (const route of citizenProtectedRoutes) {
    if (pathname.startsWith(route)) {
      if (!session || session.role !== "citizen") {
        return NextResponse.redirect(new URL("/user/login", request.url));
      }
    }
  }

  // Check staff protected routes
  for (const route of staffProtectedRoutes) {
    if (pathname.startsWith(route)) {
      if (!session || session.role !== "staff") {
        return NextResponse.redirect(new URL("/office/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/user/reception/:path*",
    "/user/department/:path*",
    "/office/dashboard/:path*",
    "/office/assign/:path*",
  ],
};
