import { getDatabase } from "../lib/db/store";
import { performLedgerReconciliation } from "../lib/reports/reconciliation";
import {
  generateTaxReportSummary,
  generateCsvExport,
} from "../lib/reports/tax-reports";

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
  console.log("\n=======================================================");
  console.log("RUNNING SUITE: Phase 10 - Analytics, Reconciliation & Tax Reporting");
  console.log("=======================================================\n");

  const db = getDatabase();

  // Section 1: Double-Entry General Ledger Trial Balance & Invariant Verification
  console.log("Section 1: Double-Entry General Ledger Trial Balance & Invariant Verification");

  const rec = performLedgerReconciliation();
  assert(rec.totalDebits > 0, `Total Debits tracked (> 0): ₹${rec.totalDebits.toLocaleString("en-IN")}`);
  assert(rec.totalCredits > 0, `Total Credits tracked (> 0): ₹${rec.totalCredits.toLocaleString("en-IN")}`);
  assert(
    rec.totalDebits === rec.totalCredits,
    `General Ledger Balances Invariant: Debits (₹${rec.totalDebits}) == Credits (₹${rec.totalCredits})`
  );
  assert(rec.ledgerImbalance === 0, "Ledger Imbalance variance is exactly ₹0");
  assert(rec.status === "BALANCED", "Reconciliation status is BALANCED");

  // Section 2: Chart of Accounts Verification
  console.log("\nSection 2: Chart of Accounts & Trial Balance Matrix");
  assert(rec.accounts.length >= 7, "All 7 standard Indian marketplace ledger accounts cataloged");

  const gatewayClearing = rec.accounts.find((a) => a.accountCode === "1010-GATEWAY-CLEARING");
  assert(!!gatewayClearing, "Account 1010-GATEWAY-CLEARING present in trial balance");
  assert(gatewayClearing?.category === "ASSET", "Gateway Clearing categorized as ASSET");

  const escrowLiability = rec.accounts.find((a) => a.accountCode === "2010-CLIENT-ESCROW");
  assert(!!escrowLiability, "Account 2010-CLIENT-ESCROW present in trial balance");
  assert(escrowLiability?.category === "LIABILITY", "Escrow Payable categorized as LIABILITY");

  const gstOutput = rec.accounts.find((a) => a.accountCode === "2030-GST-PAYABLE");
  assert(!!gstOutput, "Account 2030-GST-PAYABLE present in trial balance");

  const tds194O = rec.accounts.find((a) => a.accountCode === "2040-TDS-PAYABLE-194O");
  assert(!!tds194O, "Account 2040-TDS-PAYABLE-194O present in trial balance");

  const commRevenue = rec.accounts.find((a) => a.accountCode === "4010-COMMISSION-REVENUE");
  assert(!!commRevenue, "Account 4010-COMMISSION-REVENUE present in trial balance");
  assert(commRevenue?.category === "REVENUE", "Commission categorized as REVENUE");

  // Section 3: Payment Gateway & Escrow Sub-ledger Reconciliations
  console.log("\nSection 3: Payment Gateway & Escrow Sub-ledger Reconciliations");
  assert(
    rec.reconciliations.gateway.isReconciled,
    `Gateway Reconciliation verified: Captured payments (₹${rec.reconciliations.gateway.totalCapturedINR}) match 1010 clearing debits`
  );
  assert(
    rec.reconciliations.gateway.varianceINR === 0,
    "Gateway settlement variance is ₹0"
  );
  assert(
    rec.reconciliations.escrow.isReconciled,
    `RBI Nodal Escrow Reconciliation verified: Active milestones (₹${rec.reconciliations.escrow.activeMilestoneCommitmentINR}) match 2010 net escrow liability`
  );
  assert(
    rec.reconciliations.escrow.varianceINR === 0,
    "Nodal Escrow liability variance is ₹0"
  );

  // Section 4: Indian Tax Reporting Engine (Section 194-O TDS & GST SAC 998314)
  console.log("\nSection 4: Indian Tax Reporting Engine (Section 194-O TDS & GST SAC 998314)");

  const tax = generateTaxReportSummary();
  assert(tax.financialYear === "FY 2026-27", "Financial year is FY 2026-27");
  assert(tax.tds.section === "194-O", "TDS section mapped to Section 194-O");
  assert(tax.tds.records.length >= 1, "Freelancer TDS deduction records compiled");

  const firstTds = tax.tds.records[0];
  const expectedTds = Math.round(firstTds.grossAmountINR * 0.01);
  assert(
    firstTds.tdsDeductedINR === expectedTds,
    `Section 194-O 1% TDS calculated correctly: ₹${firstTds.tdsDeductedINR} on Gross ₹${firstTds.grossAmountINR}`
  );
  assert(
    firstTds.panNumber.length === 10,
    `Freelancer PAN is valid 10-char format: ${firstTds.panNumber}`
  );

  assert(tax.gst.sacCode === "998314", "Service Accounting Code SAC is 998314");
  assert(tax.gst.records.length >= 1, "GST taxable transactions compiled");
  assert(
    tax.gst.totalGstCollectedINR === tax.gst.totalCgstINR + tax.gst.totalSgstINR + tax.gst.totalIgstINR,
    "GST Output Liability matches CGST + SGST + IGST total"
  );

  // Section 5: CSV Export Engine & RFC 4180 Compliance
  console.log("\nSection 5: Regulatory CSV Export Engine (TRACES & GSTN compliant)");

  const tdsCsv = generateCsvExport("TDS");
  assert(tdsCsv.includes("Financial Year,Quarter,Section,Freelancer ID"), "TDS CSV header row verified");
  assert(tdsCsv.includes("194-O"), "TDS CSV contains Section 194-O code");
  assert(tdsCsv.split("\r\n").length >= 2, "TDS CSV contains data rows");

  const gstCsv = generateCsvExport("GST");
  assert(gstCsv.includes("Invoice ID,Date,Recipient Name,Recipient GSTIN"), "GST CSV header row verified");
  assert(gstCsv.includes("998314"), "GST CSV contains SAC 998314");
  assert(gstCsv.split("\r\n").length >= 2, "GST CSV contains invoice records");

  const ledgerCsv = generateCsvExport("LEDGER");
  assert(ledgerCsv.includes("Entry ID,Timestamp,Transaction Group ID,Account Code"), "Ledger CSV header row verified");
  assert(ledgerCsv.split("\r\n").length >= db.ledgerEntries.length + 1, "Ledger CSV contains all journal entries");

  console.log("\n=======================================================");
  console.log(`TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
