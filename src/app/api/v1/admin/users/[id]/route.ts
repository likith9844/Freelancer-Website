import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase, DBAuditLog } from "@/lib/db/store";
import { ALL_ROLES } from "@/lib/auth/rbac";
import { RazorpayRouteService } from "@/lib/payments/razorpay-route";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentAdminRole = auth.user.role;
    if (
      currentAdminRole !== "SUPER_ADMIN" &&
      currentAdminRole !== "ADMIN" &&
      currentAdminRole !== "FINANCE_ADMIN" &&
      currentAdminRole !== "MODERATOR"
    ) {
      return NextResponse.json({ error: "Forbidden. Administrative access required." }, { status: 403 });
    }

    const body = await req.json();
    const { action, status, role, reason } = body;

    const db = getDatabase();
    const targetUser = db.users.find((u) => u.id === id);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date().toISOString();

    if (action === "UPDATE_STATUS") {
      if (!["ACTIVE", "SUSPENDED", "FLAGGED"].includes(status)) {
        return NextResponse.json({ error: "Invalid status. Supported: ACTIVE, SUSPENDED, FLAGGED" }, { status: 400 });
      }

      const oldStatus = targetUser.status;
      targetUser.status = status;

      // Audit log
      const audit: DBAuditLog = {
        id: `aud-${Date.now()}`,
        actorUserId: auth.user.id,
        actorEmail: auth.user.email,
        actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
        action: `USER_STATUS_${status}`,
        entityType: "USER",
        entityId: targetUser.id,
        oldState: { status: oldStatus },
        newState: { status },
        reason: reason || `Admin updated account status from ${oldStatus} to ${status}`,
        createdAt: now,
      };
      db.auditLogs.unshift(audit);

      saveDatabase(db);
      return NextResponse.json({ success: true, message: `User status updated to ${status}`, user: targetUser });
    }

    if (action === "LINK_RAZORPAY_ROUTE") {
      const fl = db.freelancers.find((f) => f.userId === targetUser.id || f.id === targetUser.id);
      if (!fl) {
        return NextResponse.json({ error: "Freelancer profile not found for this user" }, { status: 404 });
      }

      const linkedAccount = await RazorpayRouteService.createOrGetLinkedAccount(fl.id);
      return NextResponse.json({
        success: true,
        message: `Freelancer successfully linked to Razorpay Route (Account ID: ${linkedAccount.id})`,
        linkedAccount,
      });
    }

    if (action === "VERIFY_CLIENT_GST") {
      const cl = db.clients.find((c) => c.userId === targetUser.id);
      if (!cl) {
        return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
      }

      cl.isGstVerified = !cl.isGstVerified;
      cl.isVerifiedBadge = cl.isGstVerified;

      db.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorUserId: auth.user.id,
        actorEmail: auth.user.email,
        actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
        action: "CLIENT_GST_VERIFICATION_TOGGLED",
        entityType: "CLIENT",
        entityId: cl.id,
        newState: { isGstVerified: cl.isGstVerified },
        reason: `Admin updated GSTIN verification badge status`,
        createdAt: now,
      });

      saveDatabase(db);
      return NextResponse.json({
        success: true,
        message: `Client GST verification status set to ${cl.isGstVerified ? "VERIFIED" : "UNVERIFIED"}`,
        clientProfile: cl,
      });
    }

    if (action === "APPROVE_KYC") {
      const fl = db.freelancers.find((f) => f.userId === targetUser.id || f.id === targetUser.id);
      if (!fl) {
        return NextResponse.json({ error: "Freelancer profile not found" }, { status: 404 });
      }

      fl.kycStatus = "APPROVED";
      fl.isVerifiedBadge = true;

      // Also ensure primary bank account is marked verified
      if (fl.bankAccounts?.[0]) {
        fl.bankAccounts[0].verificationStatus = "PENNY_DROP_VERIFIED";
      }

      db.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorUserId: auth.user.id,
        actorEmail: auth.user.email,
        actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
        action: "FREELANCER_KYC_APPROVED",
        entityType: "FREELANCER",
        entityId: fl.id,
        newState: { kycStatus: "APPROVED", isVerifiedBadge: true },
        reason: `Admin verified CBDT PAN and bank penny-drop records`,
        createdAt: now,
      });

      saveDatabase(db);
      return NextResponse.json({
        success: true,
        message: "Freelancer KYC approved & Verified Badge granted",
        freelancerProfile: fl,
      });
    }

    if (action === "UPDATE_ROLE") {
      if (currentAdminRole !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Only SUPER_ADMIN can modify user roles." }, { status: 403 });
      }

      if (!ALL_ROLES.includes(role)) {
        return NextResponse.json({ error: `Invalid role: ${role}` }, { status: 400 });
      }

      const oldRole = targetUser.role;
      targetUser.role = role;

      // Audit log
      const audit: DBAuditLog = {
        id: `aud-${Date.now()}`,
        actorUserId: auth.user.id,
        actorEmail: auth.user.email,
        actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
        action: "USER_ROLE_CHANGED",
        entityType: "USER",
        entityId: targetUser.id,
        oldState: { role: oldRole },
        newState: { role },
        reason: reason || `Super Admin updated user role from ${oldRole} to ${role}`,
        createdAt: now,
      };
      db.auditLogs.unshift(audit);

      saveDatabase(db);
      return NextResponse.json({ success: true, message: `User role changed to ${role}`, user: targetUser });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}
