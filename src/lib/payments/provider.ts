import crypto from "crypto";
import { DBLedgerEntry, DBPayment } from "../db/store";

export interface CreateOrderParams {
  orderId: string;
  amountINR: number;
  customerId: string;
  notes?: Record<string, any>;
}

export interface PaymentOrderResult {
  providerOrderId: string;
  amountINR: number;
  currency: string;
  keyId: string;
  notes?: Record<string, any>;
}

export interface VerifySignatureParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface SplitTransferParams {
  transferId: string;
  sourceAccount: string;
  targetAccount: string;
  amountINR: number;
}

export interface RefundParams {
  paymentId: string;
  amountINR: number;
  reason: string;
}

export interface IPaymentProvider {
  name: string;
  createOrder(params: CreateOrderParams): Promise<PaymentOrderResult>;
  verifyPaymentSignature(params: VerifySignatureParams): boolean;
  createEscrowSplitTransfer(params: SplitTransferParams): Promise<{ success: boolean; transferRef: string }>;
  createRefund(params: RefundParams): Promise<{ success: boolean; refundRef: string }>;
  handleWebhook(rawBody: string, signature: string): { event: string; payload: any };
}

/**
 * Mock Development Payment Provider
 * Simulates high-throughput marketplace split payments & escrow holding (e.g. Razorpay Route / Cashfree Split)
 */
export class MockDevelopmentPaymentProvider implements IPaymentProvider {
  name = "MockDevelopmentPaymentProvider (Razorpay Route / Cashfree Split Sim)";
  private secret = "ks_live_webhook_secret_mock_2026";

