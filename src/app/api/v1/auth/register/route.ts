import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase, DBUser, DBFreelancerProfile, DBClientProfile } from "@/lib/db/store";
import { hashPassword } from "@/lib/auth/crypto";
import { ROLE_PERMISSIONS, UserRoleType } from "@/lib/auth/rbac";
import { createSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      password,
      role,
      // Client specific
      clientType,
      companyName,
      companyWebsite,
      gstin,
      // Freelancer specific
      professionalTitle,
      skills,
      hourlyRateINR,
      experienceYears,
      city,
      state,
      pincode,
    } = body;

    // Basic Validation
    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        { error: "Full name, email, password, and account role are mandatory" },
        { status: 400 }
      );
    }

    if (!["CLIENT", "FREELANCER"].includes(role)) {
      return NextResponse.json(
        { error: "Public registration is available exclusively for CLIENT or FREELANCER roles" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || undefined;

    const newUser: DBUser = {
      id: userId,
      email: normalizedEmail,
      phone: phone || "+919800000000",
      passwordHash,
      fullName: fullName.trim(),
      role: role as UserRoleType,
      isEmailVerified: false,
      isPhoneVerified: false,
      isTwoFactorEnabled: false,
      status: "ACTIVE",
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    let createdProfile: any = null;

    if (role === "FREELANCER") {
      const newFreelancer: DBFreelancerProfile = {
        id: `flp-${Date.now()}`,
        userId,
        professionalTitle: professionalTitle || "Independent Professional",
        bio: `Professional ${professionalTitle || "specialist"} based in ${city || "Bengaluru"}, India.`,
        hourlyRateINR: Number(hourlyRateINR) || 1500,
        experienceYears: Number(experienceYears) || 2.0,
        availabilityStatus: "AVAILABLE",
        city: city || "Bengaluru",
        state: state || "Karnataka",
        pincode: pincode || "560103",
        kycStatus: "PENDING",
        isVerifiedBadge: false,
        isTopRated: false,
        totalEarningsINR: 0,
        withdrawableBalanceINR: 0,
        pendingClearanceINR: 0,
        completedProjectsCount: 0,
        ratingAverage: 5.0,
        ratingCount: 0,
        onTimeDeliveryRate: 100,
        skills: Array.isArray(skills) && skills.length > 0 ? skills : ["General Consulting"],
        bankAccounts: [],
      };
      db.freelancers.push(newFreelancer);
      createdProfile = newFreelancer;
    } else {
      const newClient: DBClientProfile = {
        id: `clp-${Date.now()}`,
        userId,
        clientType: clientType || "INDIVIDUAL",
        companyName: companyName || fullName,
        companyWebsite: companyWebsite || "",
        gstin: gstin || "",
        city: city || "Bengaluru",
        state: state || "Karnataka",
        pincode: pincode || "560103",
        isGstVerified: Boolean(gstin && gstin.length === 15),
        isVerifiedBadge: false,
        totalSpentINR: 0,
        projectsPostedCount: 0,
        ratingAverage: 5.0,
        ratingCount: 0,
      };
      db.clients.push(newClient);
      createdProfile = newClient;
    }

    saveDatabase(db);

    // Create session & HTTP-only cookie
    const { token, session } = await createSession(userId, clientIp, userAgent);

    return NextResponse.json({
      success: true,
      message: "Account registered successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        fullName: newUser.fullName,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified,
        isPhoneVerified: newUser.isPhoneVerified,
        isTwoFactorEnabled: newUser.isTwoFactorEnabled,
        permissions: ROLE_PERMISSIONS[newUser.role],
      },
      profile: createdProfile,
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
      token,
    });
  } catch (error: any) {
    console.error("Registration API Error:", error);
    return NextResponse.json(
      { error: "Internal server error registering account" },
      { status: 500 }
    );
  }
}
