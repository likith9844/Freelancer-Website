# Architecture Specification: KaryaSetu (Freelancing For India)

## 1. Executive Summary & Vision

**KaryaSetu ("The Bridge of Work")** is a production-grade, two-sided Indian freelance marketplace platform connecting Indian talent (freelancers, agencies, solo professionals) with domestic and global clients (startups, MSMEs, enterprises, individuals).

Unlike conventional e-commerce or simple classified boards, KaryaSetu is a high-trust, regulated commercial exchange governed by:
- **Bilateral Commercial Contracts** with immutable versioning.
- **Milestone-Based Escrow Financial Flows** ensuring client risk mitigation and freelancer payment guarantees.
- **Compliance with Indian Regulatory Frameworks**: Reserve Bank of India (RBI) Payment Aggregator / Nodal Escrow guidelines, Central Goods and Services Tax (CGST) Section 52 (TCS), Income Tax Act Section 194-O (TDS for e-commerce operators), and the Digital Personal Data Protection Act (DPDPA 2023).
- **Double-Entry Financial Ledger** with complete auditability, immutability, and zero client-side financial trust.
- **Multi-Role Administrative Governance** with granular Role-Based Access Control (RBAC).

---

## 2. High-Level System Architecture Diagram

```mermaid
flowchart TB
    subgraph Clients["Client Layer"]
        Browser["Modern Web Browser (Next.js 14 / React 18)"]
        MobileWeb["Mobile Web (PWA Responsive)"]
    end

    subgraph Edge["Edge & Security Layer"]
        CDN["Cloudflare / Edge CDN (Static Assets, DDoS Protection)"]
        WAF["Web Application Firewall & Rate Limiter"]
    end

    subgraph AppServer["Application & API Gateway (Next.js App Router / Node.js)"]
        direction TB
        BFF["BFF / API Routes (/api/v1/*)"]
        AuthMiddleware["Auth & RBAC Middleware (JWT / Session)"]
        
        subgraph DomainModules["Modular Domain Engine"]
            IdentityModule["Identity & Access (Users, Roles, KYC)"]
            MarketplaceModule["Marketplace Catalog (Categories, Skills, Search)"]
            ProjectModule["Projects, Proposals & Contracts"]
            WorkspaceModule["Workspace & Milestone Delivery Engine"]
            FinancialModule["Financial Core (Payments, Escrow, Commissions, Ledger)"]
            DisputeModule["Dispute Arbitration & Resolution"]
            AdminModule["Admin Governance & Control Center"]
            CommunicationModule["Messaging & Notifications (In-App, Email, SMS)"]
        end
    end

    subgraph AsyncWorker["Background Processing & Queues"]
        RedisQueue["Redis (BullMQ) Queue Broker"]
        JobWorker["Background Job Worker (Webhook Ingestion, Payouts, Invoicing, Tax TCS/TDS)"]
        Scheduler["Cron / Scheduled Tasks (Milestone Reminders, Auto-releases, Nightly Recon)"]
    end

    subgraph DataStorage["Data Persistence Layer"]
        Postgres[(PostgreSQL 16 Enterprise Relational DB)]
        LedgerStore[(Double-Entry Financial Ledger - Immutable Tables)]
        AuditStore[(Audit Logs & Event Sourcing History)]
    end

    subgraph ObjectStorage["Object Storage & Media"]
        S3Storage["S3 / Cloudflare R2 Object Storage (Deliverables, KYC, Invoices)"]
    end

    subgraph ExternalServices["External Service Providers"]
        PaymentGateway["Payment Aggregators (Razorpay Route / Cashfree Split / EscrowPay)"]
        GovtKYC["KYC / Identity Verification (PAN, Aadhaar Masked, Penny-Drop Bank API)"]
        EmailSMS["Notification Gateways (Resend / SendGrid / Gupshup SMS / WhatsApp)"]
    end

    Clients --> CDN --> WAF --> BFF
    BFF --> AuthMiddleware
    AuthMiddleware --> DomainModules

    DomainModules --> Postgres
    FinancialModule --> LedgerStore
    DomainModules --> AuditStore
    DomainModules --> RedisQueue
    DomainModules --> S3Storage

    RedisQueue --> JobWorker
    Scheduler --> RedisQueue

    JobWorker --> Postgres
    JobWorker --> FinancialModule
    
    FinancialModule <--> PaymentGateway
    IdentityModule <--> GovtKYC
    CommunicationModule <--> EmailSMS
```

