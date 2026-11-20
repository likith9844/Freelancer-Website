import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase, DBPayment } from "@/lib/db/store";
import {
  activePaymentProvider,
  calculateClientFundingBreakdown,
  MockDevelopmentPaymentProvider,
} from "@/lib/payments/provider";

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { contractId, milestoneId, paymentMethod = "UPI" } = body;

    if (!contractId || !milestoneId) {
      return NextResponse.json({ error: "contractId and milestoneId are required" }, { status: 400 });
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

    if (milestone.status !== "AWAITING_FUNDING" && milestone.status !== "DRAFT") {
      return NextResponse.json(
        { error: `Milestone cannot be funded. Current status: ${milestone.status}` },
        { status: 400 }
      );
    }

    // Server-side financial breakdown (Zero trust on client-side math)
    const breakdown = calculateClientFundingBreakdown(milestone.amountINR);

    // Call payment provider abstraction
    const orderRef = `ord_${Date.now()}`;
    const orderResult = await activePaymentProvider.createOrder({
      orderId: orderRef,
      amountINR: breakdown.totalPayableINR,
      customerId: auth.user.id,
      notes: {
        contractId: contract.id,
        milestoneId: milestone.id,
        milestoneTitle: milestone.title,
      },
    });

    const paymentId = `pay_${Date.now()}`;
    const newPayment: DBPayment = {
      id: paymentId,
      paymentReference: orderResult.providerOrderId,
      milestoneId: milestone.id,
      clientId: contract.clientId,
      amountINR: breakdown.totalPayableINR,
      status: "INITIATED",
      providerName: "MOCK",
      gatewayOrderId: orderResult.providerOrderId,
      idempotencyKey: `idem_${orderResult.providerOrderId}`,
      createdAt: new Date().toISOString(),
    };

    db.payments.unshift(newPayment);
    saveDatabase(db);

    // Generate mock signature for testing ease
    let mockSignature = "sig_ks_verified";
    if (activePaymentProvider instanceof MockDevelopmentPaymentProvider) {
      mockSignature = activePaymentProvider.generateMockSignature(
        orderResult.providerOrderId,
        paymentId
      );
    }

    return NextResponse.json({
      success: true,
      paymentId,
      order: orderResult,
      breakdown,
      mockSignature, // Provided for 1-click test checkout verification
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create payment order" }, { status: 500 });
  }
}
