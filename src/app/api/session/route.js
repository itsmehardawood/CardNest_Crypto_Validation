import { NextResponse } from "next/server";
import { createSession, deleteSession, getSession } from "@/lib/session";

const VALIDATE_TOKEN_URL = "https://cryptolaravel.cardnest.io/api/crypto/validate-token";

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

  if (!merchantId) {
    return NextResponse.json(
      {
        success: false,
        error: "merchant_id is required",
      },
      { status: 400 }
    );
  }

  try {
    const validationResponse = await fetch(VALIDATE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchant_id: String(merchantId),
      }),
    });

    const validationData = await validationResponse.json().catch(() => null);

    if (!validationResponse.ok || validationData?.success === false) {
      return NextResponse.json(
        {
          success: false,
          error: validationData?.error || validationData?.message || "Merchant validation failed",
        },
        { status: validationResponse.status || 400 }
      );
    }
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Merchant validation failed",
      },
      { status: 502 }
    );
  }

  const sessionId = createSession(String(merchantId));

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
