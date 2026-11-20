import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase, DBContract, DBMilestone, DBAuditLog, DBMessage } from "@/lib/db/store";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const db = getDatabase();

    const proposal = db.proposals.find((p) => p.id === id);
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const project = db.projects.find((p) => p.id === proposal.projectId);
    const freelancer = db.freelancers.find((f) => f.id === proposal.freelancerId);

    return NextResponse.json({
      success: true,
      proposal,
      project,
      freelancer,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch proposal" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body; // "SHORTLIST" | "REJECT" | "ACCEPT"

    if (!["SHORTLIST", "REJECT", "ACCEPT"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Supported: SHORTLIST, REJECT, ACCEPT" }, { status: 400 });
    }

    const db = getDatabase();
    const proposal = db.proposals.find((p) => p.id === id);
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const project = db.projects.find((p) => p.id === proposal.projectId);
    if (!project) {
      return NextResponse.json({ error: "Associated project not found" }, { status: 404 });
    }

    // Permission check: Must be project client owner or admin
    const client = db.clients.find((c) => c.id === project.clientId);
    const isOwnerOrAdmin =
      auth.user.role === "SUPER_ADMIN" ||
      auth.user.role === "ADMIN" ||
      (client && client.userId === auth.user.id);

    if (!isOwnerOrAdmin) {
      return NextResponse.json({ error: "Forbidden. You are not authorized to manage proposals for this project." }, { status: 403 });
    }

    if (action === "SHORTLIST") {
      proposal.status = "SHORTLISTED";
      saveDatabase(db);
      return NextResponse.json({ success: true, message: "Proposal shortlisted", proposal });
    }

    if (action === "REJECT") {
      proposal.status = "REJECTED";
      saveDatabase(db);
      return NextResponse.json({ success: true, message: "Proposal rejected", proposal });
    }

    if (action === "ACCEPT") {
      if (proposal.status === "ACCEPTED") {
        return NextResponse.json({ error: "Proposal has already been accepted." }, { status: 400 });
      }

      // Mark proposal ACCEPTED
      proposal.status = "ACCEPTED";
      project.status = "IN_PROGRESS";

      // Generate Contract ID and Contract Number
      const contractCount = (db.contracts?.length || 0) + 1;
      const contractId = `ctr-${Date.now()}`;
      const contractNumber = `KS-CTR-2026-${String(contractCount).padStart(3, "0")}`;

      // Convert proposal milestones to Contract DBMilestones
      const contractMilestones: DBMilestone[] = proposal.milestones.map((m, idx) => ({
        id: `ml-${Date.now()}-${idx + 1}`,
        contractId,
        title: m.title,
        amountINR: m.amountINR,
        sortOrder: idx + 1,
        status: idx === 0 ? "AWAITING_FUNDING" : "DRAFT",
        description: `Deliverable scheduled for ${m.durationDays} days.`,
      }));

      const newContract: DBContract = {
        id: contractId,
        contractNumber,
        projectId: project.id,
        proposalId: proposal.id,
        clientId: project.clientId,
        freelancerId: proposal.freelancerId,
        totalValueINR: proposal.bidAmountINR,
        clientServiceFeeRate: 0.03, // 3%
        freelancerFeeRate: 0.10,    // 10%
        status: "ACTIVE",
        clientSignedAt: new Date().toISOString(),
        freelancerSignedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        milestones: contractMilestones,
      };

      db.contracts.unshift(newContract);

      // Welcome Workspace Message
      const welcomeMsg: DBMessage = {
        id: `msg-${Date.now()}`,
        workspaceId: contractId,
        senderUserId: "system",
        senderName: "KaryaSetu Escrow Switch",
        senderRole: "SYSTEM",
        content: `🎉 Bilateral Contract ${contractNumber} established! Client and Freelancer terms locked under Indian Contract Act 1872. Client please fund Milestone 1 (₹${contractMilestones[0].amountINR.toLocaleString("en-IN")}) to initiate work.`,
        isSystemMessage: true,
        createdAt: new Date().toISOString(),
      };
      db.messages.push(welcomeMsg);

      // Audit Log
      const audit: DBAuditLog = {
        id: `aud-${Date.now()}`,
        actorUserId: auth.user.id,
        actorEmail: auth.user.email,
        actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
        action: "PROPOSAL_ACCEPTED_CONTRACT_CREATED",
        entityType: "CONTRACT",
        entityId: contractId,
        newState: {
          contractNumber,
          proposalId: proposal.id,
          totalValueINR: proposal.bidAmountINR,
          milestonesCount: contractMilestones.length,
        },
        reason: "Client accepted proposal and initiated bilateral legal contract & milestone workspace",
        createdAt: new Date().toISOString(),
      };
      db.auditLogs.unshift(audit);

      saveDatabase(db);

      return NextResponse.json({
        success: true,
        message: `Proposal accepted! Legal Contract ${contractNumber} generated.`,
        contract: newContract,
        proposal,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update proposal" }, { status: 500 });
  }
}
