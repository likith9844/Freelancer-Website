// Role-Based Access Control (RBAC) System for KaryaSetu
// Defines all 7 roles, granular permissions, and authorization validators

export type UserRoleType =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "FINANCE_ADMIN"
  | "SUPPORT_ADMIN"
  | "MODERATOR"
  | "CLIENT"
  | "FREELANCER";

export const ALL_ROLES: { key: UserRoleType; name: string; description: string }[] = [
  {
    key: "SUPER_ADMIN",
    name: "Super Administrator",
    description: "Full sovereign control over system settings, admins, and financial policies.",
  },
  {
    key: "ADMIN",
    name: "Platform Administrator",
    description: "Operational management of users, projects, and content moderation.",
  },
  {
    key: "FINANCE_ADMIN",
    name: "Finance Administrator",
    description: "Control over payouts, settlements, tax reports, commissions, and ledger reconciliation.",
  },
  {
    key: "SUPPORT_ADMIN",
    name: "Support & Arbitration Administrator",
    description: "Dispute resolution, contract arbitration, user ticketing, and mediation.",
  },
  {
    key: "MODERATOR",
    name: "Content & KYC Moderator",
    description: "Reviewing freelancer profiles, portfolios, and KYC identification documents.",
  },
  {
    key: "CLIENT",
    name: "Client",
    description: "Post projects, hire verified freelancers, fund milestone escrow, and review deliverables.",
  },
  {
    key: "FREELANCER",
    name: "Freelancer",
    description: "Submit proposals, execute milestones, receive verified payouts, and build reputation.",
  },
];

export const PERMISSIONS = {
  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_EDIT: "users.edit",
  USERS_SUSPEND: "users.suspend",
  USERS_DELETE: "users.delete",
  FREELANCERS_VERIFY: "freelancers.verify",
  FREELANCERS_KYC: "freelancers.kyc",
  PROJECTS_VIEW: "projects.view",
  PROJECTS_MANAGE: "projects.manage",
  PROPOSALS_VIEW: "proposals.view",
  PROPOSALS_MANAGE: "proposals.manage",
  CONTRACTS_VIEW: "contracts.view",
  CONTRACTS_MANAGE: "contracts.manage",
  WORKSPACES_MANAGE: "workspaces.manage",
  PAYMENTS_VIEW: "payments.view",
  PAYMENTS_MANAGE: "payments.manage",
  COMMISSIONS_MANAGE: "commissions.manage",
  SETTLEMENTS_MANAGE: "settlements.manage",
  WITHDRAWALS_MANAGE: "withdrawals.manage",
  REFUNDS_MANAGE: "refunds.manage",
  DISPUTES_MANAGE: "disputes.manage",
  FINANCE_REPORTS: "finance.reports",
  CONTENT_MANAGE: "content.manage",
  CATEGORIES_MANAGE: "categories.manage",
  NOTIFICATIONS_MANAGE: "notifications.manage",
  SETTINGS_MANAGE: "settings.manage",
  ADMINS_MANAGE: "admins.manage",
  AUDIT_VIEW: "audit.view",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Granular Role-to-Permissions Mapping Dictionary
 */
export const ROLE_PERMISSIONS: Record<UserRoleType, PermissionKey[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS),

  ADMIN: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_SUSPEND,
    PERMISSIONS.FREELANCERS_VERIFY,
    PERMISSIONS.FREELANCERS_KYC,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_MANAGE,
    PERMISSIONS.PROPOSALS_VIEW,
    PERMISSIONS.PROPOSALS_MANAGE,
    PERMISSIONS.CONTRACTS_VIEW,
    PERMISSIONS.CONTRACTS_MANAGE,
    PERMISSIONS.WORKSPACES_MANAGE,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.DISPUTES_MANAGE,
    PERMISSIONS.CONTENT_MANAGE,
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
    PERMISSIONS.AUDIT_VIEW,
  ],

  FINANCE_ADMIN: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.FREELANCERS_KYC,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.CONTRACTS_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_MANAGE,
    PERMISSIONS.COMMISSIONS_MANAGE,
    PERMISSIONS.SETTLEMENTS_MANAGE,
    PERMISSIONS.WITHDRAWALS_MANAGE,
    PERMISSIONS.REFUNDS_MANAGE,
    PERMISSIONS.FINANCE_REPORTS,
    PERMISSIONS.AUDIT_VIEW,
  ],

  SUPPORT_ADMIN: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROPOSALS_VIEW,
    PERMISSIONS.CONTRACTS_VIEW,
    PERMISSIONS.WORKSPACES_MANAGE,
    PERMISSIONS.DISPUTES_MANAGE,
    PERMISSIONS.AUDIT_VIEW,
  ],

  MODERATOR: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.FREELANCERS_VERIFY,
    PERMISSIONS.FREELANCERS_KYC,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.CONTENT_MANAGE,
  ],

  CLIENT: [
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_MANAGE,
    PERMISSIONS.PROPOSALS_VIEW,
    PERMISSIONS.CONTRACTS_VIEW,
    PERMISSIONS.CONTRACTS_MANAGE,
    PERMISSIONS.WORKSPACES_MANAGE,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_MANAGE,
    PERMISSIONS.REFUNDS_MANAGE,
    PERMISSIONS.DISPUTES_MANAGE,
  ],

  FREELANCER: [
    PERMISSIONS.FREELANCERS_KYC,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROPOSALS_VIEW,
    PERMISSIONS.PROPOSALS_MANAGE,
    PERMISSIONS.CONTRACTS_VIEW,
    PERMISSIONS.WORKSPACES_MANAGE,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.WITHDRAWALS_MANAGE,
    PERMISSIONS.DISPUTES_MANAGE,
  ],
};

/**
 * Validates whether a specific role possesses a given granular permission
 */
export function hasPermission(role: UserRoleType, permission: PermissionKey): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Validates whether a role is one of the permitted roles
 */
export function isAllowedRole(role: UserRoleType, allowedRoles: UserRoleType[]): boolean {
  return allowedRoles.includes(role);
}

/**
 * Helper to identify if a role is any administrative tier requiring 2FA
 */
export function isAdminRole(role: UserRoleType): boolean {
  return ["SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN", "SUPPORT_ADMIN", "MODERATOR"].includes(role);
}
