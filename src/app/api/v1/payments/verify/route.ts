import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase, DBAuditLog, DBMessage } from "@/lib/db/store";
import {
  activePaymentProvider,
  calculateClientFundingBreakdown,
  generateEscrowFundingJournalEntries,
} from "@/lib/payments/provider";

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, paymentId, signature, contractId, milestoneId } = body;

    if (!orderId || !signature || !contractId || !milestoneId) {
      return NextResponse.json({ error: "Missing verification parameters" }, { status: 400 });
    }

    // Cryptographic signature check
    const isValidSignature = activePaymentProvider.verifyPaymentSignature({
      orderId,
      paymentId: paymentId || "pay_test",
      signature,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid payment gateway signature" }, { status: 400 });
    }

    const db = getDatabase();
    const contract = db.contracts.find((c) => c.id === contractId || c.contractNumber === contractId);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const milestone = contract.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // Idempotency check: Has this milestone already been funded?
    if (milestone.status === "FUNDED" || milestone.status === "RELEASED") {
      return NextResponse.json({
        success: true,
        message: "Payment already verified and credited previously (Idempotent replay).",
        milestone,
      });
    }

    const now = new Date().toISOString();
    const breakdown = calculateClientFundingBreakdown(milestone.amountINR);

    // Update payment record
    const payment = db.payments.find((p) => p.paymentReference === orderId || p.id === paymentId);
    if (payment) {
      payment.status = "CAPTURED";
      payment.gatewayPaymentId = paymentId || `pay_cap_${Date.now()}`;
    }

    // Update milestone state
    milestone.status = "FUNDED";
    milestone.fundedAt = now;

    // ATOMIC DOUBLE-ENTRY GENERAL LEDGER POSTING
    const transactionGroupId = `tx-fund-${Date.now()}`;
    const ledgerJournal = generateEscrowFundingJournalEntries(
      transactionGroupId,
      breakdown,
      `Contract ${contract.contractNumber} - ${milestone.title}`
    );
    db.ledgerEntries.push(...ledgerJournal);

    // Workspace notification message
    const notification: DBMessage = {
      id: `msg-${Date.now()}`,
      workspaceId: contract.id,
      senderUserId: "system",
      senderName: "KaryaSetu Escrow Switch",
      senderRole: "SYSTEM",
      content: `🔒 Client funded Milestone "${milestone.title}" (₹${milestone.amountINR.toLocaleString("en-IN")}) via RBI Nodal Escrow. Double-entry transaction ${transactionGroupId} posted. Freelancer may now commence execution.`,
      isSystemMessage: true,
      createdAt: now,
    };
    db.messages.push(notification);

    // Audit log
    const audit: DBAuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
      action: "ESCROW_PAYMENT_VERIFIED_AND_POSTED",
      entityType: "PAYMENT",
      entityId: orderId,
      newState: {
        milestoneId: milestone.id,
        amountINR: breakdown.totalPayableINR,
        transactionGroupId,
        journalEntriesCount: ledgerJournal.length,
      },
      reason: "Client completed checkout; RBI Nodal Escrow locked funds and updated general ledger",
      createdAt: now,
    };
    db.auditLogs.unshift(audit);

    saveDatabase(db);

    // Generate GST Invoice Number
    const invoiceNumber = `KS-INV-2026-${Math.floor(Math.random() * 90000 + 10000)}`;

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully and funds locked in escrow!",
      milestone,
      transactionGroupId,
      invoice: {
        invoiceNumber,
        sacCode: breakdown.sacCode,
        grossAmount: breakdown.totalPayableINR,
        gstPaid: breakdown.gstOnServiceFeeINR,
        issuedAt: now,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to verify payment" }, { status: 500 });
  }
}
