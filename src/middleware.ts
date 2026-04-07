import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production-obviously"
);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("ml-session")?.value;

  let isLoggedIn = false;
  if (token) {
    try {
      await jwtVerify(token, SECRET);
      isLoggedIn = true;
    } catch {
      // Invalid/expired token
    }
  }

  if (!isLoggedIn) {
    // API routes get a 401 JSON response, not a redirect
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Only protect routes that require authentication
export const config = {
  matcher: [
    "/discover/:path*",
    "/matches/:path*",
    "/chat/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
    "/api/users/:path*",
    "/api/discover/:path*",
    "/api/matches/:path*",
    "/api/chat/:path*",
    "/api/integrations/:path*",
    "/integrations/:path*",
  ],
};