  async createOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    const providerOrderId = `order_ks_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    return {
      providerOrderId,
      amountINR: params.amountINR,
      currency: "INR",
      keyId: "rzp_test_KaryaSetuEscrow2026",
      notes: params.notes,
    };
  }

  verifyPaymentSignature(params: VerifySignatureParams): boolean {
    // In mock mode, any signature matching the pattern or standard mock token is verified
    if (params.signature.startsWith("sig_ks_") || params.signature === "demo_success_sig") {
      return true;
    }
    // Also support cryptographic HMAC matching for rigorous tests
    const expected = crypto
      .createHmac("sha256", this.secret)
      .update(`${params.orderId}|${params.paymentId}`)
      .digest("hex");
    return params.signature === expected;
  }

  generateMockSignature(orderId: string, paymentId: string): string {
    return crypto
      .createHmac("sha256", this.secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
  }

  async createEscrowSplitTransfer(params: SplitTransferParams): Promise<{ success: boolean; transferRef: string }> {
    return {
      success: true,
      transferRef: `trf_route_${Date.now()}_${params.targetAccount}`,
    };
  }

  async createRefund(params: RefundParams): Promise<{ success: boolean; refundRef: string }> {
    return {
      success: true,
      refundRef: `rfnd_ks_${Date.now()}`,
    };
  }

  handleWebhook(rawBody: string, signature: string): { event: string; payload: any } {
    try {
      const parsed = JSON.parse(rawBody);
      return { event: parsed.event || "payment.captured", payload: parsed.payload || parsed };
    } catch {
      return { event: "unknown", payload: null };
    }
  }
}

export const activePaymentProvider: IPaymentProvider = new MockDevelopmentPaymentProvider();

// ==========================================
// SERVER-SIDE INDIAN FINANCIAL CALCULATIONS
// ==========================================

export interface ClientFundingBreakdown {
  milestoneAmountINR: number;
  clientServiceFeeINR: number;     // 3% platform fee
  gstOnServiceFeeINR: number;      // 18% GST on platform fee
  pgFeeINR: number;                // 2% gateway processing fee
  totalPayableINR: number;         // Gross charged to Client
  sacCode: string;                 // SAC 998314
}

import { getDatabase } from "../db/store";

export interface MarketplaceSettings {
  clientServiceFeeRate: number;
  freelancerCommissionRate: number;
  gstRate: number;
  gatewayHandlingFeeRate: number;
  tdsRate: number;
  minWithdrawalINR: number;
  autoReleaseDays: number;
  escrowHoldDelayDays: number;
  razorpayRouteMode: "SIMULATION" | "LIVE";
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayWebhookSecret: string;
}

export function getMarketplaceSettings(): MarketplaceSettings {
  try {
    const db = getDatabase();
    const s = db.systemSettings || {};
    return {
      clientServiceFeeRate: typeof s.clientServiceFeeRate === "number" ? s.clientServiceFeeRate : 0.03,
      freelancerCommissionRate: typeof s.freelancerCommissionRate === "number" ? s.freelancerCommissionRate : 0.10,
      gstRate: typeof s.gstRate === "number" ? s.gstRate : 0.18,
      gatewayHandlingFeeRate: typeof s.gatewayHandlingFeeRate === "number" ? s.gatewayHandlingFeeRate : 0.02,
      tdsRate: typeof s.tdsRate === "number" ? s.tdsRate : 0.01,
      minWithdrawalINR: typeof s.minWithdrawalINR === "number" ? s.minWithdrawalINR : 500,
      autoReleaseDays: typeof s.autoReleaseDays === "number" ? s.autoReleaseDays : 14,
      escrowHoldDelayDays: typeof s.escrowHoldDelayDays === "number" ? s.escrowHoldDelayDays : 0,
      razorpayRouteMode: s.razorpayRouteMode || "SIMULATION",
      razorpayKeyId: s.razorpayKeyId || "rzp_test_KaryaSetuRoute2026",
      razorpayKeySecret: s.razorpayKeySecret || "ks_route_secret_2026",
      razorpayWebhookSecret: s.razorpayWebhookSecret || "ks_webhook_sec_2026",
    };
  } catch {
    return {
      clientServiceFeeRate: 0.03,
      freelancerCommissionRate: 0.10,
      gstRate: 0.18,
      gatewayHandlingFeeRate: 0.02,
      tdsRate: 0.01,
      minWithdrawalINR: 500,
      autoReleaseDays: 14,
      escrowHoldDelayDays: 0,
      razorpayRouteMode: "SIMULATION",
      razorpayKeyId: "rzp_test_KaryaSetuRoute2026",
      razorpayKeySecret: "ks_route_secret_2026",
      razorpayWebhookSecret: "ks_webhook_sec_2026",
    };
  }
}

export function calculateClientFundingBreakdown(
  milestoneAmountINR: number,
  customRates?: Partial<MarketplaceSettings>
): ClientFundingBreakdown {
  const rates = { ...getMarketplaceSettings(), ...customRates };
  const milestone = Math.round(milestoneAmountINR);
  const clientServiceFeeINR = Math.round(milestone * rates.clientServiceFeeRate);
  const gstOnServiceFeeINR = Math.round(clientServiceFeeINR * rates.gstRate);
  const pgFeeINR = Math.round((milestone + clientServiceFeeINR + gstOnServiceFeeINR) * rates.gatewayHandlingFeeRate);
  const totalPayableINR = milestone + clientServiceFeeINR + gstOnServiceFeeINR + pgFeeINR;

  return {
    milestoneAmountINR: milestone,
    clientServiceFeeINR,
    gstOnServiceFeeINR,
    pgFeeINR,
    totalPayableINR,
    sacCode: "998314", // IT Design & Development Services
  };
}

export interface FreelancerSettlementBreakdown {
  grossMilestoneINR: number;
  platformCommissionINR: number;
  gstOnCommissionINR: number;
  tds194OINR: number;
  netWithdrawablePayoutINR: number;
}

export function calculateFreelancerSettlementBreakdown(
  grossMilestoneINR: number,
  customRates?: Partial<MarketplaceSettings>
): FreelancerSettlementBreakdown {
  const rates = { ...getMarketplaceSettings(), ...customRates };
  const gross = Math.round(grossMilestoneINR);
  const platformCommissionINR = Math.round(gross * rates.freelancerCommissionRate);
  const gstOnCommissionINR = Math.round(platformCommissionINR * rates.gstRate);
  const tds194OINR = Math.round(gross * rates.tdsRate);
  const netWithdrawablePayoutINR = gross - platformCommissionINR - gstOnCommissionINR - tds194OINR;

  return {
    grossMilestoneINR: gross,
    platformCommissionINR,
    gstOnCommissionINR,
    tds194OINR,
    netWithdrawablePayoutINR,
  };
}

// ==========================================
// DOUBLE-ENTRY GENERAL LEDGER POSTING ENGINE
// ==========================================

/**
 * Creates balanced journal entries for Client Milestone Funding into Escrow:
 * DEBIT  1010-GATEWAY-CLEARING           (totalPayableINR)
 * CREDIT 2010-CLIENT-ESCROW              (milestoneAmountINR)
 * CREDIT 4010-COMMISSION-REVENUE         (clientServiceFeeINR)
 * CREDIT 2030-GST-PAYABLE                (gstOnServiceFeeINR)
 * CREDIT 5010-GATEWAY-FEES-EXPENSE       (pgFeeINR)  [Contra-recorded as revenue/clearing offset]
 */
export function generateEscrowFundingJournalEntries(
  transactionGroupId: string,
  breakdown: ClientFundingBreakdown,
  description: string
): DBLedgerEntry[] {
  const now = new Date().toISOString();
  const entries: DBLedgerEntry[] = [
    {
      id: `led-${Date.now()}-1`,
      transactionGroupId,
      accountCode: "1010-GATEWAY-CLEARING",
      direction: "DEBIT",
      amountINR: breakdown.totalPayableINR,
      referenceType: "ESCROW_FUNDING",
      description: `Inflow from Client: ${description}`,
      createdAt: now,
    },
    {
      id: `led-${Date.now()}-2`,
      transactionGroupId,
      accountCode: "2010-CLIENT-ESCROW",
      direction: "CREDIT",
      amountINR: breakdown.milestoneAmountINR,
      referenceType: "ESCROW_FUNDING",
      description: `Held in RBI Nodal Escrow for Milestone: ${description}`,
      createdAt: now,
    },
    {
      id: `led-${Date.now()}-3`,
      transactionGroupId,
      accountCode: "4010-COMMISSION-REVENUE",
      direction: "CREDIT",
      amountINR: breakdown.clientServiceFeeINR,
      referenceType: "ESCROW_FUNDING",
      description: "Platform Client Service Fee (3%)",
      createdAt: now,
    },
    {
      id: `led-${Date.now()}-4`,
      transactionGroupId,
      accountCode: "2030-GST-PAYABLE",
      direction: "CREDIT",
      amountINR: breakdown.gstOnServiceFeeINR,
      referenceType: "ESCROW_FUNDING",
      description: "CGST/SGST (18%) on Client Platform Fee",
      createdAt: now,
    },
    {
      id: `led-${Date.now()}-5`,
      transactionGroupId,
      accountCode: "5010-GATEWAY-FEES-EXPENSE",
      direction: "CREDIT",
      amountINR: breakdown.pgFeeINR,
      referenceType: "ESCROW_FUNDING",
      description: "Payment Gateway Interchange Fee (2%)",
      createdAt: now,
    },
  ];

  // Mathematical Invariant Check: Debits == Credits
  const debits = entries.filter((e) => e.direction === "DEBIT").reduce((s, e) => s + e.amountINR, 0);
  const credits = entries.filter((e) => e.direction === "CREDIT").reduce((s, e) => s + e.amountINR, 0);
  if (debits !== credits) {
    throw new Error(`CRITICAL LEDGER IMBALANCE: Debits (₹${debits}) != Credits (₹${credits})`);
  }

  return entries;
}

/**
 * Creates balanced journal entries for Escrow Milestone Release to Freelancer:
 * DEBIT  2010-CLIENT-ESCROW                  (grossMilestoneINR)
 * CREDIT 2020-FREELANCER-ESCROW-CLEARING     (netWithdrawablePayoutINR)
 * CREDIT 4010-COMMISSION-REVENUE             (platformCommissionINR)
 * CREDIT 2030-GST-PAYABLE                    (gstOnCommissionINR)
 * CREDIT 2040-TDS-PAYABLE-194O               (tds194OINR)
 */
export function generateEscrowReleaseJournalEntries(
  transactionGroupId: string,
  breakdown: FreelancerSettlementBreakdown,
  description: string
): DBLedgerEntry[] {
  const now = new Date().toISOString();
  const entries: DBLedgerEntry[] = [
    {
      id: `led-${Date.now()}-1`,
      transactionGroupId,
      accountCode: "2010-CLIENT-ESCROW",
      direction: "DEBIT",
      amountINR: breakdown.grossMilestoneINR,
      referenceType: "MILESTONE_RELEASE",
      description: `Release from Client Escrow: ${description}`,
      createdAt: now,
    },
    {
      id: `led-${Date.now()}-2`,
      transactionGroupId,
      accountCode: "2020-FREELANCER-ESCROW-CLEARING",
      direction: "CREDIT",
      amountINR: breakdown.netWithdrawablePayoutINR,
      referenceType: "MILESTONE_RELEASE",
      description: "Net settlement credited to Freelancer withdrawable balance",
      createdAt: now,
    },
    {
      id: `led-${Date.now()}-3`,
      transactionGroupId,
      accountCode: "4010-COMMISSION-REVENUE",
      direction: "CREDIT",
      amountINR: breakdown.platformCommissionINR,
      referenceType: "MILESTONE_RELEASE",
      description: "Platform Freelancer Commission (10%)",
      createdAt: now,
    },
    {
      id: `led-${Date.now()}-4`,
      transactionGroupId,
      accountCode: "2030-GST-PAYABLE",
      direction: "CREDIT",
      amountINR: breakdown.gstOnCommissionINR,
      referenceType: "MILESTONE_RELEASE",
      description: "CGST/SGST (18%) on Freelancer Commission",
      createdAt: now,
    },
    {
      id: `led-${Date.now()}-5`,
      transactionGroupId,
      accountCode: "2040-TDS-PAYABLE-194O",
      direction: "CREDIT",
      amountINR: breakdown.tds194OINR,
      referenceType: "MILESTONE_RELEASE",
      description: "Section 194-O Income Tax TDS (1% to PAN)",
      createdAt: now,
    },
  ];

  // Mathematical Invariant Check: Debits == Credits
  const debits = entries.filter((e) => e.direction === "DEBIT").reduce((s, e) => s + e.amountINR, 0);
  const credits = entries.filter((e) => e.direction === "CREDIT").reduce((s, e) => s + e.amountINR, 0);
  if (debits !== credits) {
    throw new Error(`CRITICAL LEDGER IMBALANCE: Debits (₹${debits}) != Credits (₹${credits})`);
  }

  return entries;
}

export const generateMilestoneReleaseJournalEntries = generateEscrowReleaseJournalEntries;
