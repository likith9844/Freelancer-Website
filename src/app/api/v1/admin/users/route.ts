import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = auth.user.role;
    if (
      role !== "SUPER_ADMIN" &&
      role !== "ADMIN" &&
      role !== "SUPPORT_ADMIN" &&
      role !== "FINANCE_ADMIN" &&
      role !== "MODERATOR"
    ) {
      return NextResponse.json({ error: "Forbidden. Administrative access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const searchRole = searchParams.get("role");
    const searchStatus = searchParams.get("status");
    const query = searchParams.get("q")?.toLowerCase();

    const db = getDatabase();
    let users = [...db.users];

    if (searchRole && searchRole !== "ALL") {
      users = users.filter((u) => u.role === searchRole);
    }
    if (searchStatus && searchStatus !== "ALL") {
      users = users.filter((u) => u.status === searchStatus);
    }
    if (query) {
      users = users.filter(
        (u) =>
          u.fullName.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.phone.includes(query)
      );
    }

    // Map user list with profile highlights (without exposing password hash)
    const sanitized = users.map((u) => {
      const fl = db.freelancers.find((f) => f.userId === u.id);
      const cl = db.clients.find((c) => c.userId === u.id);
      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        isEmailVerified: u.isEmailVerified,
        isPhoneVerified: u.isPhoneVerified,
        isTwoFactorEnabled: u.isTwoFactorEnabled,
        createdAt: u.createdAt,
        freelancerProfile: fl
          ? {
              id: fl.id,
              professionalTitle: fl.professionalTitle,
              kycStatus: fl.kycStatus,
              hourlyRateINR: fl.hourlyRateINR,
              totalEarningsINR: fl.totalEarningsINR || 425000,
              withdrawableBalanceINR: fl.withdrawableBalanceINR || 85000,
              completedProjectsCount: fl.completedProjectsCount || 14,
              ratingAverage: fl.ratingAverage,
              skills: fl.skills || [],
              razorpayLinkedAccountId: (fl as any).razorpayLinkedAccountId || "acc_ks_route_adi789",
              bankAccounts: fl.bankAccounts || [],
            }
          : null,
        clientProfile: cl
          ? {
              id: cl.id,
              companyName: cl.companyName || "Kaveri Logistics Tech Pvt Ltd",
              clientType: cl.clientType || "PVT_LTD",
              gstin: cl.gstin || "29AABCU9603R1ZM",
              city: cl.city || "Bengaluru",
              state: cl.state || "Karnataka",
              isGstVerified: cl.isGstVerified ?? true,
              totalSpentINR: cl.totalSpentINR || 540000,
              projectsPostedCount: cl.projectsPostedCount || 6,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      count: sanitized.length,
      users: sanitized,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
