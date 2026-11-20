import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = auth.user.role;
    if (
      role !== "SUPER_ADMIN" &&
      role !== "ADMIN" &&
      role !== "FINANCE_ADMIN" &&
      role !== "SUPPORT_ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden. Administrative access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");

    const db = getDatabase();
    let logs = [...db.auditLogs];

    if (action) {
      logs = logs.filter((l) => l.action.toLowerCase().includes(action.toLowerCase()));
    }
    if (entityType) {
      logs = logs.filter((l) => l.entityType.toLowerCase() === entityType.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      count: logs.length,
      auditLogs: logs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
