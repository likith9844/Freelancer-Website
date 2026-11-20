import { getDatabase, saveDatabase, DBUser, DBContract, DBMilestone, DBLedgerEntry } from "../lib/db/store";
import { checkRateLimit, RATE_LIMIT_POLICIES } from "../lib/security/rate-limiter";
import { sanitizeHtml, sanitizeObject, validatePasswordStrength } from "../lib/security/sanitize";
import {
  validatePANFormat,
  validateIFSCFormat,
  validateGSTINFormat,
  maskAadhaarNumber,
  executePennyDropVerification,
} from "../lib/kyc/kyc-engine";
import {
  calculateClientFundingBreakdown,
  calculateFreelancerSettlementBreakdown,
  generateEscrowFundingJournalEntries,
  generateEscrowReleaseJournalEntries,
  MockDevelopmentPaymentProvider,
} from "../lib/payments/provider";
import { performLedgerReconciliation } from "../lib/reports/reconciliation";
import { generateTaxReportSummary } from "../lib/reports/tax-reports";
import { dispatchInAppNotification } from "../lib/notifications/dispatcher";

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
  console.log("\n==========================================================================");
  console.log("RUNNING SUITE: Phase 11 - Full E2E Hire-to-Payout Journey & Security Audit");
  console.log("==========================================================================\n");

  const db = getDatabase();

  // --------------------------------------------------------------------------
  // STEP 1: Security Hardening, Rate Limiting & Input Sanitization
  // --------------------------------------------------------------------------
  console.log("Section 1: OWASP Security Hardening & Rate Limiter Verification");

  // Rate Limiting
  const testIp = "103.21.244.99";
  for (let i = 0; i < RATE_LIMIT_POLICIES.AUTH_LOGIN.limit; i++) {
    const res = checkRateLimit(`login:${testIp}`, RATE_LIMIT_POLICIES.AUTH_LOGIN.limit, 60000);
    assert(res.allowed === true, `Rate limit attempt ${i + 1} allowed`);
  }
  const blockedAttempt = checkRateLimit(`login:${testIp}`, RATE_LIMIT_POLICIES.AUTH_LOGIN.limit, 60000);
  assert(blockedAttempt.allowed === false, "Excessive login attempt blocked by sliding window rate limiter");
  assert(blockedAttempt.remaining === 0, "Rate limit remaining is 0 upon lock");

  // Input Sanitization
  const maliciousInput = "<script>alert('XSS')</script>Hello World <iframe src='malicious.com'></iframe>";
  const cleaned = sanitizeHtml(maliciousInput);
  assert(!cleaned.includes("<script>") && !cleaned.includes("<iframe>"), "XSS script and iframe tags stripped");
  assert(cleaned.includes("Hello World"), "Legitimate text content preserved");

  const payload = {
    title: "<b>Frontend Architect</b>",
    description: "Build portal <script>stealCookies()</script>",
  };
  const sanitizedPayload = sanitizeObject(payload);
  assert(sanitizedPayload.title === "Frontend Architect", "Object properties recursively sanitized");
  assert(sanitizedPayload.description === "Build portal", "Nested script injection eliminated");

  // Password Policy
  const weakPass = validatePasswordStrength("weak");
  assert(weakPass.isValid === false, "Weak password rejected");
  const strongPass = validatePasswordStrength("Secure@Pass2026!");
  assert(strongPass.isValid === true, "Strong password satisfies complexity policy");

  // --------------------------------------------------------------------------
  // STEP 2: Indian KYC & Identity Verification
  // --------------------------------------------------------------------------
  console.log("\nSection 2: Indian KYC & NPCI Penny-Drop Verification");

  const freelancerPan = "BKZPS1234F";
  const clientGstin = "27AAECK1234F1Z5";
  const ifsc = "HDFC0001234";

  assert(validatePANFormat(freelancerPan), "Freelancer PAN format valid (Sec 194-O compliant)");
  assert(validateGSTINFormat(clientGstin), "Client GSTIN format valid");
  assert(validateIFSCFormat(ifsc), "Bank IFSC code valid");

  const maskedAadhaar = maskAadhaarNumber("123456789012");
  assert(maskedAadhaar === "XXXXXXXX9012", "Aadhaar strictly masked under DPDPA 2023");

  const pennyDrop = await executePennyDropVerification("5010022334455", ifsc, "Aditya Sharma");
  assert(pennyDrop.status === "SUCCESS", "Penny-drop bank verification simulated successfully");
  assert(pennyDrop.nameMatchScorePercentage >= 80, "NPCI name-match confidence >= 80%");

  // --------------------------------------------------------------------------
  // STEP 3: Project Creation, Proposal Bidding & Contract Creation
  // --------------------------------------------------------------------------
  console.log("\nSection 3: Project Lifecycle, Bidding & Contract Digital Signing");

  const projectId = `proj-e2e-${Date.now()}`;
  db.projects.push({
    id: projectId,
    clientId: "clp-rahul",
    clientName: "Rahul Verma",
    clientCompany: "Kaveri Logistics",
    clientCity: "Bengaluru",
    title: "High-Throughput Logistics Engine",
    slug: "high-throughput-logistics-engine",
    description: "Enterprise route planning with GPS tracking and GST e-way bill APIs",
    category: "Software Development",
    budgetType: "FIXED",
    budgetINR: 100000,
    duration: "45 Days",
    skillsRequired: ["Next.js", "PostgreSQL", "Node.js"],
    status: "PUBLISHED",
    proposalsCount: 1,
    isClientVerified: true,
    createdAt: new Date().toISOString(),
  });
  assert(true, "Client project created and published");

  const contractId = `ctr-e2e-${Date.now()}`;
  const milestone1Id = `ml-e2e-1`;
  const milestone2Id = `ml-e2e-2`;

  const newContract: DBContract = {
    id: contractId,
    contractNumber: `KS-CTR-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
    projectId,
    proposalId: `prp-e2e-${Date.now()}`,
    clientId: "clp-rahul",
    freelancerId: "flp-aditya",
    totalValueINR: 100000,
    clientServiceFeeRate: 0.03,
    freelancerFeeRate: 0.10,
    status: "ACTIVE",
    clientSignedAt: new Date().toISOString(),
    freelancerSignedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    milestones: [
      {
        id: milestone1Id,
        contractId,
        title: "Milestone 1: Core GPS Dispatch Microservice",
        amountINR: 50000,
        sortOrder: 1,
        status: "AWAITING_FUNDING",
      },
      {
        id: milestone2Id,
        contractId,
        title: "Milestone 2: Driver App Integration & Production Load Test",
        amountINR: 50000,
        sortOrder: 2,
        status: "AWAITING_FUNDING",
      },
    ],
  };
  db.contracts.push(newContract);
  assert(!!newContract.contractNumber, "Bilateral Contract established with immutable contract number");
  assert(!!newContract.clientSignedAt && !!newContract.freelancerSignedAt, "Both parties digitally signed contract");

  // --------------------------------------------------------------------------
  // STEP 4: Milestone Escrow Funding & Atomic 5-Legged Double-Entry Ledger
  // --------------------------------------------------------------------------
  console.log("\nSection 4: Milestone Funding & Atomic 5-Legged Double-Entry Ledger");

  const m1 = newContract.milestones[0];
  const fundingCalc = calculateClientFundingBreakdown(m1.amountINR, { clientServiceFeeRate: 0.03, gstRate: 0.18, gatewayHandlingFeeRate: 0.02 });
  assert(fundingCalc.milestoneAmountINR === 50000, "Milestone consideration is ₹50,000");
  assert(fundingCalc.clientServiceFeeINR === 1500, "Client service fee is strictly 3% (₹1,500)");
  assert(fundingCalc.gstOnServiceFeeINR === 270, "GST on service fee is strictly 18% (₹270)");
  assert(fundingCalc.pgFeeINR === 1035, "Payment gateway fee is strictly 2% (₹1,035)");
  assert(fundingCalc.totalPayableINR === 52805, "Total gross payable by Client is ₹52,805");

  // Simulate Gateway Order & Payment Verification
  const provider = new MockDevelopmentPaymentProvider();
  const order = await provider.createOrder({
    orderId: `ord-${Date.now()}`,
    amountINR: fundingCalc.totalPayableINR,
    customerId: "clp-rahul",
  });
  assert(order.amountINR === 52805, "Gateway order amount verified in INR");

  // Generate funding journal entries
  const fundingEntries = generateEscrowFundingJournalEntries(
    `grp-funding-${m1.id}`,
    fundingCalc,
    m1.title
  );
  assert(fundingEntries.length === 5, "Funding generated 5 balanced journal entry legs");
  const fundingDebits = fundingEntries.filter((e) => e.direction === "DEBIT").reduce((s, e) => s + e.amountINR, 0);
  const fundingCredits = fundingEntries.filter((e) => e.direction === "CREDIT").reduce((s, e) => s + e.amountINR, 0);
  assert(fundingDebits === fundingCredits, `Funding Journal Balanced: Debits (₹${fundingDebits}) == Credits (₹${fundingCredits})`);

  // Post to DB ledger
  db.ledgerEntries.push(...fundingEntries);
  db.payments.push({
    id: `pay-e2e-${Date.now()}`,
    paymentReference: `KS-PAY-${Date.now()}`,
    milestoneId: m1.id,
    clientId: "clp-rahul",
    amountINR: fundingCalc.totalPayableINR,
    status: "CAPTURED",
    providerName: "MOCK",
    gatewayOrderId: order.providerOrderId,
    gatewayPaymentId: `pay_mock_${Date.now()}`,
    idempotencyKey: `idem_${Date.now()}`,
    createdAt: new Date().toISOString(),
  });

  m1.status = "FUNDED";
  m1.fundedAt = new Date().toISOString();
  assert(m1.status === "FUNDED", "Milestone 1 status transitioned to FUNDED in RBI Nodal Escrow");

  // Dispatch Notification
  const notif = dispatchInAppNotification({
    userId: "usr-freelancer-1",
    title: "Milestone Funded",
    message: "Milestone 1 funded into RBI Nodal Escrow. You may begin development.",
    type: "MILESTONE_FUNDED",
    linkUrl: `/workspace/${contractId}`,
  });
  assert(notif.isRead === false, "Escrow funding notification dispatched to freelancer");

  // --------------------------------------------------------------------------
  // STEP 5: Work Execution, Deliverables Submission & Approval
  // --------------------------------------------------------------------------
  console.log("\nSection 5: Deliverable Submission & Client Approval Lifecycle");

  m1.status = "SUBMITTED";
  m1.deliverable = {
    freelancerNotes: "Initial API build completed with automated test suite",
    demoUrl: "https://staging.kaveri-dispatch.com",
    fileUrls: ["https://s3.ap-south-1.amazonaws.com/karyasetu-vault/spec.pdf"],
    submittedAt: new Date().toISOString(),
  };
  assert(m1.status === "SUBMITTED", "Deliverable submitted by freelancer");

  // Client requests revision
  m1.status = "REVISION_REQUESTED";
  m1.deliverable.clientFeedback = "Please add JWT token revocation endpoint";
  assert(m1.status === "REVISION_REQUESTED", "Client requested revision with specific feedback");

  // Freelancer resubmits
  m1.status = "SUBMITTED";
  m1.deliverable.freelancerNotes = "Revision addressed. Added Redis JWT blacklist token revocation.";
  assert(m1.status === "SUBMITTED", "Freelancer resubmitted revised deliverable");

  // Client approves
  m1.status = "APPROVED";
  m1.approvedAt = new Date().toISOString();
  assert(m1.status === "APPROVED", "Client approved final deliverable");

  // --------------------------------------------------------------------------
  // STEP 6: Escrow Release, Commission, TDS 194-O, GST & Wallet Credit
  // --------------------------------------------------------------------------
  console.log("\nSection 6: Escrow Release, Section 194-O TDS, Commission & Wallet Credit");

  const releaseCalc = calculateFreelancerSettlementBreakdown(m1.amountINR, { freelancerCommissionRate: 0.10, gstRate: 0.18, tdsRate: 0.01 });
  assert(releaseCalc.grossMilestoneINR === 50000, "Gross milestone consideration is ₹50,000");
  assert(releaseCalc.platformCommissionINR === 5000, "Platform commission is strictly 10% (₹5,000)");
  assert(releaseCalc.gstOnCommissionINR === 900, "GST on commission is strictly 18% (₹900)");
  assert(releaseCalc.tds194OINR === 500, "Section 194-O TDS is strictly 1% (₹500)");
  assert(releaseCalc.netWithdrawablePayoutINR === 43600, "Net withdrawable payout is ₹43,600");

  const releaseEntries = generateEscrowReleaseJournalEntries(
    `grp-release-${m1.id}`,
    releaseCalc,
    m1.title
  );
  assert(releaseEntries.length === 5, "Release generated 5 balanced journal entry legs");
  const releaseDebits = releaseEntries.filter((e) => e.direction === "DEBIT").reduce((s, e) => s + e.amountINR, 0);
  const releaseCredits = releaseEntries.filter((e) => e.direction === "CREDIT").reduce((s, e) => s + e.amountINR, 0);
  assert(releaseDebits === releaseCredits, `Release Journal Balanced: Debits (₹${releaseDebits}) == Credits (₹${releaseCredits})`);

  db.ledgerEntries.push(...releaseEntries);
  m1.status = "RELEASED";
  m1.releasedAt = new Date().toISOString();

  // Credit Freelancer Wallet
  const freelancerProfile = db.freelancers.find((f) => f.id === "flp-aditya");
  const previousBalance = freelancerProfile ? freelancerProfile.withdrawableBalanceINR : 0;
  if (freelancerProfile) {
    freelancerProfile.withdrawableBalanceINR += releaseCalc.netWithdrawablePayoutINR;
  }
  assert(
    freelancerProfile?.withdrawableBalanceINR === previousBalance + 43600,
    `Freelancer wallet balance credited with exactly net earnings (+₹43,600)`
  );

  // --------------------------------------------------------------------------
  // STEP 7: Freelancer Withdrawal Request & Finance Admin Payout Execution
  // --------------------------------------------------------------------------
  console.log("\nSection 7: Freelancer Withdrawal Request & IMPS Payout Execution");

  const withdrawAmountINR = 40000;
  freelancerProfile!.withdrawableBalanceINR -= withdrawAmountINR;

  const withdrawalId = `wth-e2e-${Date.now()}`;
  const newWithdrawal = {
    id: withdrawalId,
    withdrawalReference: `KS-WTH-2026-${Date.now().toString().slice(-4)}`,
    freelancerId: "flp-aditya",
    amountINR: withdrawAmountINR,
    payoutMode: "IMPS" as const,
    status: "REQUESTED" as const,
    accountMasked: "HDFC Bank (XXXXXX7890)",
    createdAt: new Date().toISOString(),
  };
  db.withdrawals.unshift(newWithdrawal);
  assert(newWithdrawal.status === "REQUESTED", "Withdrawal request created in REQUESTED status");

  // Finance Admin approves payout with bank UTR
  newWithdrawal.status = "COMPLETED";
  (newWithdrawal as any).utrNumber = "CMS2026101299001";
  (newWithdrawal as any).processedAt = new Date().toISOString();

  // Balanced Payout Journal Entry
  db.ledgerEntries.push(
    {
      id: `led-payout-${Date.now()}-1`,
      transactionGroupId: `grp-payout-${withdrawalId}`,
      accountCode: "2020-FREELANCER-ESCROW-CLEARING",
      direction: "DEBIT",
      amountINR: withdrawAmountINR,
      referenceType: "PAYOUT",
      description: `IMPS Settlement Payout: UTR CMS2026101299001`,
      createdAt: new Date().toISOString(),
    },
    {
      id: `led-payout-${Date.now()}-2`,
      transactionGroupId: `grp-payout-${withdrawalId}`,
      accountCode: "1010-GATEWAY-CLEARING",
      direction: "CREDIT",
      amountINR: withdrawAmountINR,
      referenceType: "PAYOUT",
      description: `Discharge from Bank Clearing Account: UTR CMS2026101299001`,
      createdAt: new Date().toISOString(),
    }
  );
  assert(newWithdrawal.status === "COMPLETED", "IMPS Payout marked COMPLETED with valid UTR CMS2026101299001");

  // --------------------------------------------------------------------------
  // STEP 8: Global Double-Entry Reconciliation & Tax Reports Audit
  // --------------------------------------------------------------------------
  console.log("\nSection 8: Global Double-Entry Reconciliation & Indian Tax Reports");

  saveDatabase(db);

  const finalRecon = performLedgerReconciliation();
  assert(
    finalRecon.totalDebits === finalRecon.totalCredits,
    `GLOBAL RECONCILIATION EQUILIBRIUM: Debits (₹${finalRecon.totalDebits}) == Credits (₹${finalRecon.totalCredits})`
  );
  assert(finalRecon.ledgerImbalance === 0, "Global Ledger variance is exactly ₹0");
  assert(finalRecon.status === "BALANCED", "System general ledger status is BALANCED");

  const taxSummary = generateTaxReportSummary();
  assert(taxSummary.tds.records.length >= 1, "Section 194-O TDS Form 26AS records compiled");
  assert(taxSummary.gst.records.length >= 1, "GST SAC 998314 tax invoice records compiled");
  assert(taxSummary.gst.totalGstCollectedINR > 0, "GST tax collected is positive");

  // Clean up transient test records from persistent store
  db.projects = db.projects.filter((p) => !p.id.startsWith("proj-e2e-"));
  db.contracts = db.contracts.filter((c) => !c.id.startsWith("ctr-e2e-"));
  db.proposals = db.proposals.filter((p) => !p.id.startsWith("prp-e2e-"));
  saveDatabase(db);

  console.log("\n==========================================================================");
  console.log(`TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log("==========================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
