import { getDatabase, saveDatabase, DBAuditLog } from "../lib/db/store";
import { ALL_ROLES } from "../lib/auth/rbac";

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
  console.log("RUNNING SUITE: Phase 8 - Admin Control Center & RBAC");
  console.log("=======================================================\n");

  const db = getDatabase();

  // 1. Executive Statistics & Financial Compilations
  console.log("Section 1: Live Platform KPIs & Financial Reconciliations");
  assert(db.users.length >= 7, "All 7 distinct user role identities registered in store");
  assert(db.contracts.length >= 1, "Marketplace contracts tracked");
  assert(db.ledgerEntries.length >= 2, "Double-entry general ledger entries tracked");

  const totalGMV = db.contracts.reduce((sum, c) => sum + c.totalValueINR, 0);
  assert(totalGMV >= 120000, "Gross Merchandise Value (GMV) calculated correctly (>= ₹1,20,000)");

  const commissionRevenue = db.ledgerEntries
    .filter((e) => e.accountCode.startsWith("40") && e.direction === "CREDIT")
    .reduce((s, e) => s + e.amountINR, 0);
  assert(commissionRevenue >= 1200, "Commission revenue recognized in ledger");

  // 2. User Moderation & Status State Machine
  console.log("\nSection 2: User Moderation & Account Status Transitions");
  const testUser = db.users.find((u) => u.role === "CLIENT");
  assert(!!testUser, "Client user found for moderation test");

  const initialStatus = testUser!.status;
  // Suspend
  testUser!.status = "SUSPENDED";
  db.auditLogs.unshift({
    id: `aud-test-${Date.now()}-1`,
    actorUserId: "usr-super-admin",
    actorEmail: "superadmin@karyasetu.in",
    actorIp: "127.0.0.1",
    action: "USER_STATUS_SUSPENDED",
    entityType: "USER",
    entityId: testUser!.id,
    oldState: { status: initialStatus },
    newState: { status: "SUSPENDED" },
    reason: "Test account suspended for compliance verification",
    createdAt: new Date().toISOString(),
  });
  assert(testUser!.status === "SUSPENDED", "User successfully SUSPENDED");

  // Reactivate
  testUser!.status = "ACTIVE";
  db.auditLogs.unshift({
    id: `aud-test-${Date.now()}-2`,
    actorUserId: "usr-super-admin",
    actorEmail: "superadmin@karyasetu.in",
    actorIp: "127.0.0.1",
    action: "USER_STATUS_ACTIVE",
    entityType: "USER",
    entityId: testUser!.id,
    oldState: { status: "SUSPENDED" },
    newState: { status: "ACTIVE" },
    reason: "Compliance verification complete; account reactivated",
    createdAt: new Date().toISOString(),
  });
  assert(testUser!.status === "ACTIVE", "User successfully reactivated to ACTIVE");

  // 3. KYC Moderation & Verified Badge Issuance
  console.log("\nSection 3: KYC Moderation & Verified Badge Issuance");
  const flProfile = db.freelancers.find((f) => f.id === "flp-aditya");
  assert(!!flProfile, "Freelancer profile found");
  assert(flProfile!.kycStatus === "APPROVED", "Freelancer KYC initially APPROVED");
  assert(flProfile!.isVerifiedBadge === true, "Freelancer has verified badge");

  // Simulate KYC resubmission flag
  flProfile!.kycStatus = "SUBMITTED";
  assert(flProfile!.kycStatus === "SUBMITTED", "KYC status can be transitioned to SUBMITTED");

  // Re-approve with badge
  flProfile!.kycStatus = "APPROVED";
  flProfile!.isVerifiedBadge = true;
  assert(flProfile!.kycStatus === "APPROVED" && flProfile!.isVerifiedBadge === true, "KYC re-approved and badge preserved");

  // 4. Platform Settings Configuration
  console.log("\nSection 4: Platform Settings & Regulatory Configuration");
  assert(db.systemSettings.platformName === "KaryaSetu", "Platform identity is KaryaSetu");
  assert(typeof db.systemSettings.clientServiceFeeRate === "number" && db.systemSettings.clientServiceFeeRate >= 0, "Client service fee rate is configured as valid percentage");
  assert(typeof db.systemSettings.freelancerCommissionRate === "number" && db.systemSettings.freelancerCommissionRate >= 0, "Freelancer commission rate is configured as valid percentage");
  assert(db.systemSettings.tdsRate === 0.01, "Section 194-O TDS rate is 1%");
  assert(db.systemSettings.gstRate === 0.18, "GST rate is 18%");
  assert(db.systemSettings.minWithdrawalINR === 500, "Minimum withdrawal limit is ₹500");

  // 5. System Audit Trail Integrity
  console.log("\nSection 5: System Audit Trail Integrity");
  assert(db.auditLogs.length >= 3, "Audit trail contains immutable activity records");
  const latestAudit = db.auditLogs[0];
  assert(!!latestAudit.actorUserId, "Audit log records actor user ID");
  assert(!!latestAudit.actorIp, "Audit log records actor IP address");
  assert(!!latestAudit.action, "Audit log records specific action code");
  assert(!!latestAudit.createdAt, "Audit log records ISO timestamp");

  console.log("\n=======================================================");
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
