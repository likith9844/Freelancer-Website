import fs from "fs";
import path from "path";
import { ALL_ROLES, ROLE_PERMISSIONS, UserRoleType } from "@/lib/auth/rbac";
import { hashPassword } from "@/lib/auth/crypto";
import { CATEGORIES, FEATURED_FREELANCERS, FEATURED_PROJECTS } from "@/data/mock-marketplace-data";

export interface DBUser {
  id: string;
  email: string;
  phone: string;
  passwordHash: string;
  fullName: string;
  role: UserRoleType;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isTwoFactorEnabled: boolean;
  twoFactorSecret?: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION" | "FLAGGED";
  failedLoginAttempts: number;
  lockoutUntil?: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
}

export interface DBSession {
  id: string;
  userId: string;
  token: string;
  tokenHash: string;
  ipAddress: string;
  userAgent?: string;
  expiresAt: string;
  createdAt: string;
}

export interface DBLoginHistory {
  id: string;
  userId?: string;
  emailAttempted: string;
  ipAddress: string;
  userAgent?: string;
  status: "SUCCESS" | "INVALID_CREDENTIALS" | "LOCKED_OUT" | "2FA_FAILED";
  failureReason?: string;
  createdAt: string;
}

export interface DBFreelancerProfile {
  id: string;
  userId: string;
  professionalTitle: string;
  bio: string;
  avatarUrl?: string;
  hourlyRateINR: number;
  experienceYears: number;
  availabilityStatus: "AVAILABLE" | "BUSY" | "NOT_ACCEPTING_WORK";
  city: string;
  state: string;
  pincode: string;
  kycStatus: "PENDING" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  isVerifiedBadge: boolean;
  isTopRated: boolean;
  totalEarningsINR: number;
  withdrawableBalanceINR: number;
  pendingClearanceINR: number;
  completedProjectsCount: number;
  ratingAverage: number;
  ratingCount: number;
  onTimeDeliveryRate: number;
  skills: string[];
  bankAccounts: {
    id: string;
    accountHolderName: string;
    accountNumberMasked: string;
    ifscCode: string;
    bankName: string;
    isPrimary: boolean;
    verificationStatus: "PENDING" | "PENNY_DROP_VERIFIED" | "FAILED";
  }[];
}

export interface DBClientProfile {
  id: string;
  userId: string;
  clientType: "INDIVIDUAL" | "PROPRIETORSHIP" | "LLP" | "PVT_LTD" | "ENTERPRISE";
  companyName?: string;
  companyWebsite?: string;
  gstin?: string;
  panNumber?: string;
  city: string;
  state: string;
  pincode: string;
  isGstVerified: boolean;
  isVerifiedBadge: boolean;
  totalSpentINR: number;
  projectsPostedCount: number;
  ratingAverage: number;
  ratingCount: number;
}

export interface DBMilestone {
  id: string;
  contractId: string;
  title: string;
  description?: string;
  amountINR: number;
  sortOrder: number;
  status: "DRAFT" | "AWAITING_FUNDING" | "FUNDED" | "IN_PROGRESS" | "SUBMITTED" | "REVISION_REQUESTED" | "APPROVED" | "RELEASED" | "REFUNDED" | "DISPUTED";
  fundedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  releasedAt?: string;
  deliverable?: {
    freelancerNotes: string;
    demoUrl?: string;
    fileUrls: string[];
    submittedAt: string;
    clientFeedback?: string;
  };
}

export interface DBContract {
  id: string;
  contractNumber: string;
  projectId: string;
  proposalId: string;
  clientId: string;
  freelancerId: string;
  totalValueINR: number;
  clientServiceFeeRate: number; // 0.03
  freelancerFeeRate: number;    // 0.10
  status: "ACTIVE" | "COMPLETED" | "DISPUTED" | "CANCELLED";
  clientSignedAt?: string;
  freelancerSignedAt?: string;
  createdAt: string;
  milestones: DBMilestone[];
}

export interface DBPayment {
  id: string;
  paymentReference: string;
  contractId?: string;
  milestoneId: string;
  clientId: string;
  amountINR: number;
  status: "INITIATED" | "CAPTURED" | "FAILED" | "REFUNDED";
  providerName: "MOCK" | "RAZORPAY_ROUTE" | "CASHFREE";
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  idempotencyKey: string;
  createdAt: string;
}

