import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase, DBAuditLog } from "@/lib/db/store";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const db = getDatabase();

    const contract = db.contracts.find((c) => c.id === id || c.contractNumber === id);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const project = db.projects.find((p) => p.id === contract.projectId);
    const client = db.clients.find((c) => c.id === contract.clientId);
    const freelancer = db.freelancers.find((f) => f.id === contract.freelancerId);
    const clientUser = db.users.find((u) => u.id === client?.userId);
    const freelancerUser = db.users.find((u) => u.id === freelancer?.userId);

    return NextResponse.json({
      success: true,
      contract,
      project,
      client: client
        ? {
            ...client,
            fullName: clientUser?.fullName || "Rahul Verma",
            email: clientUser?.email || "client@kaveri.tech",
          }
        : null,
      freelancer: freelancer
        ? {
            ...freelancer,
            fullName: freelancerUser?.fullName || "Aditya Sharma",
            email: freelancerUser?.email || "aditya@freelancer.in",
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch contract" }, { status: 500 });
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
    const contract = db.contracts.find((c) => c.id === id || c.contractNumber === id);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const client = db.clients.find((c) => c.id === contract.clientId);
    const freelancer = db.freelancers.find((f) => f.id === contract.freelancerId);

    const now = new Date().toISOString();
    let signedRole = "";

    if (client && client.userId === auth.user.id) {
      contract.clientSignedAt = now;
      signedRole = "CLIENT";
    } else if (freelancer && freelancer.userId === auth.user.id) {
      contract.freelancerSignedAt = now;
      signedRole = "FREELANCER";
    } else if (auth.user.role === "SUPER_ADMIN" || auth.user.role === "ADMIN") {
      contract.clientSignedAt = contract.clientSignedAt || now;
      contract.freelancerSignedAt = contract.freelancerSignedAt || now;
      signedRole = "ADMIN_OVERRIDE";
    } else {
      return NextResponse.json({ error: "You are not a party to this bilateral contract." }, { status: 403 });
    }

    // Audit Log
    const audit: DBAuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
      action: "CONTRACT_DIGITALLY_SIGNED",
      entityType: "CONTRACT",
      entityId: contract.id,
      newState: {
        signedRole,
        clientSignedAt: contract.clientSignedAt,
        freelancerSignedAt: contract.freelancerSignedAt,
      },
      reason: `Contract party ${signedRole} executed digital signature under Indian Contract Act 1872`,
      createdAt: now,
    };
    db.auditLogs.unshift(audit);

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: `Contract digital signature recorded for ${signedRole}.`,
      contract,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to sign contract" }, { status: 500 });
  }
}
