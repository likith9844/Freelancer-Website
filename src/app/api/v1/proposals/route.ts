import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase, DBProposal, DBAuditLog } from "@/lib/db/store";

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as a Freelancer." }, { status: 401 });
    }

    if (auth.user.role !== "FREELANCER" && auth.user.role !== "SUPER_ADMIN" && auth.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only registered Freelancers can submit project proposals." }, { status: 403 });
    }

    const body = await req.json();
    const { projectId, bidAmountINR, estimatedDurationDays, coverLetter, milestones } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    const db = getDatabase();
    const project = db.projects.find((p) => p.id === projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (project.status !== "PUBLISHED") {
      return NextResponse.json({ error: `Cannot submit proposal. Project is currently ${project.status}.` }, { status: 400 });
    }

    const freelancerProfile = db.freelancers.find((f) => f.userId === auth.user.id) || db.freelancers[0];

    // Check if already proposed
    const existingProposal = db.proposals.find(
      (p) => p.projectId === projectId && p.freelancerId === freelancerProfile.id
    );
    if (existingProposal) {
      return NextResponse.json(
        { error: "You have already submitted a proposal for this project." },
        { status: 400 }
      );
    }

    const numBid = Number(bidAmountINR);
    if (isNaN(numBid) || numBid < 500) {
      return NextResponse.json({ error: "Minimum valid bid is ₹500." }, { status: 400 });
    }

    const numDuration = Number(estimatedDurationDays);
    if (isNaN(numDuration) || numDuration < 1 || numDuration > 365) {
      return NextResponse.json({ error: "Estimated duration must be between 1 and 365 days." }, { status: 400 });
    }

    if (!coverLetter || coverLetter.trim().length < 30) {
      return NextResponse.json({ error: "Cover letter must be at least 30 characters explaining your approach." }, { status: 400 });
    }

    // Milestones validation
    let parsedMilestones: { title: string; amountINR: number; durationDays: number }[] = [];
    if (Array.isArray(milestones) && milestones.length > 0) {
      let sumMilestones = 0;
      for (const m of milestones) {
        if (!m.title || m.title.trim().length < 3) {
          return NextResponse.json({ error: "Each milestone must have a descriptive title." }, { status: 400 });
        }
        const mAmount = Number(m.amountINR);
        if (isNaN(mAmount) || mAmount <= 0) {
          return NextResponse.json({ error: "Each milestone amount must be greater than zero." }, { status: 400 });
        }
        sumMilestones += mAmount;
        parsedMilestones.push({
          title: m.title.trim(),
          amountINR: mAmount,
          durationDays: Number(m.durationDays) || Math.round(numDuration / milestones.length),
        });
      }

      if (Math.abs(sumMilestones - numBid) > 1) {
        return NextResponse.json(
          { error: `Milestone sum (₹${sumMilestones.toLocaleString("en-IN")}) does not match your total bid (₹${numBid.toLocaleString("en-IN")}).` },
          { status: 400 }
        );
      }
    } else {
      // Default single milestone if none provided
      parsedMilestones = [
        {
          title: "Complete Project Delivery & Handover",
          amountINR: numBid,
          durationDays: numDuration,
        },
      ];
    }

    // Financial fee breakdown (Server-side calculation)
    const platformCommissionRate = 0.10; // 10%
    const tdsRate = 0.01; // 1% u/s 194-O
    const platformCommissionINR = Math.round(numBid * platformCommissionRate);
    const tdsINR = Math.round(numBid * tdsRate);
    const netTakeHomeINR = numBid - platformCommissionINR - tdsINR;

    const proposalId = `prp-${Date.now()}`;
    const newProposal: DBProposal = {
      id: proposalId,
      projectId: project.id,
      freelancerId: freelancerProfile.id,
      freelancerName: auth.user.fullName,
      freelancerAvatar: freelancerProfile.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
      bidAmountINR: numBid,
      estimatedDurationDays: numDuration,
      coverLetter: coverLetter.trim(),
      status: "SUBMITTED",
      createdAt: new Date().toISOString(),
      milestones: parsedMilestones,
    };

    db.proposals.unshift(newProposal);
    project.proposalsCount = (project.proposalsCount || 0) + 1;

    // Audit log
    const audit: DBAuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
      action: "PROPOSAL_SUBMITTED",
      entityType: "PROPOSAL",
      entityId: proposalId,
      newState: {
        projectId: project.id,
        bidAmountINR: numBid,
        platformCommissionINR,
        tdsINR,
        netTakeHomeINR,
      },
      reason: "Freelancer submitted formal proposal with milestone schedule",
      createdAt: new Date().toISOString(),
    };
    db.auditLogs.unshift(audit);

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: "Proposal submitted successfully to client.",
      proposal: newProposal,
      financialBreakdown: {
        bidAmountINR: numBid,
        platformCommissionINR,
        tdsINR,
        netTakeHomeINR,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit proposal" }, { status: 500 });
  }
}
