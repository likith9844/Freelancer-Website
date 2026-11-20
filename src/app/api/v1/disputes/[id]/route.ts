import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase, DBAuditLog, DBMessage } from "@/lib/db/store";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDatabase();
    const dispute = db.disputes.find((d) => d.id === id || d.disputeNumber === id);
    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    const contract = db.contracts.find((c) => c.id === dispute.contractId);
    const milestone = contract?.milestones.find((m) => m.id === dispute.milestoneId);

    return NextResponse.json({
      success: true,
      dispute,
      contract,
      milestone,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch dispute" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      auth.user.role !== "SUPPORT_ADMIN" &&
      auth.user.role !== "SUPER_ADMIN" &&
      auth.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Forbidden. Dispute arbitration requires SUPPORT_ADMIN or SUPER_ADMIN role." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { resolutionType, freelancerAwardedINR, clientAwardedINR, arbitrationNotes } = body;

    if (!["FULL_RELEASE", "FULL_REFUND", "SPLIT"].includes(resolutionType)) {
      return NextResponse.json({ error: "Invalid resolutionType. Supported: FULL_RELEASE, FULL_REFUND, SPLIT" }, { status: 400 });
    }

    const db = getDatabase();
    const dispute = db.disputes.find((d) => d.id === id || d.disputeNumber === id);
    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    const contract = db.contracts.find((c) => c.id === dispute.contractId);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const milestone = contract.milestones.find((m) => m.id === dispute.milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    dispute.status = "RESOLVED";
    dispute.resolutionType = resolutionType;
    dispute.arbitrationNotes = arbitrationNotes || "Arbitration closed by Support Admin.";
    dispute.resolvedAt = now;

    const flProfile = db.freelancers.find((f) => f.id === contract.freelancerId);

    if (resolutionType === "FULL_RELEASE") {
      dispute.freelancerAwardedINR = milestone.amountINR;
      dispute.clientAwardedINR = 0;
      milestone.status = "RELEASED";
      if (flProfile) {
        const netRelease = Math.round(milestone.amountINR * 0.872);
        flProfile.withdrawableBalanceINR = (flProfile.withdrawableBalanceINR || 0) + netRelease;
      }
    } else if (resolutionType === "FULL_REFUND") {
      dispute.freelancerAwardedINR = 0;
      dispute.clientAwardedINR = milestone.amountINR;
      milestone.status = "REFUNDED";
    } else if (resolutionType === "SPLIT") {
      const flAward = Number(freelancerAwardedINR) || Math.round(milestone.amountINR / 2);
      const clAward = Number(clientAwardedINR) || milestone.amountINR - flAward;
      dispute.freelancerAwardedINR = flAward;
      dispute.clientAwardedINR = clAward;
      milestone.status = "RELEASED";
      if (flProfile) {
        const netFlRelease = Math.round(flAward * 0.872);
        flProfile.withdrawableBalanceINR = (flProfile.withdrawableBalanceINR || 0) + netFlRelease;
      }
    }

    contract.status = "ACTIVE";

    // Workspace message
    db.messages.push({
      id: `msg-${Date.now()}`,
      workspaceId: contract.id,
      senderUserId: auth.user.id,
      senderName: "Support Admin Arbitration",
      senderRole: "SYSTEM",
      content: `⚖️ Dispute Case ${dispute.disputeNumber} RESOLVED. Verdict: ${resolutionType}. Notes: "${arbitrationNotes}". Escrow settlement disbursed accordingly.`,
      isSystemMessage: true,
      createdAt: now,
    });

    // Audit log
    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
      action: "DISPUTE_ARBITRATED_AND_SETTLED",
      entityType: "DISPUTE",
      entityId: dispute.id,
      newState: {
        resolutionType,
        freelancerAwardedINR: dispute.freelancerAwardedINR,
        clientAwardedINR: dispute.clientAwardedINR,
      },
      reason: "Support Admin issued formal arbitration ruling",
      createdAt: now,
    });

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: `Dispute Case ${dispute.disputeNumber} arbitrated successfully (${resolutionType}).`,
      dispute,
      milestone,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to arbitrate dispute" }, { status: 500 });
  }
}