export interface DBLedgerEntry {
  id: string;
  transactionGroupId: string;
  accountCode: string;
  direction: "DEBIT" | "CREDIT";
  amountINR: number;
  referenceType: "ESCROW_FUNDING" | "MILESTONE_RELEASE" | "PAYOUT" | "REFUND";
  description: string;
  createdAt: string;
}

export interface DBWithdrawal {
  id: string;
  withdrawalReference: string;
  freelancerId: string;
  amountINR: number;
  payoutMode: "IMPS" | "NEFT" | "UPI";
  status: "REQUESTED" | "PROCESSING" | "COMPLETED" | "REJECTED";
  accountMasked: string;
  utrNumber?: string;
  createdAt: string;
  processedAt?: string;
}

export interface DBDispute {
  id: string;
  disputeNumber: string;
  milestoneId: string;
  contractId: string;
  openedByUserId: string;
  disputedAgainstUserId: string;
  reasonCode: string;
  statement: string;
  disputedAmountINR: number;
  status: "OPEN" | "EVIDENCE_REVIEW" | "RESOLVED" | "DISMISSED";
  resolutionType?: "FULL_RELEASE" | "FULL_REFUND" | "SPLIT";
  freelancerAwardedINR?: number;
  clientAwardedINR?: number;
  arbitrationNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface DBAuditLog {
  id: string;
  actorUserId?: string;
  actorEmail?: string;
  actorIp: string;
  action: string;
  entityType: string;
  entityId: string;
  oldState?: any;
  newState?: any;
  reason?: string;
  createdAt: string;
}

export interface DBProject {
  id: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientCity: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  budgetType: "FIXED" | "HOURLY";
  budgetINR: number;
  duration: string;
  skillsRequired: string[];
  status: "PUBLISHED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  proposalsCount: number;
  isClientVerified: boolean;
  createdAt: string;
}

export interface DBProposal {
  id: string;
  projectId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  bidAmountINR: number;
  estimatedDurationDays: number;
  coverLetter: string;
  status: "SUBMITTED" | "SHORTLISTED" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  milestones: { title: string; amountINR: number; durationDays: number }[];
}

export interface DBMessage {
  id: string;
  workspaceId: string;
  senderUserId: string;
  senderName: string;
  senderRole: string;
  content: string;
  isSystemMessage: boolean;
  createdAt: string;
}

export interface DBNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "MILESTONE_FUNDED" | "DELIVERABLE_SUBMITTED" | "PAYMENT_RELEASED" | "DISPUTE_RAISED" | "SYSTEM";
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
}

// Master Platform State Container
export interface PlatformState {
  users: DBUser[];
  sessions: DBSession[];
  loginHistory: DBLoginHistory[];
  freelancers: DBFreelancerProfile[];
  clients: DBClientProfile[];
  projects: DBProject[];
  proposals: DBProposal[];
  contracts: DBContract[];
  payments: DBPayment[];
  ledgerEntries: DBLedgerEntry[];
  withdrawals: DBWithdrawal[];
  disputes: DBDispute[];
  auditLogs: DBAuditLog[];
  messages: DBMessage[];
  notifications: DBNotification[];
  systemSettings: Record<string, any>;
}

// File persistence path
const DATA_FILE = path.join(process.cwd(), ".data", "karyasetu_db.json");

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return true;
  fs.mkdirSync(dirname, { recursive: true });
}

// In-Memory Global Cache
let stateCache: PlatformState | null = null;

export function getDatabase(): PlatformState {
  if (stateCache) return stateCache;

  ensureDirectoryExistence(DATA_FILE);
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      stateCache = JSON.parse(data);
      return stateCache!;
    } catch (e) {
      console.error("Error reading database file, re-initializing:", e);
    }
  }

  // Initial Seed Data Generation
  stateCache = createInitialSeedState();
  saveDatabase(stateCache);
  return stateCache;
}

