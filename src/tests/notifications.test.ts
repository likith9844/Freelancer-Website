import { getDatabase, saveDatabase, DBNotification } from "../lib/db/store";
import {
  dispatchInAppNotification,
  notifyMilestoneFunded,
  notifyDeliverableSubmitted,
  notifyMilestoneApproved,
  notifyDisputeRaised,
} from "../lib/notifications/dispatcher";

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
  console.log("RUNNING SUITE: Phase 9 - Real-Time Communications & Notifications");
  console.log("=======================================================\n");

  const db = getDatabase();
  const testUserId = "usr-freelancer-aditya";
  const testClientUserId = "usr-client-rahul";

  // Section 1: In-App Notification Dispatching & DLT Integration
  console.log("Section 1: In-App Notification Dispatching & Formatting");

  const notif1 = dispatchInAppNotification({
    userId: testUserId,
    title: "🔒 Security Alert",
    message: "New login detected from Mumbai, Maharashtra.",
    type: "SYSTEM",
    linkUrl: "/profile/security",
  });

  assert(!!notif1.id, "Dispatched notification received unique identifier");
  assert(notif1.isRead === false, "Dispatched notification is initially unread");
  assert(notif1.type === "SYSTEM", "Notification category matches type");
  assert(notif1.userId === testUserId, "Recipient user ID correctly assigned");

  // Section 2: Indian Marketplace Domain Event Triggers
  console.log("\nSection 2: Domain Event Triggers (Escrow, Deliverables, Disputes)");

  const escrowNotif = notifyMilestoneFunded(
    testUserId,
    "Phase 1 Core Microservices",
    40000,
    "ctr-sample-1"
  );
  assert(
    escrowNotif.title.includes("Escrow Milestone Funded"),
    "Milestone funded notification title contains Escrow badge"
  );
  assert(
    escrowNotif.message.includes("₹40,000") && escrowNotif.message.includes("RBI Nodal Escrow"),
    "Milestone funded message contains formatted INR amount and RBI Escrow reference"
  );
  assert(escrowNotif.type === "MILESTONE_FUNDED", "Type is MILESTONE_FUNDED");

  const deliverableNotif = notifyDeliverableSubmitted(
    testClientUserId,
    "Phase 1 Core Microservices",
    "Aditya Sharma",
    "ctr-sample-1"
  );
  assert(
    deliverableNotif.title.includes("Deliverables Submitted"),
    "Deliverable submission notification generated"
  );
  assert(
    deliverableNotif.message.includes("Aditya Sharma"),
    "Deliverable notification identifies freelancer"
  );
  assert(deliverableNotif.type === "DELIVERABLE_SUBMITTED", "Type is DELIVERABLE_SUBMITTED");

  const payoutNotif = notifyMilestoneApproved(
    testUserId,
    "Phase 1 Core Microservices",
    34520,
    "ctr-sample-1"
  );
  assert(
    payoutNotif.message.includes("₹34,520") && payoutNotif.message.includes("withdrawable wallet"),
    "Payout notification specifies net earnings after Section 194-O TDS & Commission"
  );
  assert(payoutNotif.type === "PAYMENT_RELEASED", "Type is PAYMENT_RELEASED");

  const disputeNotif = notifyDisputeRaised(
    testUserId,
    "Rahul Verma",
    "DSP-2026-0001",
    "ctr-sample-1"
  );
  assert(
    disputeNotif.message.includes("DSP-2026-0001") && disputeNotif.message.includes("arbitration"),
    "Dispute alert includes formal case number and arbitration warning"
  );
  assert(disputeNotif.type === "DISPUTE_RAISED", "Type is DISPUTE_RAISED");

  // Section 3: User Notification Retrieval & Unread Counts
  console.log("\nSection 3: Notification Retrieval, Filtering & Read Status");

  const currentDb = getDatabase();
  const userNotifications = (currentDb.notifications || []).filter(
    (n) => n.userId === testUserId
  );
  assert(userNotifications.length >= 4, "Freelancer retrieved multiple dispatched notifications");

  const unreadBefore = userNotifications.filter((n) => !n.isRead).length;
  assert(unreadBefore >= 4, "Initial unread count matches dispatched alerts");

  // Section 4: Single Notification Read Transition
  console.log("\nSection 4: Read State Machine & Dismissal");

  const targetNotif = userNotifications[0];
  targetNotif.isRead = true;
  saveDatabase(currentDb);

  const reloadedDb = getDatabase();
  const updatedItem = (reloadedDb.notifications || []).find((n) => n.id === targetNotif.id);
  assert(updatedItem?.isRead === true, "Single notification marked as read persisted in store");

  // Section 5: Bulk Read Transition
  reloadedDb.notifications.forEach((n) => {
    if (n.userId === testUserId) {
      n.isRead = true;
    }
  });
  saveDatabase(reloadedDb);

  const finalDb = getDatabase();
  const remainingUnread = (finalDb.notifications || []).filter(
    (n) => n.userId === testUserId && !n.isRead
  ).length;
  assert(remainingUnread === 0, "Bulk mark all as read clears all unread notifications for user");

  // Section 6: Notification Deletion
  const deleteTargetId = targetNotif.id;
  const initialCount = finalDb.notifications.length;
  finalDb.notifications = finalDb.notifications.filter((n) => n.id !== deleteTargetId);
  saveDatabase(finalDb);

  const afterDeleteDb = getDatabase();
  assert(
    afterDeleteDb.notifications.length === initialCount - 1,
    "Notification successfully deleted from persistent store"
  );
  assert(
    !afterDeleteDb.notifications.some((n) => n.id === deleteTargetId),
    "Deleted notification no longer present in store"
  );

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
