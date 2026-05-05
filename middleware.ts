import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/verify", "/forgot-password", "/reset-password", "/invite"];
const API_PUBLIC = ["/api/auth"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public API routes
  if (API_PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next();

  // Allow public pages
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"))) return NextResponse.next();

  // Require auth for everything else
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

// Use Node.js runtime instead of Edge to avoid Prisma compatibility issues
export const runtime = "nodejs";