export function saveDatabase(state: PlatformState) {
  stateCache = state;
  try {
    ensureDirectoryExistence(DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving database file:", e);
  }
}

function createInitialSeedState(): PlatformState {
  // Pre-hashed password for "Password@123" (bcrypt salt 12)
  const defaultPasswordHash = "$2a$12$RjG9gS2Yv01j9tW0mQ4KLeQ7yT7V5tQ8Fm6Fh7xP0pP6O1e3o2e3O";

  const users: DBUser[] = [
    {
      id: "usr-super-admin",
      email: "superadmin@karyasetu.in",
      phone: "+919800000001",
      passwordHash: defaultPasswordHash,
      fullName: "Vikramaditya Singhania",
      role: "SUPER_ADMIN",
      isEmailVerified: true,
      isPhoneVerified: true,
      isTwoFactorEnabled: true,
      twoFactorSecret: "JBSWY3DPEHPK3PXP", // Demo base32 secret
      status: "ACTIVE",
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-admin",
      email: "admin@karyasetu.in",
      phone: "+919800000002",
      passwordHash: defaultPasswordHash,
      fullName: "Priyanka Nair",
      role: "ADMIN",
      isEmailVerified: true,
      isPhoneVerified: true,
      isTwoFactorEnabled: true,
      twoFactorSecret: "JBSWY3DPEHPK3PXP",
      status: "ACTIVE",
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-finance-admin",
      email: "finance@karyasetu.in",
      phone: "+919800000003",
      passwordHash: defaultPasswordHash,
      fullName: "Raghavan Iyer",
      role: "FINANCE_ADMIN",
      isEmailVerified: true,
      isPhoneVerified: true,
      isTwoFactorEnabled: true,
      twoFactorSecret: "JBSWY3DPEHPK3PXP",
      status: "ACTIVE",
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-support-admin",
      email: "support.admin@karyasetu.in",
      phone: "+919800000004",
      passwordHash: defaultPasswordHash,
      fullName: "Ananya Mukherjee",
      role: "SUPPORT_ADMIN",
      isEmailVerified: true,
      isPhoneVerified: true,
      isTwoFactorEnabled: true,
      twoFactorSecret: "JBSWY3DPEHPK3PXP",
      status: "ACTIVE",
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-moderator",
      email: "moderator@karyasetu.in",
      phone: "+919800000005",
      passwordHash: defaultPasswordHash,
      fullName: "Sameer Joshi",
      role: "MODERATOR",
      isEmailVerified: true,
      isPhoneVerified: true,
      isTwoFactorEnabled: false,
      status: "ACTIVE",
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-client-1",
      email: "client@kaveri.tech",
      phone: "+919811122233",
      passwordHash: defaultPasswordHash,
      fullName: "Rahul Verma",
      role: "CLIENT",
      isEmailVerified: true,
      isPhoneVerified: true,
      isTwoFactorEnabled: false,
      status: "ACTIVE",
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-freelancer-1",
      email: "aditya@freelancer.in",
      phone: "+919844455566",
      passwordHash: defaultPasswordHash,
      fullName: "Aditya Sharma",
      role: "FREELANCER",
      isEmailVerified: true,
      isPhoneVerified: true,
      isTwoFactorEnabled: false,
      status: "ACTIVE",
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  const freelancers: DBFreelancerProfile[] = [
    {
      id: "flp-aditya",
      userId: "usr-freelancer-1",
      professionalTitle: "Senior Full-Stack Architect (Next.js & FinTech)",
      bio: "Ex-Razorpay engineer specializing in high-throughput payment systems, real-time dashboards, and performant Next.js applications.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
      hourlyRateINR: 2800,
      experienceYears: 7,
      availabilityStatus: "AVAILABLE",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560103",
      kycStatus: "APPROVED",
      isVerifiedBadge: true,
      isTopRated: true,
      totalEarningsINR: 425000,
      withdrawableBalanceINR: 85000,
      pendingClearanceINR: 45000,
      completedProjectsCount: 52,
      ratingAverage: 4.98,
      ratingCount: 47,
      onTimeDeliveryRate: 100,
      skills: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Razorpay Route"],
      bankAccounts: [
        {
          id: "bnk-1",
          accountHolderName: "Aditya Sharma",
          accountNumberMasked: "XXXXXX7890",
          ifscCode: "HDFC0001234",
          bankName: "HDFC Bank",
          isPrimary: true,
          verificationStatus: "PENNY_DROP_VERIFIED",
        },
      ],
    },
  ];

  const clients: DBClientProfile[] = [
    {
      id: "clp-rahul",
      userId: "usr-client-1",
      clientType: "PVT_LTD",
      companyName: "Kaveri Logistics Tech Pvt Ltd",
      companyWebsite: "https://kaveri.tech",
      gstin: "29AABCU9603R1ZM",
      panNumber: "AABCU9603R",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560103",
      isGstVerified: true,
      isVerifiedBadge: true,
      totalSpentINR: 540000,
      projectsPostedCount: 6,
      ratingAverage: 5.0,
      ratingCount: 8,
    },
  ];

  const projects: DBProject[] = FEATURED_PROJECTS.map((p, idx) => ({
    id: p.id,
    clientId: "clp-rahul",
    clientName: p.clientName,
    clientCompany: p.clientCompany,
    clientCity: p.clientCity,
    title: p.title,
    slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: p.description,
    category: p.category,
    budgetType: p.budgetType,
    budgetINR: p.budgetINR,
    duration: p.duration,
    skillsRequired: p.skillsRequired,
    status: idx === 0 ? "IN_PROGRESS" : "PUBLISHED",
    proposalsCount: p.proposalsCount,
    isClientVerified: p.isClientVerified,
    createdAt: new Date().toISOString(),
  }));

  const contracts: DBContract[] = [
    {
      id: "ctr-001",
      contractNumber: "KS-CTR-2026-001",
      projectId: "proj-1",
      proposalId: "prp-1",
      clientId: "clp-rahul",
      freelancerId: "flp-aditya",
      totalValueINR: 120000,
      clientServiceFeeRate: 0.03,
      freelancerFeeRate: 0.10,
      status: "ACTIVE",
      clientSignedAt: new Date().toISOString(),
      freelancerSignedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      milestones: [
        {
          id: "ml-1",
          contractId: "ctr-001",
          title: "Milestone 1: Architecture & Auth Setup",
          description: "Database schemas, RBAC middleware, and Next.js foundation",
          amountINR: 40000,
          sortOrder: 1,
          status: "RELEASED",
          fundedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          approvedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          releasedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          deliverable: {
            freelancerNotes: "Full setup complete with PR merged and staging deployed.",
            demoUrl: "https://staging.kaveri.tech",
            fileUrls: ["https://s3.ap-south-1.amazonaws.com/karyasetu-vault/m1-arch.pdf"],
            submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            clientFeedback: "Excellent architectural layout. Approved for payment release.",
          },
        },
        {
          id: "ml-2",
          contractId: "ctr-001",
          title: "Milestone 2: Payment Gateway & Escrow Integration",
          description: "Razorpay Route adapter, webhooks, and billing dashboard",
          amountINR: 50000,
          sortOrder: 2,
          status: "AWAITING_FUNDING",
        },
        {
          id: "ml-3",
          contractId: "ctr-001",
          title: "Milestone 3: End-to-End QA & Production Handover",
          description: "Final security audit and production release",
          amountINR: 30000,
          sortOrder: 3,
          status: "AWAITING_FUNDING",
        },
      ],
    },
  ];

  const ledgerEntries: DBLedgerEntry[] = [
    // Milestone 1 Funding: Client Paid ₹42,216 (₹40,000 + 3% fee ₹1,200 + 18% GST ₹216 + 2% PG ₹800)
    {
      id: "led-1",
      transactionGroupId: "grp-m1-funding",
      accountCode: "1010-GATEWAY-CLEARING",
      direction: "DEBIT",
      amountINR: 42216,
      referenceType: "ESCROW_FUNDING",
      description: "Client funded Milestone 1 via UPI",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: "led-2",
      transactionGroupId: "grp-m1-funding",
      accountCode: "2010-CLIENT-ESCROW",
      direction: "CREDIT",
      amountINR: 40000,
      referenceType: "ESCROW_FUNDING",
      description: "Escrow liability created for Milestone 1",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: "led-3",
      transactionGroupId: "grp-m1-funding",
      accountCode: "4010-REVENUE-CLIENT-FEES",
      direction: "CREDIT",
      amountINR: 1200,
      referenceType: "ESCROW_FUNDING",
      description: "Platform 3% service fee earned",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: "led-4",
      transactionGroupId: "grp-m1-funding",
      accountCode: "2030-GST-PAYABLE-CLIENT-FEE",
      direction: "CREDIT",
      amountINR: 216,
      referenceType: "ESCROW_FUNDING",
      description: "18% GST collected on client service fee",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: "led-5",
      transactionGroupId: "grp-m1-funding",
      accountCode: "5010-GATEWAY-PROCESSING-RESERVE",
      direction: "CREDIT",
      amountINR: 800,
      referenceType: "ESCROW_FUNDING",
      description: "Payment Gateway convenience charge reserve",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },

    // Milestone 1 Approval & Release: ₹40,000 Released
    {
      id: "led-6",
      transactionGroupId: "grp-m1-release",
      accountCode: "2010-CLIENT-ESCROW",
      direction: "DEBIT",
      amountINR: 40000,
      referenceType: "MILESTONE_RELEASE",
      description: "Discharge of escrow liability upon client approval",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "led-7",
      transactionGroupId: "grp-m1-release",
      accountCode: "2020-FREELANCER-PAYABLE",
      direction: "CREDIT",
      amountINR: 34880, // ₹40,000 - 10% fee (₹4,000) - 18% GST on fee (₹720) - 1% TDS (₹400) = ₹34,880
      referenceType: "MILESTONE_RELEASE",
      description: "Net milestone receivable credited to Freelancer wallet",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "led-8",
      transactionGroupId: "grp-m1-release",
      accountCode: "4020-REVENUE-COMMISSIONS",
      direction: "CREDIT",
      amountINR: 4000,
      referenceType: "MILESTONE_RELEASE",
      description: "Platform 10% freelancer commission earned",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "led-9",
      transactionGroupId: "grp-m1-release",
      accountCode: "2040-GST-PAYABLE-COMMISSION",
      direction: "CREDIT",
      amountINR: 720,
      referenceType: "MILESTONE_RELEASE",
      description: "18% GST collected on platform commission",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "led-10",
      transactionGroupId: "grp-m1-release",
      accountCode: "2050-TDS-194O-PAYABLE",
      direction: "CREDIT",
      amountINR: 400,
      referenceType: "MILESTONE_RELEASE",
      description: "Section 194-O 1% TDS withheld for Income Tax Dept",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  const withdrawals: DBWithdrawal[] = [
    {
      id: "wth-1",
      withdrawalReference: "KS-WTH-2026-001",
      freelancerId: "flp-aditya",
      amountINR: 34880,
      payoutMode: "IMPS",
      status: "COMPLETED",
      accountMasked: "HDFC Bank (XXXXXX7890)",
      utrNumber: "CMS2026101088921",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      processedAt: new Date(Date.now() - 86400000 + 3600000).toISOString(),
    },
  ];

  const auditLogs: DBAuditLog[] = [
    {
      id: "aud-1",
      actorUserId: "usr-super-admin",
      actorEmail: "superadmin@karyasetu.in",
      actorIp: "103.21.244.1",
      action: "PLATFORM_INITIALIZATION",
      entityType: "SYSTEM",
      entityId: "system-root",
      reason: "Initial deployment of KaryaSetu India marketplace core.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "aud-2",
      actorUserId: "usr-finance-admin",
      actorEmail: "finance@karyasetu.in",
      actorIp: "14.139.128.5",
      action: "PAYOUT_APPROVED",
      entityType: "WITHDRAWAL",
      entityId: "wth-1",
      newState: { status: "COMPLETED", amountINR: 34880, utr: "CMS2026101088921" },
      reason: "Verified IMPS transfer confirmation via Bank API.",
      createdAt: new Date(Date.now() - 86400000 + 3600000).toISOString(),
    },
    {
      id: "aud-3",
      actorUserId: "usr-client-1",
      actorEmail: "client@kaveri.tech",
      actorIp: "103.21.244.1",
      action: "CONTRACT_ESTABLISHED",
      entityType: "CONTRACT",
      entityId: "ctr-001",
      reason: "Client accepted proposal and established bilateral legal contract KS-CTR-2026-001",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];

  const messages: DBMessage[] = [
    {
      id: "msg-1",
      workspaceId: "ctr-001",
      senderUserId: "usr-client-1",
      senderName: "Rahul Verma",
      senderRole: "CLIENT",
      content: "Hi Aditya, welcome! I have funded Milestone 1. Please review the API specification and let me know if you need any credentials.",
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: "msg-2",
      workspaceId: "ctr-001",
      senderUserId: "usr-freelancer-1",
      senderName: "Aditya Sharma",
      senderRole: "FREELANCER",
      content: "Thanks Rahul! I can see the milestone funded. Commencing the architecture and Next.js setup right away.",
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 86400000 * 4 + 1800000).toISOString(),
    },
  ];

  const proposals: DBProposal[] = [
    {
      id: "prp-1",
      projectId: "proj-1",
      freelancerId: "flp-aditya",
      freelancerName: "Aditya Sharma",
      freelancerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
      bidAmountINR: 120000,
      estimatedDurationDays: 45,
      coverLetter: "I specialize in Indian FinTech and high-performance logistics platforms. Built real-time route optimization systems handling 100k+ packages/day. I will structure the project into 3 verified milestones.",
      status: "ACCEPTED",
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      milestones: [
        { title: "Milestone 1: Architecture & Auth Setup", amountINR: 40000, durationDays: 15 },
        { title: "Milestone 2: Real-Time Fleet Tracking Engine", amountINR: 40000, durationDays: 15 },
        { title: "Milestone 3: Driver App Integration & Load Testing", amountINR: 40000, durationDays: 15 },
      ],
    },
    {
      id: "prp-2",
      projectId: "proj-2",
      freelancerId: "flp-aditya",
      freelancerName: "Aditya Sharma",
      freelancerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
      bidAmountINR: 180000,
      estimatedDurationDays: 60,
      coverLetter: "Experienced with ABDM (Ayushman Bharat Digital Mission) compliance, HL7/FHIR protocols, and WebRTC encrypted teleconsultations. Happy to demo our previous healthcare deployment.",
      status: "SHORTLISTED",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      milestones: [
        { title: "ABDM Health ID & Patient Records", amountINR: 60000, durationDays: 20 },
        { title: "Encrypted WebRTC Video Consultation", amountINR: 60000, durationDays: 20 },
        { title: "Digital Prescription & Payment Gateway", amountINR: 60000, durationDays: 20 },
      ],
    },
    {
      id: "prp-3",
      projectId: "proj-2",
      freelancerId: "flp-priya",
      freelancerName: "Priya Nair",
      freelancerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
      bidAmountINR: 195000,
      estimatedDurationDays: 50,
      coverLetter: "Senior Mobile Engineer with 6+ years React Native & iOS experience. Ready to deliver ABDM M1/M2/M3 compliance with clean native bridges.",
      status: "SUBMITTED",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      milestones: [
        { title: "Phase 1: React Native UI & State", amountINR: 65000, durationDays: 15 },
        { title: "Phase 2: ABDM Health Locker Integration", amountINR: 65000, durationDays: 20 },
        { title: "Phase 3: Video Calling & Security Audit", amountINR: 65000, durationDays: 15 },
      ],
    },
  ];

  return {
    users,
    sessions: [],
    loginHistory: [],
    freelancers,
    clients,
    projects,
    proposals,
    contracts,
    payments: [
      {
        id: "pay-1",
        paymentReference: "KS-PAY-2026-001",
        milestoneId: "ml-1",
        clientId: "clp-rahul",
        amountINR: 42216,
        status: "CAPTURED",
        providerName: "MOCK",
        gatewayOrderId: "order_mock_001",
        gatewayPaymentId: "pay_mock_001",
        idempotencyKey: "idem_mock_001",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ],
    ledgerEntries,
    withdrawals,
    disputes: [],
    auditLogs,
    messages,
    notifications: [
      {
        id: "notif-1",
        userId: "usr-freelancer-1",
        title: "Milestone 1 Payment Released",
        message: "Client Rahul Verma approved Milestone 1. ₹40,000 released into your withdrawable earnings.",
        type: "PAYMENT_RELEASED",
        linkUrl: "/workspace/ctr-001",
        isRead: false,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "notif-2",
        userId: "usr-client-1",
        title: "New Technical Proposal Received",
        message: "Aditya Sharma submitted a proposal for 'Build B2B SaaS Customer Portal'.",
        type: "SYSTEM",
        linkUrl: "/projects/proj-1/proposals",
        isRead: true,
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      },
    ],
    systemSettings: {
      platformName: "KaryaSetu",
      clientServiceFeeRate: 0.03,
      freelancerCommissionRate: 0.10,
      tdsRate: 0.01,
      gstRate: 0.18,
      minWithdrawalINR: 500,
      autoReleaseDays: 14,
    },
  };
}
