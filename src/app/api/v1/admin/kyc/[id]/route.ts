import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase, DBAuditLog } from "@/lib/db/store";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentRole = auth.user.role;
    if (
      currentRole !== "SUPER_ADMIN" &&
      currentRole !== "ADMIN" &&
      currentRole !== "MODERATOR"
    ) {
      return NextResponse.json({ error: "Forbidden. Administrative access required for KYC moderation." }, { status: 403 });
    }

    const body = await req.json();
    const { status, notes } = body; // "APPROVED" | "REJECTED" | "SUBMITTED"

    if (!["APPROVED", "REJECTED", "SUBMITTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid KYC status. Supported: APPROVED, REJECTED, SUBMITTED" }, { status: 400 });
    }

    const db = getDatabase();
    const freelancer = db.freelancers.find((f) => f.id === id || f.userId === id);
    if (!freelancer) {
      return NextResponse.json({ error: "Freelancer profile not found" }, { status: 404 });
    }

    const oldStatus = freelancer.kycStatus;
    freelancer.kycStatus = status;
    if (status === "APPROVED") {
      freelancer.isVerifiedBadge = true;
    } else if (status === "REJECTED") {
      freelancer.isVerifiedBadge = false;
    }

    const now = new Date().toISOString();

    // Audit log
    const audit: DBAuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
      action: `KYC_${status}`,
      entityType: "KYC",
      entityId: freelancer.id,
      oldState: { kycStatus: oldStatus },
      newState: { kycStatus: status },
      reason: notes || `Admin updated KYC compliance status to ${status}`,
      createdAt: now,
    };
    db.auditLogs.unshift(audit);

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: `KYC status updated to ${status}.`,
      freelancer,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update KYC status" }, { status: 500 });
  }
}
