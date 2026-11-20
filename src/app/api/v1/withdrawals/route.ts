import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase, DBWithdrawal, DBAuditLog } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDatabase();

    // If Admin/Finance Admin, return all withdrawals with freelancer & bank transfer details
    if (auth.user.role === "SUPER_ADMIN" || auth.user.role === "ADMIN" || auth.user.role === "FINANCE_ADMIN") {
      const enrichedWithdrawals = (db.withdrawals || []).map((w) => {
        const profile = db.freelancers.find((f) => f.id === w.freelancerId);
        const user = profile ? db.users.find((u) => u.id === profile.userId) : null;
        const bank = profile?.bankAccounts?.find((b) => b.isPrimary) || profile?.bankAccounts?.[0];
        return {
          ...w,
          freelancerName: user?.fullName || "Freelancer",
          freelancerEmail: user?.email,
          freelancerPhone: user?.phone,
          bankDetails: bank
            ? {
                bankName: bank.bankName,
                accountNumber: bank.accountNumberMasked,
                ifscCode: bank.ifscCode,
                accountHolderName: bank.accountHolderName,
              }
            : null,
        };
      });

      return NextResponse.json({
        success: true,
        withdrawals: enrichedWithdrawals,
      });
    }

    // If Freelancer, return only their withdrawals
    const flProfile = db.freelancers.find((f) => f.userId === auth.user.id);
    if (!flProfile) {
      return NextResponse.json({ error: "Freelancer profile not found" }, { status: 404 });
    }

    const myWithdrawals = db.withdrawals.filter((w) => w.freelancerId === flProfile.id);

    return NextResponse.json({
      success: true,
      wallet: {
        withdrawableBalanceINR: flProfile.withdrawableBalanceINR,
        pendingClearanceINR: flProfile.pendingClearanceINR || 0,
        totalEarningsINR: flProfile.totalEarningsINR,
        bankAccounts: flProfile.bankAccounts,
      },
      withdrawals: myWithdrawals,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch withdrawals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (auth.user.role !== "FREELANCER" && auth.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Freelancers can request payout withdrawals" }, { status: 403 });
    }

    const body = await req.json();
    const { amountINR, payoutMode = "IMPS" } = body;

    const numAmount = Number(amountINR);
    if (isNaN(numAmount) || numAmount < 500) {
      return NextResponse.json({ error: "Minimum withdrawal limit is ₹500 as per RBI guidelines." }, { status: 400 });
    }

    if (!["IMPS", "NEFT", "UPI"].includes(payoutMode)) {
      return NextResponse.json({ error: "Invalid payout mode. Supported: IMPS, NEFT, UPI" }, { status: 400 });
    }

    const db = getDatabase();
    const flProfile = db.freelancers.find((f) => f.userId === auth.user.id) || db.freelancers[0];

    if (flProfile.withdrawableBalanceINR < numAmount) {
      return NextResponse.json(
        {
          error: `Insufficient withdrawable balance (Available: ₹${flProfile.withdrawableBalanceINR.toLocaleString(
            "en-IN"
          )}).`,
        },
        { status: 400 }
      );
    }

    const primaryBank = flProfile.bankAccounts?.find((b) => b.isPrimary) || flProfile.bankAccounts?.[0];
    const accountMasked = primaryBank
      ? `${primaryBank.bankName} (${primaryBank.accountNumberMasked})`
      : "HDFC Bank (XXXXXX7890)";

    // Deduct withdrawable balance
    flProfile.withdrawableBalanceINR -= numAmount;

    const withdrawalId = `wth-${Date.now()}`;
    const withdrawalRef = `WTH-KS-${Date.now().toString().slice(-6)}`;

    const newWithdrawal: DBWithdrawal = {
      id: withdrawalId,
      withdrawalReference: withdrawalRef,
      freelancerId: flProfile.id,
      amountINR: numAmount,
      payoutMode,
      status: "REQUESTED",
      accountMasked,
      createdAt: new Date().toISOString(),
    };

    db.withdrawals.unshift(newWithdrawal);

    // Audit log
    const audit: DBAuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
      action: "WITHDRAWAL_REQUESTED",
      entityType: "WITHDRAWAL",
      entityId: withdrawalId,
      newState: {
        amountINR: numAmount,
        payoutMode,
        remainingBalance: flProfile.withdrawableBalanceINR,
      },
      reason: "Freelancer requested bank settlement payout",
      createdAt: new Date().toISOString(),
    };
    db.auditLogs.unshift(audit);

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: `Withdrawal request of ₹${numAmount.toLocaleString("en-IN")} submitted for Finance Admin processing.`,
      withdrawal: newWithdrawal,
      remainingBalanceINR: flProfile.withdrawableBalanceINR,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to request withdrawal" }, { status: 500 });
  }
}
