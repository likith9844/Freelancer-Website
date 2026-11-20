import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase, DBAuditLog, DBLedgerEntry } from "@/lib/db/store";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Permission: only FINANCE_ADMIN or SUPER_ADMIN
    if (auth.user.role !== "FINANCE_ADMIN" && auth.user.role !== "SUPER_ADMIN" && auth.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Payout authorization requires FINANCE_ADMIN role." }, { status: 403 });
    }

    const body = await req.json();
    const { action, reason } = body; // "APPROVE" | "REJECT"

    if (!["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Supported: APPROVE, REJECT" }, { status: 400 });
    }

    const db = getDatabase();
    const withdrawal = db.withdrawals.find((w) => w.id === id || w.withdrawalReference === id);
    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    }

    if (withdrawal.status !== "REQUESTED" && withdrawal.status !== "PROCESSING") {
      return NextResponse.json({ error: `Withdrawal has already been marked as ${withdrawal.status}.` }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (action === "APPROVE") {
      const utr = body.utrNumber?.trim() || `CMS${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`;
      withdrawal.status = "COMPLETED";
      withdrawal.utrNumber = utr;
      withdrawal.processedAt = now;

      // ATOMIC DOUBLE-ENTRY GENERAL LEDGER POSTING
      const transactionGroupId = `tx-payout-${Date.now()}`;
      const payoutJournal: DBLedgerEntry[] = [
        {
          id: `led-${Date.now()}-1`,
          transactionGroupId,
          accountCode: "2020-FREELANCER-ESCROW-CLEARING",
          direction: "DEBIT",
          amountINR: withdrawal.amountINR,
          referenceType: "PAYOUT",
          description: `Disbursement to Freelancer bank account ${withdrawal.accountMasked} (UTR: ${utr})`,
          createdAt: now,
        },
        {
          id: `led-${Date.now()}-2`,
          transactionGroupId,
          accountCode: "1020-BANK-OPERATING-ACCOUNT",
          direction: "CREDIT",
          amountINR: withdrawal.amountINR,
          referenceType: "PAYOUT",
          description: `Bank IMPS payout settlement via Nodal Account (UTR: ${utr})`,
          createdAt: now,
        },
      ];

      db.ledgerEntries.push(...payoutJournal);

      // Audit log
      const audit: DBAuditLog = {
        id: `aud-${Date.now()}`,
        actorUserId: auth.user.id,
        actorEmail: auth.user.email,
        actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
        action: "PAYOUT_APPROVED_AND_EXECUTED",
        entityType: "WITHDRAWAL",
        entityId: withdrawal.id,
        newState: { status: "COMPLETED", amountINR: withdrawal.amountINR, utrNumber: utr },
        reason: reason || "Finance Admin verified bank details and executed instant IMPS payout.",
        createdAt: now,
      };
      db.auditLogs.unshift(audit);

      saveDatabase(db);

      return NextResponse.json({
        success: true,
        message: `Payout of ₹${withdrawal.amountINR.toLocaleString("en-IN")} executed successfully (UTR: ${utr}).`,
        withdrawal,
        utrNumber: utr,
      });
    }

    if (action === "REJECT") {
      withdrawal.status = "REJECTED";
      withdrawal.processedAt = now;

      // Re-credit freelancer balance
      const flProfile = db.freelancers.find((f) => f.id === withdrawal.freelancerId);
      if (flProfile) {
        flProfile.withdrawableBalanceINR += withdrawal.amountINR;
      }

      // Audit log
      const audit: DBAuditLog = {
        id: `aud-${Date.now()}`,
        actorUserId: auth.user.id,
        actorEmail: auth.user.email,
        actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
        action: "PAYOUT_REJECTED_REFUNDED_TO_WALLET",
        entityType: "WITHDRAWAL",
        entityId: withdrawal.id,
        newState: { status: "REJECTED", amountINR: withdrawal.amountINR },
        reason: reason || "Finance Admin flagged payout request (re-credited to freelancer balance).",
        createdAt: now,
      };
      db.auditLogs.unshift(audit);

      saveDatabase(db);

      return NextResponse.json({
        success: true,
        message: `Withdrawal request rejected. Funds returned to freelancer wallet.`,
        withdrawal,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process withdrawal action" }, { status: 500 });
  }
}
