import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db/store";
import { verifyPassword, hashToken, generateSecureToken } from "@/lib/auth/crypto";
import { isAdminRole, ROLE_PERMISSIONS } from "@/lib/auth/rbac";
import { createSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, totpCode } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const normalizedEmail = email.toLowerCase().trim();
    const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || undefined;

    // Check account existence
    if (!user) {
      db.loginHistory.push({
        id: `lh-${Date.now()}`,
        emailAttempted: normalizedEmail,
        ipAddress: clientIp,
        userAgent,
        status: "INVALID_CREDENTIALS",
        failureReason: "User does not exist",
        createdAt: new Date().toISOString(),
      });
      saveDatabase(db);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check account lockout
    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      const waitMinutes = Math.ceil(
        (new Date(user.lockoutUntil).getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        { error: `Account is temporarily locked due to excessive failed attempts. Please retry in ${waitMinutes} minutes.` },
        { status: 423 }
      );
    }

    // Verify Password (bcrypt) or allow dev password "Password@123"
    let isPasswordValid = false;
    if (password === "Password@123") {
      isPasswordValid = true;
    } else {
      isPasswordValid = await verifyPassword(password, user.passwordHash);
    }

    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min lockout
      }
      db.loginHistory.push({
        id: `lh-${Date.now()}`,
        userId: user.id,
        emailAttempted: normalizedEmail,
        ipAddress: clientIp,
        userAgent,
        status: "INVALID_CREDENTIALS",
        failureReason: "Incorrect password",
        createdAt: new Date().toISOString(),
      });
      saveDatabase(db);

      const attemptsRemaining = 5 - user.failedLoginAttempts;
      return NextResponse.json(
        {
          error: attemptsRemaining > 0
            ? `Invalid email or password. ${attemptsRemaining} attempt(s) remaining before lockout.`
            : "Account locked out for 15 minutes due to too many failed attempts.",
        },
        { status: 401 }
      );
    }

    // Check 2FA requirement for Admin roles
    if (isAdminRole(user.role) && user.isTwoFactorEnabled) {
      if (!totpCode) {
        return NextResponse.json({
          requires2FA: true,
          userId: user.id,
          role: user.role,
          message: "Multi-factor authentication (2FA) is required for this administrative account.",
        });
      }

      // Verify TOTP code (demo code "123456" or verified algorithm)
      const { verifyTOTPCode } = await import("@/lib/auth/crypto");
      const isValid2FA = verifyTOTPCode(user.twoFactorSecret || "JBSWY3DPEHPK3PXP", totpCode);

      if (!isValid2FA) {
        db.loginHistory.push({
          id: `lh-${Date.now()}`,
          userId: user.id,
          emailAttempted: normalizedEmail,
          ipAddress: clientIp,
          userAgent,
          status: "2FA_FAILED",
          failureReason: "Invalid TOTP code",
          createdAt: new Date().toISOString(),
        });
        saveDatabase(db);

        return NextResponse.json(
          { error: "Invalid two-factor authentication code" },
          { status: 401 }
        );
      }
    }

    // Reset failed login counter on success
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    user.lastLoginAt = new Date().toISOString();
    user.lastLoginIp = clientIp;

    db.loginHistory.push({
      id: `lh-${Date.now()}`,
      userId: user.id,
      emailAttempted: normalizedEmail,
      ipAddress: clientIp,
      userAgent,
      status: "SUCCESS",
      createdAt: new Date().toISOString(),
    });

    // Create session & HTTP-only cookie
    const { token, session } = await createSession(user.id, clientIp, userAgent);

    // Fetch profile details
    const freelancerProfile = db.freelancers.find((f) => f.userId === user.id);
    const clientProfile = db.clients.find((c) => c.userId === user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        permissions: ROLE_PERMISSIONS[user.role],
      },
      profile: freelancerProfile || clientProfile || null,
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
      token,
    });
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "Internal server error processing authentication" },
      { status: 500 }
    );
  }
}
