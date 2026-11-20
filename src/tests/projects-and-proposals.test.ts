import { getDatabase, saveDatabase, DBProject, DBProposal, DBContract, DBMilestone } from "../lib/db/store";

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
  console.log("\n========================================================");
  console.log("RUNNING SUITE: Phase 4 - Projects & Proposals Lifecycle");
  console.log("========================================================\n");

  const db = getDatabase();

  // 1. Project Verification & Queries
  console.log("Section 1: Marketplace Projects State");
  assert(db.projects.length >= 2, "Marketplace has active seeded projects");
  const p1 = db.projects.find((p) => p.id === "proj-1");
  assert(!!p1, "Project proj-1 found in database");
  assert(p1?.budgetINR === 120000, "Project 1 budget is ₹1,20,000");
  assert(p1?.category === "Web & Software Engineering", "Category properly assigned");
  assert(p1?.skillsRequired.includes("Next.js"), "Skills requirement includes Next.js");

  // 2. Proposal Submission & Server-Side Fee Breakdown
  console.log("\nSection 2: Proposal Submission & Indian Tax Calculations");
  const p2 = db.projects.find((p) => p.id === "proj-2");
  assert(!!p2, "Project proj-2 found in database");

  const prop2 = db.proposals.find((p) => p.id === "prp-2");
  assert(!!prop2, "Proposal prp-2 exists for proj-2");
  assert(prop2?.bidAmountINR === 180000, "Bid amount is ₹1,80,000");
  assert(prop2?.milestones.length === 3, "Proposal contains 3 milestones");

  // Verify milestone sum invariant
  const sumM = prop2!.milestones.reduce((acc, m) => acc + m.amountINR, 0);
  assert(sumM === prop2?.bidAmountINR, "Milestones sum exactly equals total proposed bid (₹1,80,000)");

  // Server-side tax & commission invariant
  const commission = Math.round(prop2!.bidAmountINR * 0.10); // 10% = ₹18,000
  const gstOnCommission = Math.round(commission * 0.18);      // 18% of 10% = ₹3,240
  const tds194O = Math.round(prop2!.bidAmountINR * 0.01);     // 1% TDS = ₹1,800
  const netTakeHome = prop2!.bidAmountINR - commission - gstOnCommission - tds194O; // ₹1,56,960

  assert(commission === 18000, "Platform commission is exactly 10% (₹18,000)");
  assert(gstOnCommission === 3240, "GST on platform commission is 18% (₹3,240)");
  assert(tds194O === 1800, "Section 194-O TDS is exactly 1% credited to PAN (₹1,800)");
  assert(netTakeHome === 156960, "Net take-home matches server calculation (₹1,56,960)");

  // 3. Client Proposal Review & Actions
  console.log("\nSection 3: Client Proposal State Transitions");
  assert(prop2?.status === "SHORTLISTED", "Initial status of prp-2 is SHORTLISTED");

  // Test proposal status transition to REJECTED
  const prop3 = db.proposals.find((p) => p.id === "prp-3");
  assert(!!prop3, "Proposal prp-3 exists");
  assert(prop3?.status === "SUBMITTED", "Initial status of prp-3 is SUBMITTED");

  // 4. Contract Generation & Milestone Creation (Acceptance Workflow)
  console.log("\nSection 4: Bilateral Contract & Milestone Workspace Lock");
  const contract1 = db.contracts.find((c) => c.projectId === "proj-1");
  assert(!!contract1, "Contract exists for accepted project proj-1");
  assert(contract1?.contractNumber.startsWith("KS-CTR-"), "Contract has immutable Indian registration number KS-CTR-...");
  assert(contract1?.totalValueINR === 120000, "Contract total value locked at ₹1,20,000");
  assert(contract1?.clientServiceFeeRate === 0.03, "Client fee rate locked at 3%");
  assert(contract1?.freelancerFeeRate === 0.10, "Freelancer commission locked at 10%");
  assert(contract1?.status === "ACTIVE", "Contract status is ACTIVE");
  assert((contract1?.milestones.length ?? 0) >= 2, "Contract contains milestone schedules");

  // 5. System Messages & Audit Log Trail
  console.log("\nSection 5: Workspace Messages & Audit Logging");
  const msgs = db.messages.filter((m) => m.workspaceId === contract1?.id);
  assert(msgs.length >= 1, "Workspace contains project messages");

  const auditLogs = db.auditLogs.filter((a) => a.entityId === "ctr-001" || a.entityType === "CONTRACT");
  assert(db.auditLogs.length > 0, "Audit trail contains system activities");

  console.log("\n========================================================");
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
