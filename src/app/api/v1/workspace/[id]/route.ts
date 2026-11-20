import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/store";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const db = getDatabase();
    const contract = db.contracts.find((c) => c.id === id || c.contractNumber === id);
    if (!contract) {
      return NextResponse.json({ error: "Workspace contract not found" }, { status: 404 });
    }

    const project = db.projects.find((p) => p.id === contract.projectId);
    const client = db.clients.find((c) => c.id === contract.clientId);
    const freelancer = db.freelancers.find((f) => f.id === contract.freelancerId);

    const clientUser = db.users.find((u) => u.id === client?.userId);
    const freelancerUser = db.users.find((u) => u.id === freelancer?.userId);

    // Permission check: Must be Client, Freelancer, or Admin
    const isClient = client && client.userId === auth.user.id;
    const isFreelancer = freelancer && freelancer.userId === auth.user.id;
    const isAdmin =
      auth.user.role === "SUPER_ADMIN" ||
      auth.user.role === "ADMIN" ||
      auth.user.role === "FINANCE_ADMIN" ||
      auth.user.role === "SUPPORT_ADMIN";

    if (!isClient && !isFreelancer && !isAdmin) {
      return NextResponse.json({ error: "Forbidden. You are not a member of this workspace." }, { status: 403 });
    }

    // Get workspace messages
    const messages = db.messages.filter((m) => m.workspaceId === contract.id);

    // Get workspace audit events
    const timelineEvents = db.auditLogs.filter(
      (a) => a.entityId === contract.id || a.entityId === contract.projectId || a.entityId === project?.id
    );

    return NextResponse.json({
      success: true,
      workspace: {
        contract,
        project,
        client: {
          id: client?.id,
          fullName: clientUser?.fullName || "Rahul Verma",
          companyName: client?.companyName || "Kaveri Logistics Tech Pvt Ltd",
          city: client?.city || "Bengaluru",
          isGstVerified: client?.isGstVerified || true,
          ratingAverage: client?.ratingAverage || 5.0,
        },
        freelancer: {
          id: freelancer?.id,
          fullName: freelancerUser?.fullName || "Aditya Sharma",
          professionalTitle: freelancer?.professionalTitle || "Senior Full-Stack Architect",
          avatarUrl: freelancer?.avatarUrl,
          city: freelancer?.city || "Bengaluru",
          isKycVerified: freelancer?.kycStatus === "APPROVED",
          ratingAverage: freelancer?.ratingAverage || 4.98,
        },
        messages,
        timelineEvents,
        currentUserRole: isClient ? "CLIENT" : isFreelancer ? "FREELANCER" : "ADMIN",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to load workspace data" }, { status: 500 });
  }
}
