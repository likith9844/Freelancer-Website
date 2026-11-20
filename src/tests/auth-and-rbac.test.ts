import { hashPassword, verifyPassword, verifyTOTPCode, encryptData, decryptData, generateSecureToken, hashToken } from "../lib/auth/crypto";
import { hasPermission, isAdminRole, PERMISSIONS, ALL_ROLES } from "../lib/auth/rbac";
import { getDatabase } from "../lib/db/store";

async function runTests() {
  console.log("=================================================");
  console.log("KARYASETU TEST SUITE: AUTHENTICATION, SECURITY & RBAC");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Password Hashing & Verification Test
  console.log("--- 1. Cryptography: Password Hashing ---");
  const plaintext = "SecureIndianPass@2026";
  const hash = await hashPassword(plaintext);
  assert(hash.startsWith("$2a$") || hash.startsWith("$2b$"), "Hash generated using bcrypt salt");
  const isValid = await verifyPassword(plaintext, hash);
  assert(isValid === true, "Correct password verifies successfully");
  const isInvalid = await verifyPassword("WrongPassword", hash);
  assert(isInvalid === false, "Incorrect password rejected");

  // 2. AES-256-GCM Bank Data Encryption
  console.log("\n--- 2. Cryptography: AES-256-GCM Encryption ---");
  const bankAccount = "50100234567890";
  const encrypted = encryptData(bankAccount);
  assert(encrypted.includes(":"), "Encrypted payload contains IV, AuthTag, and Ciphertext");
  const decrypted = decryptData(encrypted);
  assert(decrypted === bankAccount, "Decrypted bank account matches original plaintext exactly");

  // 3. TOTP 2FA Verification
  console.log("\n--- 3. Two-Factor Authentication (2FA) ---");
  const secret = "JBSWY3DPEHPK3PXP";
  assert(verifyTOTPCode(secret, "123456") === true, "Demo 2FA token 123456 accepted");
  assert(verifyTOTPCode(secret, "999999") === false, "Random invalid 2FA token rejected");

  // 4. RBAC Permission Matrix Validation
  console.log("\n--- 4. Role-Based Access Control (RBAC) ---");
  assert(ALL_ROLES.length === 7, "All 7 distinct user roles configured");

  // Super Admin: Has all permissions
  assert(hasPermission("SUPER_ADMIN", PERMISSIONS.SETTINGS_MANAGE) === true, "SUPER_ADMIN can manage settings");
  assert(hasPermission("SUPER_ADMIN", PERMISSIONS.PAYMENTS_MANAGE) === true, "SUPER_ADMIN can manage payments");

  // Finance Admin: Can manage payouts, cannot manage settings
  assert(hasPermission("FINANCE_ADMIN", PERMISSIONS.WITHDRAWALS_MANAGE) === true, "FINANCE_ADMIN can manage withdrawals");
  assert(hasPermission("FINANCE_ADMIN", PERMISSIONS.COMMISSIONS_MANAGE) === true, "FINANCE_ADMIN can manage commissions");
  assert(hasPermission("FINANCE_ADMIN", PERMISSIONS.SETTINGS_MANAGE) === false, "FINANCE_ADMIN cannot manage platform security settings");

  // Support Admin: Can arbitrate disputes, cannot manage payouts
  assert(hasPermission("SUPPORT_ADMIN", PERMISSIONS.DISPUTES_MANAGE) === true, "SUPPORT_ADMIN can manage disputes");
  assert(hasPermission("SUPPORT_ADMIN", PERMISSIONS.SETTLEMENTS_MANAGE) === false, "SUPPORT_ADMIN cannot manage settlements");

  // Moderator: Can verify freelancers, cannot manage payments
  assert(hasPermission("MODERATOR", PERMISSIONS.FREELANCERS_VERIFY) === true, "MODERATOR can verify freelancers");
  assert(hasPermission("MODERATOR", PERMISSIONS.PAYMENTS_MANAGE) === false, "MODERATOR cannot manage payments");

  // Client: Can manage own projects, cannot verify freelancers
  assert(hasPermission("CLIENT", PERMISSIONS.PROJECTS_MANAGE) === true, "CLIENT can manage projects");
  assert(hasPermission("CLIENT", PERMISSIONS.FREELANCERS_VERIFY) === false, "CLIENT cannot verify other freelancers");

  // Freelancer: Can view withdrawals, cannot manage settings
  assert(hasPermission("FREELANCER", PERMISSIONS.WITHDRAWALS_MANAGE) === true, "FREELANCER can request withdrawals");
  assert(hasPermission("FREELANCER", PERMISSIONS.USERS_SUSPEND) === false, "FREELANCER cannot suspend users");

  // 5. Admin Role Identification for 2FA Guard
  console.log("\n--- 5. Administrative 2FA Enforcement Guard ---");
  assert(isAdminRole("SUPER_ADMIN") === true, "SUPER_ADMIN requires 2FA");
  assert(isAdminRole("FINANCE_ADMIN") === true, "FINANCE_ADMIN requires 2FA");
  assert(isAdminRole("SUPPORT_ADMIN") === true, "SUPPORT_ADMIN requires 2FA");
  assert(isAdminRole("CLIENT") === false, "CLIENT does not require administrative 2FA");
  assert(isAdminRole("FREELANCER") === false, "FREELANCER does not require administrative 2FA");

  // 6. Double-Entry General Ledger Mathematical Balance Check
  console.log("\n--- 6. Financial Ledger Invariant Audit ---");
  const db = getDatabase();
  const totalDebits = db.ledgerEntries
    .filter((e) => e.direction === "DEBIT")
    .reduce((sum, e) => sum + e.amountINR, 0);
  const totalCredits = db.ledgerEntries
    .filter((e) => e.direction === "CREDIT")
    .reduce((sum, e) => sum + e.amountINR, 0);

  console.log(`Total General Ledger Debits:  ₹${totalDebits.toFixed(2)}`);
  console.log(`Total General Ledger Credits: ₹${totalCredits.toFixed(2)}`);
  assert(
    Math.abs(totalDebits - totalCredits) < 0.01,
    `Double-Entry Invariant: Debits (₹${totalDebits}) equal Credits (₹${totalCredits})`
  );

  console.log("\n=================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Unhandled test error:", e);
  process.exit(1);
});
