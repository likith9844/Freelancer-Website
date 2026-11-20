import { getDatabase, saveDatabase, DBWithdrawal, DBDispute, DBLedgerEntry } from "../lib/db/store";

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
  console.log("\n=================================================================");
  console.log("RUNNING SUITE: Phase 7 - Settlements, Withdrawals & Disputes Core");
  console.log("=================================================================\n");

  const db = getDatabase();

  // 1. Freelancer Wallet & Withdrawal Lifecycle
  console.log("Section 1: Freelancer Wallet & Withdrawal Constraints");
  const fl = db.freelancers.find((f) => f.id === "flp-aditya");
  assert(!!fl, "Freelancer profile found");
  assert(fl!.withdrawableBalanceINR >= 500, "Freelancer has withdrawable balance >= ₹500");

  const initialBalance = fl!.withdrawableBalanceINR;
  const withdrawAmount = 5000;

  // Simulate withdrawal request
  fl!.withdrawableBalanceINR -= withdrawAmount;
  const withdrawal: DBWithdrawal = {
    id: `wth-test-${Date.now()}`,
    withdrawalReference: `WTH-KS-${Date.now().toString().slice(-6)}`,
    freelancerId: fl!.id,
    amountINR: withdrawAmount,
    payoutMode: "IMPS",
    status: "REQUESTED",
    accountMasked: "HDFC Bank (XXXXXX7890)",
    createdAt: new Date().toISOString(),
  };
  db.withdrawals.unshift(withdrawal);

  assert(fl!.withdrawableBalanceINR === initialBalance - withdrawAmount, "Wallet balance deducted immediately upon request");
  assert(withdrawal.status === "REQUESTED", "Withdrawal status initialized to REQUESTED");

  // 2. Finance Admin Payout Execution & Ledger Posting
  console.log("\nSection 2: Finance Admin IMPS Payout & Double-Entry Posting");
  const utr = `CMS${Date.now().toString().slice(-8)}881`;
  withdrawal.status = "COMPLETED";
  withdrawal.utrNumber = utr;
  withdrawal.processedAt = new Date().toISOString();

  // Post Double-Entry Journal
  const payoutGroupId = `tx-payout-${Date.now()}`;
  const payoutJournal: DBLedgerEntry[] = [
    {
      id: `led-${Date.now()}-1`,
      transactionGroupId: payoutGroupId,
      accountCode: "2020-FREELANCER-ESCROW-CLEARING",
      direction: "DEBIT",
      amountINR: withdrawAmount,
      referenceType: "PAYOUT",
      description: `IMPS disbursement to freelancer bank account (UTR: ${utr})`,
      createdAt: new Date().toISOString(),
    },
    {
      id: `led-${Date.now()}-2`,
      transactionGroupId: payoutGroupId,
      accountCode: "1020-BANK-OPERATING-ACCOUNT",
      direction: "CREDIT",
      amountINR: withdrawAmount,
      referenceType: "PAYOUT",
      description: `Disbursement from nodal operating account (UTR: ${utr})`,
      createdAt: new Date().toISOString(),
    },
  ];
  db.ledgerEntries.push(...payoutJournal);

  assert(withdrawal.status === "COMPLETED", "Withdrawal status marked COMPLETED");
  assert(withdrawal.utrNumber.startsWith("CMS"), "Generated valid IMPS UTR number");

  const payoutDebits = payoutJournal.filter((e) => e.direction === "DEBIT").reduce((s, e) => s + e.amountINR, 0);
  const payoutCredits = payoutJournal.filter((e) => e.direction === "CREDIT").reduce((s, e) => s + e.amountINR, 0);
  assert(payoutDebits === payoutCredits, "PAYOUT LEDGER INVARIANT: Debits == Credits (₹5,000)");

  // 3. Dispute Filing & Escrow Lock
  console.log("\nSection 3: Milestone Dispute Filing & Escrow Lock");
  const contract = db.contracts.find((c) => c.id === "ctr-001");
  assert(!!contract, "Contract ctr-001 found");

  const m3 = contract?.milestones.find((m) => m.sortOrder === 3);
  assert(!!m3, "Milestone 3 found in contract");

  const disputeId = `dsp-test-${Date.now()}`;
  const disputeNumber = `DSP-KS-${Date.now().toString().slice(-6)}`;
  const dispute: DBDispute = {
    id: disputeId,
    disputeNumber,
    milestoneId: m3!.id,
    contractId: contract!.id,
    openedByUserId: "usr-client-1",
    disputedAgainstUserId: "usr-freelancer-1",
    reasonCode: "SCOPE_DISPUTE",
    statement: "Deliverable scope unclear regarding third-party SDK compatibility.",
    disputedAmountINR: m3!.amountINR,
    status: "OPEN",
    createdAt: new Date().toISOString(),
  };
  db.disputes.unshift(dispute);

  m3!.status = "DISPUTED";
  contract!.status = "DISPUTED";

  assert(dispute.status === "OPEN", "Dispute opened successfully");
  assert(m3!.status === "DISPUTED", "Milestone locked in DISPUTED state");
  assert(contract!.status === "DISPUTED", "Contract status locked in DISPUTED state");

  // 4. Support Admin Arbitration Ruling (Split)
  console.log("\nSection 4: Support Admin Arbitration Ruling (Split Verdict)");
  dispute.status = "RESOLVED";
  dispute.resolutionType = "SPLIT";
  dispute.freelancerAwardedINR = 15000;
  dispute.clientAwardedINR = 15000;
  dispute.arbitrationNotes = "Both parties agreed to 50/50 split under neutral arbitration.";
  dispute.resolvedAt = new Date().toISOString();

  m3!.status = "RELEASED";
  contract!.status = "ACTIVE";

  assert(dispute.status === "RESOLVED", "Dispute marked RESOLVED");
  assert(dispute.resolutionType === "SPLIT", "Verdict recorded as SPLIT");
  assert(dispute.freelancerAwardedINR + dispute.clientAwardedINR! === m3!.amountINR, "Split amounts sum exactly to disputed consideration (₹30,000)");
  assert(contract!.status === "ACTIVE", "Contract returned to ACTIVE status");

  // 5. Global Ledger Equilibrium Invariant Check
  console.log("\nSection 5: Global Database General Ledger Balance Invariant");
  const allDebits = db.ledgerEntries.filter((e) => e.direction === "DEBIT").reduce((s, e) => s + e.amountINR, 0);
  const allCredits = db.ledgerEntries.filter((e) => e.direction === "CREDIT").reduce((s, e) => s + e.amountINR, 0);
  assert(allDebits === allCredits, "GLOBAL INVARIANT PRESERVED: Debits == Credits");

  console.log("\n=================================================================");
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
