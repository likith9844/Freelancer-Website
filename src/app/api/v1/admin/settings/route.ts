import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase, DBAuditLog } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDatabase();
    return NextResponse.json({
      success: true,
      settings: db.systemSettings || {},
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = auth.user.role;
    if (role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "FINANCE_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Administrative access required to modify marketplace charges & rules." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const db = getDatabase();
    if (!db.systemSettings) {
      db.systemSettings = {};
    }

    const oldSettings = { ...db.systemSettings };

    // Update settings if provided (handling both percentage 10 vs decimal 0.10, and zero rates)
    const normalizeRate = (val: any) => {
      if (val === undefined || val === null || val === "") return undefined;
      const num = Number(val);
      if (isNaN(num)) return undefined;
      return num > 1 ? num / 100 : Math.max(0, num);
    };

    if (body.clientServiceFeeRate !== undefined) {
      db.systemSettings.clientServiceFeeRate = normalizeRate(body.clientServiceFeeRate);
    }
    if (body.freelancerCommissionRate !== undefined) {
      db.systemSettings.freelancerCommissionRate = normalizeRate(body.freelancerCommissionRate);
    }
    if (body.gstRate !== undefined) {
      db.systemSettings.gstRate = normalizeRate(body.gstRate);
    }
    if (body.gatewayHandlingFeeRate !== undefined) {
      db.systemSettings.gatewayHandlingFeeRate = normalizeRate(body.gatewayHandlingFeeRate);
    }
    if (body.tdsRate !== undefined) {
      db.systemSettings.tdsRate = normalizeRate(body.tdsRate);
    }
    if (body.minWithdrawalINR !== undefined) {
      db.systemSettings.minWithdrawalINR = Number(body.minWithdrawalINR);
    }
    if (body.autoReleaseDays !== undefined) {
      db.systemSettings.autoReleaseDays = Number(body.autoReleaseDays);
    }
    if (body.escrowHoldDelayDays !== undefined) {
      db.systemSettings.escrowHoldDelayDays = Number(body.escrowHoldDelayDays);
    }
    if (body.razorpayRouteMode !== undefined) {
      db.systemSettings.razorpayRouteMode = body.razorpayRouteMode;
    }
    if (body.razorpayKeyId !== undefined) {
      db.systemSettings.razorpayKeyId = body.razorpayKeyId;
    }
    if (body.razorpayKeySecret !== undefined) {
      db.systemSettings.razorpayKeySecret = body.razorpayKeySecret;
    }
    if (body.razorpayWebhookSecret !== undefined) {
      db.systemSettings.razorpayWebhookSecret = body.razorpayWebhookSecret;
    }
    if (body.payoutProcessingMode !== undefined) {
      db.systemSettings.payoutProcessingMode = body.payoutProcessingMode;
    }

    const now = new Date().toISOString();

    // Audit log
    const audit: DBAuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
      action: "PLATFORM_CHARGES_AND_SETTINGS_UPDATED",
      entityType: "SETTINGS",
      entityId: "systemSettings",
      oldState: oldSettings,
      newState: db.systemSettings,
      reason: `Admin updated marketplace commission, handling fee, GST, and Razorpay Route rules`,
      createdAt: now,
    };
    db.auditLogs.unshift(audit);

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: "Marketplace rates, charges, and Razorpay Route parameters updated successfully.",
      settings: db.systemSettings,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