---

## 3. Module Dependency Map

The application follows a **Modular Monolith** architecture with strict dependency boundaries. Modules communicate via well-defined domain service interfaces and domain events, ensuring clean modularity without distributed microservice operational overhead.

```mermaid
graph TD
    %% Core Infrastructure
    Infra[Core Foundation: Config, Logger, Audit, Crypto, DB] --> Identity
    
    %% Identity & Access
    Identity[Identity & RBAC Module] --> UserProfiles[Freelancer & Client Profiles]
    Identity --> AuthSessions[Session & 2FA Management]
    
    %% Catalog & Discovery
    Catalog[Categories & Skills Catalog] --> UserProfiles
    UserProfiles --> SearchEngine[Search & Discovery Engine]
    
    %% Commercial Engagement
    UserProfiles --> Projects[Project Management Module]
    Projects --> Proposals[Proposal & Bidding Engine]
    Proposals --> Contracts[Contracts & Agreement Module]
    
    %% Workspaces & Milestones
    Contracts --> Workspaces[Project Workspaces & Tasks]
    Contracts --> Milestones[Milestone Management Engine]
    Workspaces --> Deliverables[Milestone Deliverables & Revisions]
    
    %% Messaging & Notifications
    Workspaces --> Messaging[Secure Project Messaging]
    Identity --> Notifications[Notification Dispatcher]
    Projects --> Notifications
    Milestones --> Notifications
    
    %% Financial Core
    Milestones --> FinancialCore[Payment Provider Abstraction]
    FinancialCore --> CommissionEngine[Configurable Commission Rules]
    CommissionEngine --> DoubleEntryLedger[Double-Entry Financial Ledger]
    DoubleEntryLedger --> Settlements[Settlements & Freelancer Payouts]
    DoubleEntryLedger --> Invoicing[GST & TDS Compliant Invoicing]
    
    %% Governance & Arbitration
    Workspaces --> Disputes[Dispute & Arbitration Engine]
    Disputes --> DoubleEntryLedger
    
    %% Administration & Control
    Identity --> AdminCenter[Admin Control Center]
    DoubleEntryLedger --> FinanceAdmin[Finance Dashboard & Reconciliation]
    Disputes --> AdminCenter
    Catalog --> AdminCenter
    CommissionEngine --> AdminCenter
```

---

## 4. End-to-End System Workflows

