import { getDatabase, saveDatabase, DBNotification } from "../db/store";

export interface DispatchNotificationOptions {
  userId: string;
  title: string;
  message: string;
  type: "MILESTONE_FUNDED" | "DELIVERABLE_SUBMITTED" | "PAYMENT_RELEASED" | "DISPUTE_RAISED" | "SYSTEM";
  linkUrl: string;
}

export function dispatchInAppNotification(options: DispatchNotificationOptions): DBNotification {
  const db = getDatabase();
  const notification: DBNotification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    userId: options.userId,
    title: options.title,
    message: options.message,
    type: options.type,
    linkUrl: options.linkUrl,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  if (!db.notifications) {
    db.notifications = [];
  }
  db.notifications.unshift(notification);
  saveDatabase(db);

  // Simulated Indian DLT SMS Gateway (e.g. MSG91 / Gupshup compliant template)
  const user = db.users.find((u) => u.id === options.userId);
  if (user && user.phone) {
    console.log(
      `[SMS GATEWAY DISPATCH] To: ${user.phone} | Header: KARYAS | Template: "${options.title}: ${options.message}"`
    );
  }

  return notification;
}

export function notifyMilestoneFunded(
  freelancerUserId: string,
  milestoneTitle: string,
  amountINR: number,
  contractId: string
) {
  return dispatchInAppNotification({
    userId: freelancerUserId,
    title: "🔒 Escrow Milestone Funded",
    message: `Milestone "${milestoneTitle}" (₹${amountINR.toLocaleString("en-IN")}) has been funded into RBI Nodal Escrow by the client. You may start work.`,
    type: "MILESTONE_FUNDED",
    linkUrl: `/workspace/${contractId}`,
  });
}

export function notifyDeliverableSubmitted(
  clientUserId: string,
  milestoneTitle: string,
  freelancerName: string,
  contractId: string
) {
  return dispatchInAppNotification({
    userId: clientUserId,
    title: "📦 Deliverables Submitted for Review",
    message: `${freelancerName} has submitted completed work for "${milestoneTitle}". Please review deliverables and approve for payment release.`,
    type: "DELIVERABLE_SUBMITTED",
    linkUrl: `/workspace/${contractId}`,
  });
}

export function notifyMilestoneApproved(
  freelancerUserId: string,
  milestoneTitle: string,
  netPayoutINR: number,
  contractId: string
) {
  return dispatchInAppNotification({
    userId: freelancerUserId,
    title: "💰 Escrow Payment Released",
    message: `Milestone "${milestoneTitle}" approved! Net payout of ₹${netPayoutINR.toLocaleString("en-IN")} has been credited to your withdrawable wallet.`,
    type: "PAYMENT_RELEASED",
    linkUrl: `/workspace/${contractId}`,
  });
}

export function notifyDisputeRaised(
  recipientUserId: string,
  filedByName: string,
  disputeNumber: string,
  contractId: string
) {
  return dispatchInAppNotification({
    userId: recipientUserId,
    title: "⚖️ Formal Milestone Dispute Filed",
    message: `${filedByName} filed Dispute Case ${disputeNumber}. Milestone funds are locked under Support Admin arbitration.`,
    type: "DISPUTE_RAISED",
    linkUrl: `/workspace/${contractId}`,
  });
}
