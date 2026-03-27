import { NextResponse } from "next/server";
import { createSession, deleteSession, getSession } from "@/lib/session";

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON body",
      },
      { status: 400 }
    );
  }

  const merchantId = payload?.merchant_id;
  const authToken = payload?.auth_token;

  if (!merchantId || !authToken) {
    return NextResponse.json(
      {
        success: false,
        error: "merchant_id and auth_token are required",
      },
      { status: 400 }
    );
  }

  const sessionId = createSession(String(merchantId), String(authToken));

  return NextResponse.json({
    success: true,
    session_id: sessionId,
    redirect_to: `/?session_id=${encodeURIComponent(sessionId)}`,
  });
}

export async function GET(request) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      {
        success: false,
        error: "session_id is required",
      },
      { status: 400 }
    );
  }

  const session = getSession(sessionId);

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: "Access Denied",
      },
      { status: 403 }
    );
  }

  // One-time use: consume immediately after successful validation.
  deleteSession(sessionId);

  return NextResponse.json({
    success: true,
    merchant_id: session.merchantId,
  });
}
