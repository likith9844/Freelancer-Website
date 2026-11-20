import {
  validatePANFormat,
  validateIFSCFormat,
  validateGSTINFormat,
  maskAadhaarNumber,
  calculateNameMatchScore,
  executePennyDropVerification,
} from "../lib/kyc/kyc-engine";
import { getDatabase } from "../lib/db/store";

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
  console.log("\n==========================================");
  console.log("RUNNING SUITE: Phase 3 - KYC & Profiles");
  console.log("==========================================\n");

  // 1. PAN Validation
  console.log("Section 1: PAN Validation (Income Tax Act Sec 194-O)");
  assert(validatePANFormat("ABCPS1234F") === true, "Valid Individual PAN passes");
  assert(validatePANFormat("AABCC5678H") === true, "Valid Company PAN passes");
  assert(validatePANFormat("abcps1234f") === true, "Case-insensitive PAN passes");
  assert(validatePANFormat("ABC12345") === false, "Short PAN rejected");
  assert(validatePANFormat("12345ABCDE") === false, "Inverted PAN rejected");
  assert(validatePANFormat("ABCPS12345") === false, "PAN with digit at end rejected");

  // 2. IFSC Validation
  console.log("\nSection 2: IFSC Validation (RBI Banking Standard)");
  assert(validateIFSCFormat("HDFC0001234") === true, "Valid HDFC IFSC passes");
  assert(validateIFSCFormat("SBIN0000456") === true, "Valid SBI IFSC passes");
  assert(validateIFSCFormat("ICIC0000011") === true, "Valid ICICI IFSC passes");
  assert(validateIFSCFormat("HDFC1001234") === false, "IFSC with non-zero 5th character rejected");
  assert(validateIFSCFormat("HDFC000") === false, "Short IFSC rejected");
  assert(validateIFSCFormat("12340001234") === false, "IFSC starting with digits rejected");

  // 3. GSTIN Validation
  console.log("\nSection 3: GSTIN Validation (GST Act)");
  assert(validateGSTINFormat("29AABCU9603R1ZM") === true, "Valid Karnataka GSTIN passes");
  assert(validateGSTINFormat("27AABCU9603R1ZM") === true, "Valid Maharashtra GSTIN passes");
  assert(validateGSTINFormat("29AABCU9603") === false, "Incomplete GSTIN rejected");
  assert(validateGSTINFormat("AABCU9603R1ZM") === false, "GSTIN missing state code rejected");

  // 4. Aadhaar Masking (DPDPA 2023)
  console.log("\nSection 4: Aadhaar Masking (DPDPA 2023 Compliant)");
  assert(maskAadhaarNumber("123456789012") === "XXXXXXXX9012", "12-digit Aadhaar masked to final 4");
  assert(maskAadhaarNumber("1234 5678 9012") === "XXXXXXXX9012", "Spaced Aadhaar masked to final 4");
  assert(maskAadhaarNumber("9999") === "XXXXXXXX9999", "4-digit snippet retains last 4");

  // 5. Name Matching & Penny Drop
  console.log("\nSection 5: NPCI IMPS Penny Drop & Name Match Score");
  const scoreExact = calculateNameMatchScore("Aditya Sharma", "Aditya Sharma");
  assert(scoreExact === 100, "Exact name match produces 100%");
  
  const scorePartial = calculateNameMatchScore("Aditya Kumar Sharma", "Aditya Sharma");
  assert(scorePartial >= 75, "Partial name variation produces acceptable score >= 75%");

  const pennySuccess = await executePennyDropVerification("123456789012", "HDFC0001234", "Aditya Sharma");
  assert(pennySuccess.status === "SUCCESS", "Valid bank account details receive SUCCESS");
  assert(pennySuccess.pennyReference.startsWith("PENNY-"), "Generates valid audit reference ID");

  const pennyBadIfsc = await executePennyDropVerification("123456789012", "INVALID_IFSC", "Aditya Sharma");
  assert(pennyBadIfsc.status === "FAILED", "Invalid IFSC fails penny drop immediately");

  // 6. Database Store - Profiles & KYC Record
  console.log("\nSection 6: Profile & KYC Storage Persistence");
  const db = getDatabase();
  const freelancer = db.freelancers.find((f) => f.userId === "usr-freelancer-1");
  assert(!!freelancer, "Default freelancer profile exists in store");
  assert(freelancer?.hourlyRateINR === 2800, "Freelancer hourly rate is ₹2,800");
  assert(freelancer?.ratingAverage === 4.98, "Freelancer rating is 4.98");

  const client = db.clients.find((c) => c.userId === "usr-client-1");
  assert(!!client, "Default client profile exists in store");
  assert(client?.companyName === "Kaveri Logistics Tech Pvt Ltd", "Client company verified");
  assert(client?.gstin === "29AABCU9603R1ZM", "Client GSTIN is verified");

  assert(freelancer?.kycStatus === "APPROVED", "Freelancer KYC status is APPROVED");
  assert((freelancer?.bankAccounts?.length ?? 0) > 0, "Freelancer has registered bank account");
  assert(freelancer?.bankAccounts?.[0]?.verificationStatus === "PENNY_DROP_VERIFIED", "Penny drop verification status recorded as PENNY_DROP_VERIFIED");

  console.log("\n==========================================");
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("==========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
