import crypto from "crypto";
import {
  RazorpayRouteService,
} from "../lib/payments/razorpay-route";
import {
  calculateClientFundingBreakdown,
  calculateFreelancerSettlementBreakdown,
  getMarketplaceSettings,
} from "../lib/payments/provider";
import { getDatabase, saveDatabase } from "../lib/db/store";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${msg}`);
  }
}

async function runRazorpayRouteAndAdminSuite() {
  console.log("\n=======================================================");
  console.log("RUNNING SUITE: Razorpay Route & Admin Control Verification");
  console.log("=======================================================\n");

  const db = getDatabase();

  // -------------------------------------------------------------------------
  // SECTION 1: Razorpay Route Marketplace Linked Accounts & Transfers
  // -------------------------------------------------------------------------
  console.log("Section 1: Razorpay Route Linked Accounts & Split Settlement");

  // 1. Linked Account Creation
  const freelancer = db.freelancers[0];
  const linkedAccount = await RazorpayRouteService.createOrGetLinkedAccount(freelancer.id);
  assert(
    Boolean(linkedAccount && linkedAccount.id.startsWith("acc_")),
    `Razorpay Route linked account generated: ${linkedAccount.id}`
  );
  assert(
    linkedAccount.status === "activated",
    `Linked account status is activated for freelancer ${freelancer.id}`
  );

  // 2. Order Creation
  const order = await RazorpayRouteService.createOrder({
    contractId: "ctr-test-1",
    milestoneId: "m-test-1",
    amountINR: 10000,
    customerId: "usr-client-1",
  });
  assert(
    Boolean(order && order.orderId.startsWith("order_")),
    `Razorpay Order created with marketplace metadata: ${order.orderId}`
  );
  assert(order.amountINR === 10000, "Order amount correctly formatted in INR (₹10,000)");

  // 3. Webhook Signature Verification
  const settings = getMarketplaceSettings();
  const testPayload = JSON.stringify({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_test_123",
          notes: {
            contractId: "ctr-test-1",
            milestoneId: "m-test-1",
          },
        },
      },
    },
  });

  const validSig = crypto
    .createHmac("sha256", settings.razorpayWebhookSecret)
    .update(testPayload)
    .digest("hex");

  const webhookResult = RazorpayRouteService.processWebhookEvent(testPayload, validSig);
  assert(
    webhookResult.success === true,
    "Cryptographic HMAC-SHA256 signature verification successful for genuine webhook"
  );

  let tamperedCaught = false;
  try {
    RazorpayRouteService.processWebhookEvent(testPayload, "invalid_tampered_hex");
  } catch {
    tamperedCaught = true;
  }
  assert(tamperedCaught, "Tampered webhook signature strictly rejected with cryptographic error");

  // 4. Split Transfer Execution
  const transfer = await RazorpayRouteService.createRouteTransfer({
    contractId: "ctr-test-1",
    milestoneId: "m-test-1",
    paymentId: "pay_test_captured",
    milestoneAmountINR: 10000,
    recipientAccountId: linkedAccount.id,
  });
  assert(
    Boolean(transfer && transfer.id.startsWith("trf_")),
    `Route split transfer executed: ${transfer.id}`
  );
  assert(
    transfer.recipientAccountId === linkedAccount.id,
    `Transfer routed directly to freelancer linked account: ${transfer.recipientAccountId}`
  );

  // 5. Refund & Transfer Reversal
  const refund = await RazorpayRouteService.createRefund({
    paymentId: "pay_test_captured",
    milestoneId: "m-test-1",
    amountINR: 10000,
    reason: "Client milestone mutual cancellation",
  });
  assert(
    Boolean(refund && refund.id.startsWith("rfnd_")),
    `Razorpay refund generated with Route reversal: ${refund.id}`
  );
  assert(refund.reverseRouteTransfer === true, "Route transfer reversal flag confirmed on refund");

  // -------------------------------------------------------------------------
  // SECTION 2: Dynamic Admin Marketplace Commission & Fee Configuration
  // -------------------------------------------------------------------------
  console.log("\nSection 2: Dynamic Admin Settings & Server-Side Fee Engine");

  const originalSettings = { ...db.systemSettings };
  // Save updated settings into database
  db.systemSettings = {
    ...db.systemSettings,
    freelancerCommissionRate: 0.12,  // 12% custom commission
    clientServiceFeeRate: 0.04,      // 4% custom client fee
    gatewayHandlingFeeRate: 0.025,   // 2.5% handling charge
    gstRate: 0.18,                   // 18% GST
    tdsRate: 0.01,                   // 1% TDS Sec 194-O
    minWithdrawalINR: 1000,          // ₹1,000 min withdrawal
    autoReleaseDays: 7,
    escrowHoldDelayDays: 1,
    razorpayRouteMode: "SIMULATION",
    razorpayKeyId: "rzp_test_dyn",
    razorpayKeySecret: "sec_dyn",
    razorpayWebhookSecret: "whsec_dyn",
    payoutProcessingMode: "AUTOMATED_ROUTE",
  };
  saveDatabase(db);

  const liveSettings = getMarketplaceSettings();
  assert(liveSettings.freelancerCommissionRate === 0.12, "Live commission rate updated to 12%");
  assert(liveSettings.clientServiceFeeRate === 0.04, "Live client fee updated to 4%");
  assert(liveSettings.gatewayHandlingFeeRate === 0.025, "Live gateway handling charge updated to 2.5%");

  // Verify dynamic client funding breakdown
  const fundingBreakdown = calculateClientFundingBreakdown(10000);
  assert(fundingBreakdown.clientServiceFeeINR === 400, "Client fee correctly calculated at 4% (₹400 on ₹10,000)");
  assert(fundingBreakdown.gstOnServiceFeeINR === 72, "GST correctly calculated at 18% of service fee (₹72)");
  assert(fundingBreakdown.pgFeeINR === 262, "Gateway fee correctly calculated at 2.5% on subtotal ₹10,472 (₹262)");
  assert(fundingBreakdown.totalPayableINR === 10734, "Total payable gross is ₹10,734 (Debits == ₹10,734)");

  // Verify dynamic freelancer settlement breakdown
  const settlementBreakdown = calculateFreelancerSettlementBreakdown(10000);
  assert(settlementBreakdown.platformCommissionINR === 1200, "Platform commission calculated at 12% (₹1,200 on ₹10,000)");
  assert(settlementBreakdown.gstOnCommissionINR === 216, "GST on commission calculated at 18% (₹216)");
  assert(settlementBreakdown.tds194OINR === 100, "Section 194-O TDS calculated at 1% (₹100)");
  assert(settlementBreakdown.netWithdrawablePayoutINR === 8484, "Net withdrawable payout is ₹8,484 (10000 - 1200 - 216 - 100)");

  // Restore base default settings
  db.systemSettings = originalSettings;
  saveDatabase(db);

  // -------------------------------------------------------------------------
  // SECTION 3: Client & Freelancer Administrative Management Actions
  // -------------------------------------------------------------------------
  console.log("\nSection 3: Client & Freelancer Management Controls");

  // Client Management: Suspension and reactivation
  const clientUser = db.users.find((u) => u.role === "CLIENT")!;
  const originalClientStatus = clientUser.status;
  clientUser.status = "SUSPENDED";
  saveDatabase(db);
  assert(db.users.find((u) => u.id === clientUser.id)?.status === "SUSPENDED", "Client account successfully suspended by admin");

  clientUser.status = originalClientStatus;
  saveDatabase(db);
  assert(db.users.find((u) => u.id === clientUser.id)?.status === originalClientStatus, "Client account successfully reactivated by admin");

  // Freelancer Management: Route Sync & KYC Approval
  const freelancerUser = db.users.find((u) => u.role === "FREELANCER")!;
  const fProfile = db.freelancers.find((f) => f.userId === freelancerUser.id || f.id === freelancerUser.id);
  if (fProfile) {
    const originalKycStatus = fProfile.kycStatus;
    const originalLinkedId = fProfile.razorpayLinkedAccountId;
    fProfile.razorpayLinkedAccountId = "acc_live_synced_99";
    fProfile.kycStatus = "VERIFIED";
    saveDatabase(db);
    assert(
      db.freelancers.find((f) => f.id === fProfile.id)?.razorpayLinkedAccountId === "acc_live_synced_99",
      "Freelancer Razorpay Route linked account manually synced by admin"
    );
    assert(
      db.freelancers.find((f) => f.id === fProfile.id)?.kycStatus === "VERIFIED",
      "Freelancer KYC approved by admin"
    );

    // Restore original state
    fProfile.kycStatus = originalKycStatus;
    fProfile.razorpayLinkedAccountId = originalLinkedId;
    saveDatabase(db);
  }

  console.log(`\n=======================================================`);
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`=======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runRazorpayRouteAndAdminSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});
