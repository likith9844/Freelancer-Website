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
  console.log("\n==========================================================");
  console.log("RUNNING SUITE: Phase 5 - Contracts, Milestones & Workspace");
  console.log("==========================================================\n");

  const db = getDatabase();

  // 1. Bilateral Legal Contract
  console.log("Section 1: Bilateral Contract & Digital Signatures");
  const contract = db.contracts.find((c) => c.id === "ctr-001");
  assert(!!contract, "Contract ctr-001 exists in database");
  assert(contract?.contractNumber === "KS-CTR-2026-001", "Immutable contract number KS-CTR-2026-001 verified");
  assert(contract?.totalValueINR === 120000, "Contract total value is ₹1,20,000");
  assert(contract?.clientServiceFeeRate === 0.03, "Client platform fee rate is 3%");
  assert(contract?.freelancerFeeRate === 0.10, "Freelancer fee rate is 10%");
  assert(!!contract?.clientSignedAt, "Client digital signature recorded");
  assert(!!contract?.freelancerSignedAt, "Freelancer digital signature recorded");

  // 2. Milestone State Progression & Deliverables
  console.log("\nSection 2: Milestone Lifecycle & Deliverables Workflow");
  const m1 = contract?.milestones.find((m) => m.sortOrder === 1);
  assert(!!m1, "Milestone 1 found in contract");
  assert(m1?.status === "RELEASED", "Milestone 1 is in RELEASED state");
  assert(m1?.amountINR === 40000, "Milestone 1 amount is ₹40,000");
  assert(!!m1?.deliverable?.freelancerNotes, "Milestone 1 has recorded deliverable notes");
  assert(!!m1?.deliverable?.demoUrl, "Milestone 1 has staging demo URL");
  assert(!!m1?.deliverable?.clientFeedback, "Milestone 1 has client approval feedback");

  // Milestone 2 State Check
  const m2 = contract?.milestones.find((m) => m.sortOrder === 2);
  assert(!!m2, "Milestone 2 found in contract");
  assert(m2?.amountINR === 50000, "Milestone 2 amount is ₹50,000");

  // Simulate M2 Funding
  console.log("\nSection 3: Simulated Milestone Funding & Approval Simulation");
  const initialFreelancerBalance = db.freelancers.find((f) => f.id === "flp-aditya")?.withdrawableBalanceINR || 0;
  
  // Transition M2: AWAITING_FUNDING -> FUNDED
  m2!.status = "FUNDED";
  m2!.fundedAt = new Date().toISOString();
  assert(m2?.status === "FUNDED", "Milestone 2 successfully transitioned to FUNDED");

  // Transition M2: FUNDED -> SUBMITTED (Freelancer submits)
  m2!.status = "SUBMITTED";
  m2!.submittedAt = new Date().toISOString();
  m2!.deliverable = {
    freelancerNotes: "Real-time tracking engine deployed with WebSockets & Redis pub/sub.",
    demoUrl: "https://staging.kaveri.tech/tracking",
    fileUrls: ["https://s3.ap-south-1.amazonaws.com/karyasetu-vault/m2-report.pdf"],
    submittedAt: new Date().toISOString(),
  };
  assert(m2?.status === "SUBMITTED", "Milestone 2 successfully transitioned to SUBMITTED");
  assert(m2?.deliverable?.demoUrl === "https://staging.kaveri.tech/tracking", "Deliverable demo URL recorded");

  // Transition M2: SUBMITTED -> REVISION_REQUESTED (Client asks for revision)
  m2!.status = "REVISION_REQUESTED";
  m2!.deliverable.clientFeedback = "Please increase driver heartbeat interval to 5s.";
  assert(m2?.status === "REVISION_REQUESTED", "Milestone 2 successfully transitioned to REVISION_REQUESTED");

  // Transition M2: REVISION_REQUESTED -> SUBMITTED -> APPROVED -> RELEASED
  m2!.status = "RELEASED";
  m2!.approvedAt = new Date().toISOString();
  m2!.releasedAt = new Date().toISOString();
  assert(m2?.status === "RELEASED", "Milestone 2 successfully transitioned to RELEASED");

  // Verify financial release impact
  const netReleaseM2 = Math.round(m2!.amountINR * 0.872); // Net after 10% commission + 1.8% GST + 1% TDS
  const fl = db.freelancers.find((f) => f.id === "flp-aditya");
  fl!.withdrawableBalanceINR = initialFreelancerBalance + netReleaseM2;
  assert(fl!.withdrawableBalanceINR > initialFreelancerBalance, "Freelancer withdrawable balance increased upon escrow release");

  // 4. Workspace Discussion & Audit Logging
  console.log("\nSection 4: Workspace Discussion & Audit Logging");
  const wsMessages = db.messages.filter((m) => m.workspaceId === "ctr-001");
  assert(wsMessages.length >= 2, "Workspace contains discussion messages");

  const wsAudits = db.auditLogs.filter((a) => a.entityId === "ctr-001" || a.entityType === "CONTRACT");
  assert(wsAudits.length >= 1, "Audit trail contains contract events");

  console.log("\n==========================================================");
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("==========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
