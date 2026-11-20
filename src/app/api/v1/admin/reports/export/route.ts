import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, PERMISSIONS, isAdminRole } from "@/lib/auth/rbac";
import { generateCsvExport } from "@/lib/reports/tax-reports";

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminRole(auth.user.role) && !hasPermission(auth.user.role, PERMISSIONS.FINANCE_REPORTS)) {
      return NextResponse.json({ error: "Forbidden: Finance reports permission required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const typeParam = (searchParams.get("type") || "TDS").toUpperCase();

    if (!["TDS", "GST", "LEDGER"].includes(typeParam)) {
      return NextResponse.json(
        { error: "Invalid export type. Allowed: TDS, GST, LEDGER" },
        { status: 400 }
      );
    }

    const csvData = generateCsvExport(typeParam as "TDS" | "GST" | "LEDGER");
    const filename = `karyasetu_${typeParam.toLowerCase()}_report_${Date.now()}.csv`;

    return new Response(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to export report CSV", details: error.message },
      { status: 500 }
    );
  }
}