### 4.1 Client Workflow State Machine

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    Unauthenticated --> RegisteredClient: Register (Name, Email, Phone, Company, Location)
    RegisteredClient --> VerifiedClient: Verify Email & Phone / Business Details
    
    VerifiedClient --> ProjectDraft: Create Project Draft
    ProjectDraft --> PublishedProject: Publish (Category, Skills, Budget, Milestones, Deadlines)
    
    PublishedProject --> ReceivingProposals: Receive Proposals from Verified Freelancers
    ReceivingProposals --> Shortlisting: Shortlist / Reject / Message Freelancers
    Shortlisting --> Negotiating: Negotiate Scope / Pricing / Milestones
    
    Negotiating --> ContractCreated: Accept Proposal & Generate Contract
    ContractCreated --> ContractSigned: Both Parties Sign / Acknowledge Agreement
    
    ContractSigned --> MilestoneFunding: Select Milestone for Escrow Funding
    MilestoneFunding --> PaymentProcessing: Checkout via Gateway (Card, UPI, NetBanking)
    PaymentProcessing --> MilestoneFunded: Server-Verified Payment (Escrow Secured)
    
    MilestoneFunded --> FreelancerWorking: Freelancer Commences Milestone Work
    FreelancerWorking --> DeliveryReceived: Freelancer Submits Deliverable & Demo
    
    DeliveryReceived --> ReviewingDelivery: Client Reviews Submission
    
    ReviewingDelivery --> RevisionRequested: Request Scope-Compliant Revision (with notes)
    RevisionRequested --> FreelancerWorking: Freelancer Re-submits Work
    
    ReviewingDelivery --> MilestoneDisputed: Raise Dispute (Quality, Abandonment, Scope)
    
    ReviewingDelivery --> MilestoneApproved: Client Approves Deliverable
    MilestoneApproved --> PaymentReleased: Platform Releases Milestone Funds to Ledger
    
    PaymentReleased --> NextMilestone: More Milestones Remaining?
    NextMilestone --> MilestoneFunding: Yes -> Fund Next Milestone
    NextMilestone --> ProjectCompleted: No -> Final Milestone Completed
    
    MilestoneDisputed --> DisputeArbitration: Admin Arbitrates Dispute
    DisputeArbitration --> MilestoneApproved: Admin Releases Payment
    DisputeArbitration --> MilestoneRefunded: Admin Refunds Client Escrow
    
    ProjectCompleted --> MutualReview: Leave Rating & Detailed Review
    MutualReview --> [*]
```

---

### 4.2 Freelancer Workflow State Machine

```mermaid
stateDiagram-v2
    [*] --> FreelancerRegistered: Register (Name, Email, Phone, Title, Skills, City)
    FreelancerRegistered --> KYC_Pending: Submit Profile Details & Identification
    
    KYC_Pending --> KYC_UnderReview: Upload Govt ID (PAN, Aadhaar Masked), Portfolio, Bank Details
    KYC_UnderReview --> KYC_Approved: Admin / Automated Verification Succeeds
    KYC_UnderReview --> KYC_Rejected: Verification Fails (Resubmission Allowed)
    KYC_Rejected --> KYC_Pending: Correct Documents
    
    KYC_Approved --> ActiveFreelancer: Profile Published with Verification Badges
    ActiveFreelancer --> SearchingProjects: Browse & Filter Marketplace Projects
    
    SearchingProjects --> ProposalSubmitted: Submit Structured Proposal (Price, Timeline, Milestone Plan, Cover Letter)
    ProposalSubmitted --> ProposalShortlisted: Client Shortlists Proposal
    ProposalShortlisted --> ProposalNegotiation: Direct Messaging & Milestone Refinement
    
    ProposalNegotiation --> ContractOffered: Client Accepts Proposal & Issues Contract
    ContractOffered --> ContractAccepted: Freelancer Signs Immutable Agreement
    
    ContractAccepted --> AwaitingFunding: Wait for Client to Fund Milestone Escrow
    AwaitingFunding --> WorkInProgress: Notification: Milestone Funded (Safe to Work)
    
    WorkInProgress --> DeliverableSubmitted: Upload Work, Documentation, Demo URL
    DeliverableSubmitted --> AwaitingClientReview: Client Evaluates Delivery
    
    AwaitingClientReview --> RevisionsNeeded: Client Requests Revision
    RevisionsNeeded --> WorkInProgress: Freelancer Addresses Feedback
    
    AwaitingClientReview --> MilestoneApproved: Client Approves Milestone
    MilestoneApproved --> EarningsCredited: Funds Credited to Freelancer Ledger (Net of Commission & TDS)
    
    EarningsCredited --> CoolingPeriod: Security Holding Period (e.g., T+2 Days)
    CoolingPeriod --> WithdrawableBalance: Funds Move to Withdrawable Balance
    
    WithdrawableBalance --> WithdrawalRequested: Request Payout to Verified Bank Account / UPI
    WithdrawalRequested --> SettlementProcessing: System / Finance Admin Triggers Payout
    SettlementProcessing --> SettlementCompleted: Bank Transfer Confirmed via Webhook
    
    SettlementCompleted --> ClientReviewGiven: Freelancer Leaves Rating for Client
    ClientReviewGiven --> [*]
