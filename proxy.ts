import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow auth API and login page
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    /\.(ico|png|svg|webmanifest|jpg|jpeg)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Internal API routes check their own cookie
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const session = req.cookies.get("sa_session")?.value;
  if (session !== "1") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
