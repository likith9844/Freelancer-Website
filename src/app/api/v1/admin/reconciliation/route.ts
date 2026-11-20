import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, PERMISSIONS, isAdminRole } from "@/lib/auth/rbac";
import { performLedgerReconciliation } from "@/lib/reports/reconciliation";

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminRole(auth.user.role) && !hasPermission(auth.user.role, PERMISSIONS.FINANCE_REPORTS)) {
      return NextResponse.json({ error: "Forbidden: Finance reports permission required" }, { status: 403 });
    }

    const report = performLedgerReconciliation();

    return NextResponse.json({
      success: true,
      reconciliation: report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate reconciliation report", details: error.message },
      { status: 500 }
    );
  }
}
