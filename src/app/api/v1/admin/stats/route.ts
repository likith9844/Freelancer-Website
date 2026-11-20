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
      role !== "SUPPORT_ADMIN" &&
      role !== "MODERATOR"
    ) {
      return NextResponse.json({ error: "Forbidden. Administrative access required." }, { status: 403 });
    }

    const db = getDatabase();

    // Financial Metrics computed from Double-Entry General Ledger
    const gatewayInflow = db.ledgerEntries
      .filter((e) => e.accountCode === "1010-GATEWAY-CLEARING" && e.direction === "DEBIT")
      .reduce((s, e) => s + e.amountINR, 0);

    const clientEscrowHeld = db.ledgerEntries
      .filter((e) => e.accountCode === "2010-CLIENT-ESCROW" && e.direction === "CREDIT")
      .reduce((s, e) => s + e.amountINR, 0);

    const clientEscrowReleased = db.ledgerEntries
      .filter((e) => e.accountCode === "2010-CLIENT-ESCROW" && e.direction === "DEBIT")
      .reduce((s, e) => s + e.amountINR, 0);

    const currentNodalEscrowHeld = clientEscrowHeld - clientEscrowReleased;

    const commissionRevenue = db.ledgerEntries
      .filter((e) => e.accountCode.startsWith("40") && e.direction === "CREDIT")
      .reduce((s, e) => s + e.amountINR, 0);

    const gstCollected = db.ledgerEntries
      .filter((e) => e.accountCode.startsWith("2030-GST") && e.direction === "CREDIT")
      .reduce((s, e) => s + e.amountINR, 0);

    const tdsWithheld = db.ledgerEntries
      .filter((e) => e.accountCode.startsWith("2040-TDS") && e.direction === "CREDIT")
      .reduce((s, e) => s + e.amountINR, 0);

    const gmv = db.contracts.reduce((s, c) => s + c.totalValueINR, 0);

    // Counts Breakdown
    const userRoleCounts = db.users.reduce((acc: Record<string, number>, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      stats: {
        financials: {
          gmvINR: gmv,
          gatewayInflowINR: gatewayInflow,
          currentNodalEscrowHeldINR: currentNodalEscrowHeld,
          commissionRevenueINR: commissionRevenue,
          gstCollectedINR: gstCollected,
          tdsWithheldINR: tdsWithheld,
          totalLedgerEntriesCount: db.ledgerEntries.length,
        },
        counts: {
          totalUsers: db.users.length,
          userRoleCounts,
          totalProjects: db.projects.length,
          totalProposals: db.proposals.length,
          totalContracts: db.contracts.length,
          totalDisputes: db.disputes.length,
          openDisputes: db.disputes.filter((d) => d.status === "OPEN").length,
          totalWithdrawals: db.withdrawals.length,
          pendingWithdrawals: db.withdrawals.filter((w) => w.status === "REQUESTED").length,
          totalAuditLogs: db.auditLogs.length,
        },
        systemSettings: db.systemSettings,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to compile admin stats" }, { status: 500 });
  }
}