```

---

### 4.3 Administrator Workflow & Multi-Role Governance

```mermaid
stateDiagram-v2
    [*] --> SuperAdmin: Super Admin Root Access
    SuperAdmin --> RoleManagement: Configure Roles (Admin, Finance Admin, Support Admin, Moderator)
    SuperAdmin --> PermissionAssignment: Assign Granular RBAC Permissions
    
    state AdminGovernance {
        Moderator --> ContentModeration: Moderate Profiles, Portfolios, Project Postings, Reviews
        SupportAdmin --> DisputeInvestigation: Review Dispute Evidence, Workspace Chats, Deliverables
        SupportAdmin --> UserAssistance: Review Flagged Users & Suspicious Behaviors
        FinanceAdmin --> LedgerInspection: Inspect Double-Entry Ledger, Commission Rates, Taxes (TCS/TDS)
        FinanceAdmin --> PayoutApproval: Review & Approve Freelancer Withdrawals
        FinanceAdmin --> GatewayReconciliation: Reconcile PG Bank Feeds against Platform Ledger
        SuperAdmin --> SystemConfig: Manage Commission Rules, Payment Gateways, Security Policies
    }
```

---

## 5. Payment, Commission & Settlement Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Frontend as KaryaSetu Web App
    participant API as Backend API Server
    participant DB as PostgreSQL & Ledger
    participant Gateway as Payment Gateway (Razorpay/Cashfree)
    actor Freelancer
    actor FinanceAdmin as Finance Admin

    Note over Client, Freelancer: 1. Milestone Escrow Funding
    Client->>Frontend: Click "Fund Milestone #1 (₹50,000)"
    Frontend->>API: POST /api/v1/payments/order { milestoneId: "m-123" }
    
    API->>DB: Fetch Milestone, Contract, and Commission Rules
    API->>API: Compute Breakdown Server-Side:<br/>Milestone: ₹50,000<br/>Client Service Fee (3%): ₹1,500<br/>GST on Service Fee (18%): ₹270<br/>Payment Processing Fee (2%): ₹1,000<br/>Total Client Payable: ₹52,770
    API->>Gateway: createOrder({ amount: 5277000, currency: "INR", receipt: "ord_123" })
    Gateway-->>API: { order_id: "order_rzp_999", amount: 5277000 }
    API-->>Frontend: Return Order ID, Amount Breakdown, and Gateway Key

    Frontend->>Gateway: Open Payment Modal (UPI / NetBanking / Cards)
    Client->>Gateway: Authorize Payment of ₹52,770
    Gateway-->>Frontend: Success Response { payment_id: "pay_777", signature: "sig_abc" }

    Frontend->>API: POST /api/v1/payments/verify { order_id, payment_id, signature }
    API->>API: Cryptographically verify HMAC-SHA256 signature
    API->>Gateway: Fetch Payment Details via Gateway API (Check Status == "captured")
    
    rect rgb(240, 248, 255)
        Note over API, DB: Atomic Database Transaction
        API->>DB: Lock Milestone Row (SELECT FOR UPDATE)
        API->>DB: Update Milestone State -> "FUNDED"
        API->>DB: Post Double-Entry Ledger Transactions:<br/>DR: Gateway Clearing (₹52,770)<br/>CR: Client Escrow Liability (₹50,000)<br/>CR: Platform Service Fee Revenue (₹1,500)<br/>CR: GST Payable on Service Fee (₹270)<br/>CR: Payment Processing Reserve (₹1,000)
        API->>DB: Record Payment Transaction & Audit Log
    end

    API-->>Frontend: Payment Verified Successfully
    API-->>Freelancer: Notification: "Milestone Funded! You can safely start work."

    Note over Freelancer, Client: 2. Execution & Delivery
    Freelancer->>Frontend: Submit Deliverables & Staging URL
    Frontend->>API: POST /api/v1/milestones/m-123/deliver
    API-->>Client: Notification: "Milestone Deliverable Submitted for Review"

    Note over Client, Freelancer: 3. Approval & Settlement Calculation
    Client->>Frontend: Click "Approve Deliverable & Release Funds"
    Frontend->>API: POST /api/v1/milestones/m-123/approve
    
    API->>DB: Fetch Milestone & Active Commission Rules
    API->>API: Calculate Freelancer Settlement Server-Side:<br/>Milestone Gross: ₹50,000<br/>Platform Freelancer Commission (10%): ₹5,000<br/>GST on Commission (18%): ₹900<br/>Section 194-O TDS (1% of Gross): ₹500<br/>Net Payable to Freelancer: ₹43,600
    
    rect rgb(240, 255, 240)
        Note over API, DB: Atomic Settlement Transaction
        API->>DB: Update Milestone State -> "APPROVED" / "RELEASED"
        API->>DB: Post Double-Entry Ledger Entries:<br/>DR: Client Escrow Liability (₹50,000)<br/>CR: Freelancer Payable Account (₹43,600)<br/>CR: Platform Commission Revenue (₹5,000)<br/>CR: GST Payable on Commission (₹900)<br/>CR: TDS Payable u/s 194-O (₹500)
        API->>DB: Generate B2B/B2C GST Tax Invoices
        API->>DB: Credit Freelancer Wallet (Pending Clearance)
    end
    API-->>Client: "Milestone Approved and Funds Released"
    API-->>Freelancer: "₹43,600 credited to your pending balance"

    Note over Freelancer, FinanceAdmin: 4. Withdrawal & Bank Payout
    Freelancer->>Frontend: Request Withdrawal of ₹43,600 to Verified Bank Account (Penny-Dropped)
    Frontend->>API: POST /api/v1/withdrawals/request
    API->>DB: Deduct Withdrawable Balance, State -> "REQUESTED"
    
    FinanceAdmin->>Frontend: Review Withdrawal in Finance Admin Dashboard
    FinanceAdmin->>API: POST /api/v1/admin/withdrawals/w-456/process
    API->>Gateway: Initiate Bank Transfer / Route Payout (IMPS / NEFT)
    Gateway-->>API: Payout Initiated (Transfer ID: "trf_001")
    API->>DB: Update Withdrawal State -> "PROCESSING"
    
    Gateway->>API: Webhook (payout.processed, signature verified)
    API->>DB: Update Withdrawal State -> "COMPLETED"
    API->>DB: Post Ledger Entry: DR Freelancer Payable, CR Bank Account
    API-->>Freelancer: Notification: "₹43,600 successfully settled to your bank account"
```

