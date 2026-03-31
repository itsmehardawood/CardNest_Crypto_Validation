import { NextResponse } from "next/server";
import { getSession } from "./src/lib/session";

function accessDeniedResponse() {
  return new NextResponse("Access Denied", {
    status: 403,
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

function handleSessionGate(request) {
  const { pathname, searchParams } = request.nextUrl;

  if (
    pathname === "/api/session" ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    // Allow direct page visits; the page itself handles secure-session UI state.
    return NextResponse.next();
  }

  const session = getSession(sessionId);

  if (!session) {
    return accessDeniedResponse();
  }

  return NextResponse.next();
}

// Next.js 16 introduced proxy as the primary interception export.
export function proxy(request) {
  return handleSessionGate(request);
}

// Backward-compatible export for projects still using middleware semantics.
export function middleware(request) {
  return handleSessionGate(request);
}

export const config = {
  matcher: ["/:path*"],
};
