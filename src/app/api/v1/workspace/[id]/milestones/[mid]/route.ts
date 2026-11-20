import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase, DBAuditLog, DBMessage } from "@/lib/db/store";
import { RazorpayRouteService } from "@/lib/payments/razorpay-route";
import {
  calculateFreelancerSettlementBreakdown,
  generateMilestoneReleaseJournalEntries,
} from "@/lib/payments/provider";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; mid: string } }
) {
  try {
    const { id, mid } = params;
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { freelancerNotes, demoUrl, fileUrls } = body;

    if (!freelancerNotes || freelancerNotes.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide deliverable notes of at least 10 characters." },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const contract = db.contracts.find((c) => c.id === id || c.contractNumber === id);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const milestone = contract.milestones.find((m) => m.id === mid);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    if (milestone.status !== "FUNDED" && milestone.status !== "REVISION_REQUESTED" && milestone.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: `Cannot submit deliverable. Milestone status is currently ${milestone.status}.` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    milestone.status = "SUBMITTED";
    milestone.submittedAt = now;
    milestone.deliverable = {
      freelancerNotes: freelancerNotes.trim(),
      demoUrl: demoUrl?.trim() || undefined,
      fileUrls: Array.isArray(fileUrls) ? fileUrls : [],
      submittedAt: now,
    };

    // Workspace message
    const msg: DBMessage = {
      id: `msg-${Date.now()}`,
      workspaceId: contract.id,
      senderUserId: auth.user.id,
      senderName: auth.user.fullName,
      senderRole: "FREELANCER",
      content: `📦 Work submitted for "${milestone.title}". Notes: "${freelancerNotes.trim()}". Client please review deliverables and approve for escrow release.`,
      isSystemMessage: false,
      createdAt: now,
    };
    db.messages.push(msg);

    // Audit log
    const audit: DBAuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
      action: "MILESTONE_DELIVERABLE_SUBMITTED",
      entityType: "MILESTONE",
      entityId: milestone.id,
      newState: {
        milestoneId: milestone.id,
        status: "SUBMITTED",
        demoUrl: milestone.deliverable.demoUrl,
      },
      reason: "Freelancer uploaded completed deliverables for client verification",
      createdAt: now,
    };
    db.auditLogs.unshift(audit);

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: "Deliverables submitted successfully for client review.",
      milestone,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit deliverable" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; mid: string } }
) {
  try {
    const { id, mid } = params;
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, feedback } = body; // "FUND" | "APPROVE" | "REQUEST_REVISION"

    const db = getDatabase();
    const contract = db.contracts.find((c) => c.id === id || c.contractNumber === id);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const milestoneIndex = contract.milestones.findIndex((m) => m.id === mid);
    if (milestoneIndex === -1) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    const milestone = contract.milestones[milestoneIndex];
    const now = new Date().toISOString();

    if (action === "FUND") {
      milestone.status = "FUNDED";
      milestone.fundedAt = now;

      // Workspace message
      db.messages.push({
        id: `msg-${Date.now()}`,
        workspaceId: contract.id,
        senderUserId: auth.user.id,
        senderName: "KaryaSetu Escrow",
        senderRole: "SYSTEM",
        content: `🔒 Milestone "${milestone.title}" (₹${milestone.amountINR.toLocaleString("en-IN")}) funded into RBI Nodal Escrow! Freelancer may now commence execution.`,
        isSystemMessage: true,
        createdAt: now,
      });

      // Audit log
      db.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorUserId: auth.user.id,
        actorEmail: auth.user.email,
        actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
        action: "MILESTONE_ESCROW_FUNDED",
        entityType: "MILESTONE",
        entityId: milestone.id,
        newState: { status: "FUNDED", amountINR: milestone.amountINR },
        reason: "Client successfully funded milestone into escrow",
        createdAt: now,
      });

      saveDatabase(db);
      return NextResponse.json({ success: true, message: "Milestone funded successfully into escrow", milestone });
    }

    if (action === "REQUEST_REVISION") {
      if (!feedback || feedback.trim().length < 5) {
        return NextResponse.json({ error: "Please provide revision feedback explaining required changes." }, { status: 400 });
      }

      milestone.status = "REVISION_REQUESTED";
      if (milestone.deliverable) {
        milestone.deliverable.clientFeedback = feedback.trim();
      }

      // Workspace message
      db.messages.push({
        id: `msg-${Date.now()}`,
        workspaceId: contract.id,
        senderUserId: auth.user.id,
        senderName: auth.user.fullName,
        senderRole: "CLIENT",
        content: `⚠️ Revision requested for "${milestone.title}": "${feedback.trim()}".`,
        isSystemMessage: false,
        createdAt: now,
      });

      // Audit log
      db.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorUserId: auth.user.id,
        actorEmail: auth.user.email,
        actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
        action: "MILESTONE_REVISION_REQUESTED",
        entityType: "MILESTONE",
        entityId: milestone.id,
        newState: { status: "REVISION_REQUESTED", feedback },
        reason: "Client requested corrections on submitted deliverable",
        createdAt: now,
      });

      saveDatabase(db);
      return NextResponse.json({ success: true, message: "Revision requested successfully", milestone });
    }

    if (action === "APPROVE") {
      milestone.status = "RELEASED";
      milestone.approvedAt = now;
      milestone.releasedAt = now;

      // Calculate dynamic settlement breakdown from system settings
      const breakdown = calculateFreelancerSettlementBreakdown(milestone.amountINR);

      // Execute Razorpay Route split transfer to freelancer linked account
      const linkedAccount = await RazorpayRouteService.createOrGetLinkedAccount(contract.freelancerId);
      const payment = db.payments.find((p) => p.milestoneId === milestone.id) || db.payments[0];
      const routeTransfer = await RazorpayRouteService.createRouteTransfer({
        contractId: contract.id,
        milestoneId: milestone.id,
        paymentId: payment?.id || `pay_${Date.now()}`,
        milestoneAmountINR: milestone.amountINR,
        recipientAccountId: linkedAccount.id,
      });

      (milestone as any).razorpayTransferId = routeTransfer.id;
      (milestone as any).settlementBreakdown = breakdown;

      // Post 5-legged balanced ledger release entries
      const releaseEntries = generateMilestoneReleaseJournalEntries(
        `tx-route-${Date.now()}`,
        breakdown,
        `Razorpay Route split transfer ${routeTransfer.id} for Milestone ${milestone.title}`
      );
      db.ledgerEntries.push(...releaseEntries);

      // Update Freelancer Withdrawable Balance & Total Earnings
      const freelancer = db.freelancers.find((f) => f.id === contract.freelancerId);
      if (freelancer) {
        freelancer.totalEarningsINR = (freelancer.totalEarningsINR || 0) + milestone.amountINR;
        freelancer.withdrawableBalanceINR = (freelancer.withdrawableBalanceINR || 0) + breakdown.netWithdrawablePayoutINR;
      }

      // Transition next milestone from DRAFT to AWAITING_FUNDING if any
      const nextMilestone = contract.milestones[milestoneIndex + 1];
      if (nextMilestone && nextMilestone.status === "DRAFT") {
        nextMilestone.status = "AWAITING_FUNDING";
      }

      // Check if all milestones are released
      const allReleased = contract.milestones.every((m) => m.status === "RELEASED");
      if (allReleased) {
        contract.status = "COMPLETED";
        const project = db.projects.find((p) => p.id === contract.projectId);
        if (project) project.status = "COMPLETED";
      }

      // Workspace message
      db.messages.push({
        id: `msg-${Date.now()}`,
        workspaceId: contract.id,
        senderUserId: auth.user.id,
        senderName: "KaryaSetu Escrow",
        senderRole: "SYSTEM",
        content: `✅ Milestone "${milestone.title}" APPROVED! Escrow released ₹${milestone.amountINR.toLocaleString("en-IN")} to freelancer. ${
          allReleased ? "🎉 All project milestones completed!" : "Next milestone unlocked."
        }`,
        isSystemMessage: true,
        createdAt: now,
      });

      // Audit log
      db.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorUserId: auth.user.id,
        actorEmail: auth.user.email,
        actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
        action: "MILESTONE_APPROVED_PAYMENT_RELEASED",
        entityType: "MILESTONE",
        entityId: milestone.id,
        newState: { status: "RELEASED", amountINR: milestone.amountINR },
        reason: "Client approved milestone deliverable; nodal escrow released funds",
        createdAt: now,
      });

      saveDatabase(db);
      return NextResponse.json({
        success: true,
        message: "Milestone approved and escrow payment released to freelancer!",
        milestone,
        contractStatus: contract.status,
      });
    }

    return NextResponse.json({ error: "Invalid action. Supported: FUND, APPROVE, REQUEST_REVISION" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update milestone" }, { status: 500 });
  }
}
