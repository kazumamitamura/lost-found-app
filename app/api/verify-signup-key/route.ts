import { NextResponse } from "next/server";

const DEFAULT_SIGNUP_SECRET = "8965";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const key = typeof body?.key === "string" ? body.key.trim() : "";
    const secret = process.env.SIGNUP_SECRET ?? DEFAULT_SIGNUP_SECRET;
    const ok = key === secret;
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
