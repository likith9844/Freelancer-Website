import { cookies, headers } from "next/headers";
import { getDatabase, saveDatabase, DBUser, DBSession } from "@/lib/db/store";
import { generateSecureToken, hashToken } from "@/lib/auth/crypto";
import { UserRoleType, PermissionKey, hasPermission } from "@/lib/auth/rbac";

export const SESSION_COOKIE_NAME = "ks_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days

export interface AuthContext {
  user: DBUser;
  session: DBSession;
}

/**
 * Creates a new persistent session for a user and sets HTTP-only cookie
 */
export async function createSession(
  userId: string,
  ipAddress: string,
  userAgent?: string
): Promise<{ token: string; session: DBSession }> {
  const db = getDatabase();
  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);

  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  const newSession: DBSession = {
    id: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    userId,
    token: rawToken,
    tokenHash: hashedToken,
    ipAddress,
    userAgent,
    expiresAt,
    createdAt: new Date().toISOString(),
  };

  db.sessions.push(newSession);
  saveDatabase(db);

  // Set HTTP-only Cookie
  try {
    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
  } catch (e) {
    // In contexts where cookies() cannot set headers directly, rawToken is returned
  }

  return { token: rawToken, session: newSession };
}

/**
 * Resolves current authenticated user from cookie or authorization header
 */
export async function getCurrentUser(): Promise<AuthContext | null> {
  let token: string | undefined;

  try {
    const cookieStore = cookies();
    token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      const headerList = headers();
      const authHeader = headerList.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    }
  } catch (e) {
    // Cookie store unavailable
  }

  if (!token) return null;

  const db = getDatabase();
  const tokenHash = hashToken(token);

  const session = db.sessions.find(
    (s) => s.tokenHash === tokenHash && new Date(s.expiresAt) > new Date()
  );

  if (!session) return null;

  const user = db.users.find((u) => u.id === session.userId && u.status === "ACTIVE");
  if (!user) return null;

  return { user, session };
}

/**
 * Invalidates and deletes current active session
 */
export async function destroySession(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      const db = getDatabase();
      const tokenHash = hashToken(token);
      db.sessions = db.sessions.filter((s) => s.tokenHash !== tokenHash);
      saveDatabase(db);
    }
    cookieStore.delete(SESSION_COOKIE_NAME);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Guard: Requires authenticated user or throws error
 */
export async function requireAuth(): Promise<AuthContext> {
  const auth = await getCurrentUser();
  if (!auth) {
    throw new Error("UNAUTHORIZED: Authentication required");
  }
  return auth;
}

/**
 * Guard: Requires specific permission
 */
export async function requirePermission(permission: PermissionKey): Promise<AuthContext> {
  const auth = await requireAuth();
  if (!hasPermission(auth.user.role, permission)) {
    throw new Error(`FORBIDDEN: Missing required permission ${permission}`);
  }
  return auth;
}

/**
 * Guard: Requires specific role(s)
 */
export async function requireRole(allowedRoles: UserRoleType[]): Promise<AuthContext> {
  const auth = await requireAuth();
  if (!allowedRoles.includes(auth.user.role)) {
    throw new Error(`FORBIDDEN: User role '${auth.user.role}' not permitted`);
  }
  return auth;
}
