import { NextResponse } from "next/server";
import { performLedgerReconciliation } from "@/lib/reports/reconciliation";

export async function GET() {
  try {
    const reconciliation = performLedgerReconciliation();

    if (reconciliation.ledgerImbalance !== 0) {
      return NextResponse.json(
        {
          status: "NOT_READY",
          reason: "Critical General Ledger Imbalance detected",
          ledgerImbalanceINR: reconciliation.ledgerImbalance,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: "READY",
        timestamp: new Date().toISOString(),
        ledgerStatus: reconciliation.status,
        totalDebitsINR: reconciliation.totalDebits,
        totalCreditsINR: reconciliation.totalCredits,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "NOT_READY",
        error: error.message,
      },
      { status: 503 }
    );
  }
}