---

## 6. Role-Based Access Control (RBAC) Matrix

| Permission Key | Super Admin | Admin | Finance Admin | Support Admin | Moderator | Client | Freelancer |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `users.view` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `users.create` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `users.edit` | ✅ | ✅ | ❌ | ❌ | ❌ | Self | Self |
| `users.suspend` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `users.delete` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `freelancers.verify` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `freelancers.kyc` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | Self |
| `projects.view` | ✅ | ✅ | ✅ | ✅ | ✅ | Own/Pub | Own/Pub |
| `projects.manage` | ✅ | ✅ | ❌ | ❌ | ❌ | Own | ❌ |
| `proposals.view` | ✅ | ✅ | ❌ | ✅ | ❌ | Own Proj | Own Bids |
| `proposals.manage` | ✅ | ✅ | ❌ | ❌ | ❌ | Own Proj | Own Bids |
| `contracts.view` | ✅ | ✅ | ✅ | ✅ | ❌ | Own | Own |
| `contracts.manage` | ✅ | ✅ | ❌ | ❌ | ❌ | Own | Own |
| `workspaces.manage` | ✅ | ✅ | ❌ | ✅ | ❌ | Own | Own |
| `payments.view` | ✅ | ✅ | ✅ | ❌ | ❌ | Own | Own |
| `payments.manage` | ✅ | ❌ | ✅ | ❌ | ❌ | Own Pay | ❌ |
| `commissions.manage` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `settlements.manage` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `withdrawals.manage` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | Own Req |
| `refunds.manage` | ✅ | ❌ | ✅ | ❌ | ❌ | Own Req | ❌ |
| `disputes.manage` | ✅ | ✅ | ❌ | ✅ | ❌ | Own Disp | Own Disp |
| `finance.reports` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `content.manage` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `categories.manage` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `notifications.manage`| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `settings.manage` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `admins.manage` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `audit.view` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 7. Technology Stack & Architecture Justification

