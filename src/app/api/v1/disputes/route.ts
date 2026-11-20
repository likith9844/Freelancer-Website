import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase, DBDispute, DBAuditLog, DBMessage } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDatabase();

    // Admins see all disputes
    if (
      auth.user.role === "SUPER_ADMIN" ||
      auth.user.role === "ADMIN" ||
      auth.user.role === "SUPPORT_ADMIN" ||
      auth.user.role === "MODERATOR"
    ) {
      return NextResponse.json({ success: true, disputes: db.disputes });
    }

    // Otherwise see disputes involving the user
    const myDisputes = db.disputes.filter(
      (d) => d.openedByUserId === auth.user.id || d.disputedAgainstUserId === auth.user.id
    );

    return NextResponse.json({ success: true, disputes: myDisputes });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch disputes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { contractId, milestoneId, reasonCode, statement } = body;

    if (!contractId || !milestoneId || !reasonCode || !statement) {
      return NextResponse.json({ error: "contractId, milestoneId, reasonCode, and statement are required" }, { status: 400 });
    }

    const db = getDatabase();
    const contract = db.contracts.find((c) => c.id === contractId || c.contractNumber === contractId);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const milestone = contract.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    const client = db.clients.find((c) => c.id === contract.clientId);
    const freelancer = db.freelancers.find((f) => f.id === contract.freelancerId);

    const isClient = client && client.userId === auth.user.id;
    const isFreelancer = freelancer && freelancer.userId === auth.user.id;

    if (!isClient && !isFreelancer && auth.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only contract parties can raise a formal milestone dispute" }, { status: 403 });
    }

    const disputedAgainstUserId = isClient ? freelancer!.userId : client!.userId;
    const disputeId = `dsp-${Date.now()}`;
    const disputeNumber = `DSP-KS-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const newDispute: DBDispute = {
      id: disputeId,
      disputeNumber,
      milestoneId: milestone.id,
      contractId: contract.id,
      openedByUserId: auth.user.id,
      disputedAgainstUserId,
      reasonCode,
      statement: statement.trim(),
      disputedAmountINR: milestone.amountINR,
      status: "OPEN",
      createdAt: now,
    };

    db.disputes.unshift(newDispute);

    // Update milestone & contract state to lock funds
    milestone.status = "DISPUTED";
    contract.status = "DISPUTED";

    // Workspace notification message
    const msg: DBMessage = {
      id: `msg-${Date.now()}`,
      workspaceId: contract.id,
      senderUserId: "system",
      senderName: "KaryaSetu Dispute Arbitration",
      senderRole: "SYSTEM",
      content: `⚖️ Dispute Case ${disputeNumber} formally filed for Milestone "${milestone.title}" (₹${milestone.amountINR.toLocaleString(
        "en-IN"
      )}). Reason: ${reasonCode}. Escrow funds are locked pending Support Admin arbitration under Arbitration and Conciliation Act 1996.`,
      isSystemMessage: true,
      createdAt: now,
    };
    db.messages.push(msg);

    // Audit log
    const audit: DBAuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
      action: "DISPUTE_FILED",
      entityType: "DISPUTE",
      entityId: disputeId,
      newState: {
        disputeNumber,
        milestoneId: milestone.id,
        amountINR: milestone.amountINR,
        reasonCode,
      },
      reason: `Party ${auth.user.fullName} raised dispute on milestone deliverable`,
      createdAt: now,
    };
    db.auditLogs.unshift(audit);

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: `Dispute Case ${disputeNumber} opened. Funds locked under administrative arbitration.`,
      dispute: newDispute,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create dispute" }, { status: 500 });
  }
}
