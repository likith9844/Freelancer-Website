import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase, DBAuditLog } from "@/lib/db/store";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const db = getDatabase();

    const project = db.projects.find((p) => p.id === id || p.slug === id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const client = db.clients.find((c) => c.id === project.clientId);
    const auth = await getCurrentUser();

    // Check if the viewer is the project owner or admin
    const isOwnerOrAdmin =
      auth &&
      (auth.user.role === "SUPER_ADMIN" ||
        auth.user.role === "ADMIN" ||
        (client && client.userId === auth.user.id));

    // Get proposals for this project
    const allProposals = db.proposals.filter((p) => p.projectId === project.id);

    // If owner or admin, return all proposals; if freelancer, return only their proposal if any
    let viewerProposal = null;
    let proposalsList = undefined;

    if (auth && auth.user.role === "FREELANCER") {
      const flProfile = db.freelancers.find((f) => f.userId === auth.user.id);
      if (flProfile) {
        viewerProposal = allProposals.find((p) => p.freelancerId === flProfile.id) || null;
      }
    }

    if (isOwnerOrAdmin) {
      proposalsList = allProposals;
    }

    return NextResponse.json({
      success: true,
      project,
      client: client
        ? {
            id: client.id,
            companyName: client.companyName,
            clientType: client.clientType,
            city: client.city,
            state: client.state,
            isGstVerified: client.isGstVerified,
            isVerifiedBadge: client.isVerifiedBadge,
            ratingAverage: client.ratingAverage,
            totalSpentINR: client.totalSpentINR,
            projectsPostedCount: client.projectsPostedCount,
          }
        : null,
      viewerProposal,
      proposals: proposalsList,
      totalProposalsCount: allProposals.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch project details" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDatabase();
    const projectIndex = db.projects.findIndex((p) => p.id === id || p.slug === id);
    if (projectIndex === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = db.projects[projectIndex];
    const client = db.clients.find((c) => c.id === project.clientId);

    const isOwnerOrAdmin =
      auth.user.role === "SUPER_ADMIN" ||
      auth.user.role === "ADMIN" ||
      (client && client.userId === auth.user.id);

    if (!isOwnerOrAdmin) {
      return NextResponse.json({ error: "Forbidden. Only owner or admin can edit this project." }, { status: 403 });
    }

    const body = await req.json();
    if (body.status) project.status = body.status;
    if (body.title) project.title = body.title;
    if (body.description) project.description = body.description;
    if (body.budgetINR) project.budgetINR = Number(body.budgetINR);

    // Audit log
    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
      action: "PROJECT_UPDATED",
      entityType: "PROJECT",
      entityId: project.id,
      newState: { status: project.status },
      reason: body.reason || "Project updated by authorized user/admin",
      createdAt: new Date().toISOString(),
    });

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDatabase();
    const projectIndex = db.projects.findIndex((p) => p.id === id || p.slug === id);
    if (projectIndex === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = db.projects[projectIndex];
    const client = db.clients.find((c) => c.id === project.clientId);

    const isOwnerOrAdmin =
      auth.user.role === "SUPER_ADMIN" ||
      auth.user.role === "ADMIN" ||
      (client && client.userId === auth.user.id);

    if (!isOwnerOrAdmin) {
      return NextResponse.json({ error: "Forbidden. Only owner or admin can delete this project." }, { status: 403 });
    }

    // Delete project
    db.projects.splice(projectIndex, 1);

    // Also delete non-contracted proposals
    db.proposals = db.proposals.filter((p) => p.projectId !== id);

    // Audit log
    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
      action: "PROJECT_DELETED",
      entityType: "PROJECT",
      entityId: id,
      reason: `Project '${project.title}' deleted by ${auth.user.email}`,
      createdAt: new Date().toISOString(),
    });

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