| Layer | Selected Technology | Rationale & Enterprise Justification |
| :--- | :--- | :--- |
| **Framework** | Next.js 14+ (App Router, Server Actions, API Routes) | Unified full-stack TypeScript architecture; React Server Components for zero-bundle rendering of public directory & CMS; typed server actions for state transitions. |
| **Language** | TypeScript 5+ (Strict Mode) | End-to-end type safety across database queries, financial calculations, API requests, and UI forms. |
| **Styling & Design System** | Tailwind CSS + Radix UI + Lucide React | Custom Indian marketplace visual identity (Deep Navy `#0F172A`, Amber Saffron `#D97706`, Emerald Trust `#059669`); accessible primitives; no generic SaaS templates. |
| **Database & ORM** | PostgreSQL 16 + Prisma ORM | ACID transactions for financial ledgers; native JSONB for audit payloads and flexible metadata; robust indexing (B-Tree, GIN, Trigram). |
| **Financial Ledger** | Custom Double-Entry Ledger Engine | Enforces fundamental accounting equation (`Assets = Liabilities + Equity`); append-only transactions with debit/credit balance checks. |
| **Job Queue & Cache** | Redis 7 + BullMQ (with in-memory fallback) | Reliable asynchronous processing of payment webhooks, invoice generation, email/SMS dispatch, and reconciliation crons. |
| **Real-time Engine** | WebSockets / Server-Sent Events (SSE) | Real-time workspace collaboration, messaging, unread badges, and live milestone payment state updates. |
| **Object Storage** | S3-Compatible Storage Abstraction | Local filesystem driver for development; AWS S3 / Cloudflare R2 for production with pre-signed upload/download URLs. |
| **Testing** | Vitest + Supertest + Playwright | Unit tests for commission and ledger math; integration tests for auth and payments; end-to-end tests for client-freelancer journeys. |

---

## 8. Scalability & Operational Architecture

1. **Database Connection Pooling**: PgBouncer / Prisma connection pooling to prevent pool exhaustion during peak bidding cycles.
2. **Read-Replicas & Indexing Strategy**:
   - Primary database for writes (contracts, proposals, milestone transactions, ledger).
   - Read-replica offloading for high-frequency marketplace searches (freelancer directory, project listings, category browsing).
   - Compound B-tree indexes on `(status, created_at)` and GIN indexes on `skills` and full-text search columns.
3. **Idempotency Everywhere**:
   - Every financial endpoint (`/checkout`, `/approve`, `/refund`, `/withdraw`) requires a client-generated or server-assigned `idempotency_key` stored with an atomic Redis/DB lock.
   - Webhook processing checks `provider_event_id` to guarantee zero duplicate financial entries.
4. **Zero-Trust Financial Boundary**:
   - The frontend never passes amounts to be deducted, commissions, or tax rates.
   - Frontend only submits resource identifiers (`milestoneId`, `contractId`, `proposalId`). The backend re-fetches authoritative amounts and recalculates fees server-side.
