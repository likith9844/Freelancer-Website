import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { ROLE_PERMISSIONS } from "@/lib/auth/rbac";
import { getDatabase } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const db = getDatabase();
    const freelancerProfile = db.freelancers.find((f) => f.userId === auth.user.id);
    const clientProfile = db.clients.find((c) => c.userId === auth.user.id);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: auth.user.id,
        email: auth.user.email,
        phone: auth.user.phone,
        fullName: auth.user.fullName,
        role: auth.user.role,
        isEmailVerified: auth.user.isEmailVerified,
        isPhoneVerified: auth.user.isPhoneVerified,
        isTwoFactorEnabled: auth.user.isTwoFactorEnabled,
        status: auth.user.status,
        permissions: ROLE_PERMISSIONS[auth.user.role] || [],
      },
      profile: freelancerProfile || clientProfile || null,
      session: {
        id: auth.session.id,
        expiresAt: auth.session.expiresAt,
        createdAt: auth.session.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to resolve session" }, { status: 500 });
  }
}
