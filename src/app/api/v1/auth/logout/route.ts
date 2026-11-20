import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    await destroySession();
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to terminate session" }, { status: 500 });
  }
}
