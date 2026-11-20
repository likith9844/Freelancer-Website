import {
  MockDevelopmentPaymentProvider,
  calculateClientFundingBreakdown,
  calculateFreelancerSettlementBreakdown,
  generateEscrowFundingJournalEntries,
  generateEscrowReleaseJournalEntries,
} from "../lib/payments/provider";
import { getDatabase, saveDatabase } from "../lib/db/store";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n============================================================");
  console.log("RUNNING SUITE: Phase 6 - Payments & Double-Entry Ledger Core");
  console.log("============================================================\n");

  const provider = new MockDevelopmentPaymentProvider();

  // 1. Payment Provider Abstraction
  console.log("Section 1: Payment Provider Abstraction (IPaymentProvider)");
  const order = await provider.createOrder({
    orderId: "ord-test-1",
    amountINR: 52805,
    customerId: "usr-client-1",
    notes: { milestoneId: "ml-2" },
  });

  assert(order.providerOrderId.startsWith("order_ks_"), "Provider generated valid order reference");
  assert(order.currency === "INR", "Order currency is strictly INR");
  assert(order.amountINR === 52805, "Order amount matches ₹52,805");

  const sig = provider.generateMockSignature(order.providerOrderId, "pay-test-1");
  assert(typeof sig === "string" && sig.length === 64, "Generated valid HMAC-SHA256 signature");
  assert(provider.verifyPaymentSignature({ orderId: order.providerOrderId, paymentId: "pay-test-1", signature: sig }) === true, "Valid signature successfully verified");
  assert(provider.verifyPaymentSignature({ orderId: order.providerOrderId, paymentId: "pay-test-1", signature: "bad_sig" }) === false, "Tampered signature rejected");

  // 2. Server-Side Financial Math: Client Funding
  console.log("\nSection 2: Server-Side Indian Client Fee & GST Calculation");
  const clientBreakdown = calculateClientFundingBreakdown(50000, { clientServiceFeeRate: 0.03, gstRate: 0.18, gatewayHandlingFeeRate: 0.02 });
  assert(clientBreakdown.milestoneAmountINR === 50000, "Milestone consideration is ₹50,000");
  assert(clientBreakdown.clientServiceFeeINR === 1500, "Client service fee is strictly 3% (₹1,500)");
  assert(clientBreakdown.gstOnServiceFeeINR === 270, "GST on platform fee is strictly 18% (₹270)");
  assert(clientBreakdown.pgFeeINR === 1035, "Payment gateway interchange fee is strictly 2% (₹1,035)");
  assert(clientBreakdown.totalPayableINR === 52805, "Total payable is strictly ₹52,805 (Zero frontend math trust)");
  assert(clientBreakdown.sacCode === "998314", "Service accounting code SAC 998314 assigned");

  // 3. Server-Side Financial Math: Freelancer Settlement
  console.log("\nSection 3: Server-Side Indian Freelancer TDS & Commission Calculation");
  const flBreakdown = calculateFreelancerSettlementBreakdown(50000, { freelancerCommissionRate: 0.10, gstRate: 0.18, tdsRate: 0.01 });
  assert(flBreakdown.grossMilestoneINR === 50000, "Gross milestone consideration is ₹50,000");
  assert(flBreakdown.platformCommissionINR === 5000, "Platform commission is strictly 10% (₹5,000)");
  assert(flBreakdown.gstOnCommissionINR === 900, "GST on commission is strictly 18% (₹900)");
  assert(flBreakdown.tds194OINR === 500, "Section 194-O TDS is strictly 1% (₹500)");
  assert(flBreakdown.netWithdrawablePayoutINR === 43600, "Net withdrawable payout is strictly ₹43,600 (50k - 5k - 900 - 500)");

  // 4. Double-Entry General Ledger: Escrow Funding Invariant
  console.log("\nSection 4: Atomic Double-Entry Ledger - Escrow Funding");
  const fundingJournal = generateEscrowFundingJournalEntries("tx-test-fund", clientBreakdown, "Milestone 2 Funding");
  assert(fundingJournal.length === 5, "Funding journal contains 5 balanced accounts");

  const fundDebits = fundingJournal.filter((e) => e.direction === "DEBIT").reduce((s, e) => s + e.amountINR, 0);
  const fundCredits = fundingJournal.filter((e) => e.direction === "CREDIT").reduce((s, e) => s + e.amountINR, 0);
  assert(fundDebits === clientBreakdown.totalPayableINR, "Total debits match total client payment inflow (₹52,805)");
  assert(fundCredits === clientBreakdown.totalPayableINR, "Total credits match total allocated accounts (₹52,805)");
  assert(fundDebits === fundCredits, "MATHEMATICAL INVARIANT SATISFIED: Funding Debits == Credits");

  // 5. Double-Entry General Ledger: Escrow Release Invariant
  console.log("\nSection 5: Atomic Double-Entry Ledger - Escrow Release");
  const releaseJournal = generateEscrowReleaseJournalEntries("tx-test-release", flBreakdown, "Milestone 2 Release");
  assert(releaseJournal.length === 5, "Release journal contains 5 balanced accounts");

  const relDebits = releaseJournal.filter((e) => e.direction === "DEBIT").reduce((s, e) => s + e.amountINR, 0);
  const relCredits = releaseJournal.filter((e) => e.direction === "CREDIT").reduce((s, e) => s + e.amountINR, 0);
  assert(relDebits === flBreakdown.grossMilestoneINR, "Total debits match gross milestone escrow release (₹50,000)");
  assert(relCredits === flBreakdown.grossMilestoneINR, "Total credits match allocated settlements & taxes (₹50,000)");
  assert(relDebits === relCredits, "MATHEMATICAL INVARIANT SATISFIED: Release Debits == Credits");

  // 6. Global Platform General Ledger Equilibrium Check
  console.log("\nSection 6: Global Database Ledger Equilibrium Invariant");
  const db = getDatabase();
  const allDebits = db.ledgerEntries.filter((e) => e.direction === "DEBIT").reduce((s, e) => s + e.amountINR, 0);
  const allCredits = db.ledgerEntries.filter((e) => e.direction === "CREDIT").reduce((s, e) => s + e.amountINR, 0);
  console.log(`  Total Global Ledger Debits:  ₹${allDebits.toLocaleString("en-IN")}`);
  console.log(`  Total Global Ledger Credits: ₹${allCredits.toLocaleString("en-IN")}`);
  assert(allDebits === allCredits, "GLOBAL INVARIANT: Total General Ledger Debits == Total General Ledger Credits");

  console.log("\n============================================================");
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("============================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
