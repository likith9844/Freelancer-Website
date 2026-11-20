# Implementation Roadmap & Milestone Plan: KaryaSetu

## 1. Project Phase Breakdown (Phase 0 through Phase 12)

| Phase | Phase Title | Scope & Key Deliverables | Status |
| :---: | :--- | :--- | :---: |
| **0** | **Architecture & Requirements** | Deep analysis, ERD, payment/escrow design, Indian tax/RBI specs, ADRs, acceptance criteria. | **Completed / Awaiting Approval** |
| **1** | **Design System & Public Website** | Tailwind design system (Indian marketplace visual identity), Homepage, Browse Freelancers/Projects, Pricing, Legal/Compliance pages. | Planned |
| **2** | **Authentication & RBAC** | Auth with email/password, phone verification, 2FA for admins, sessions, login history, 7-role RBAC matrix. | Planned |
| **3** | **Client & Freelancer Profiles** | Comprehensive freelancer profiles, portfolios, Indian KYC workflow (PAN/Aadhaar/Bank penny drop), Client business profiles. | Planned |
| **4** | **Projects & Proposals** | Project posting wizard, category/skill tagging, proposal bidding system, proposal shortlisting & negotiation. | Planned |
| **5** | **Contracts, Milestones & Workspace** | Bilateral digital agreements, milestone breakdown engine, project workspaces, file exchange, deliverable review/revision workflow. | Planned |
| **6** | **Payments, Commission & Ledger** | Payment provider abstraction (`IPaymentProvider`), Mock & Razorpay/Cashfree adapters, checkout breakdown, double-entry financial ledger, GST & TDS calculation engine. | Planned |
| **7** | **Settlements, Refunds & Disputes** | Freelancer pending/withdrawable balance, withdrawal requests, bank payouts, full/partial refund engine, dispute arbitration workspace. | Planned |
| **8** | **Admin Control Center** | Enterprise admin dashboard, user moderation, KYC verification console, dispute resolver, commission rule editor, settings manager. | Planned |
| **9** | **Notifications & Messaging** | Real-time workspace chat, typing indicators, file attachments, in-app notification center, email/SMS template engine. | Planned |
| **10** | **Analytics & Financial Reporting** | GMV & platform revenue reports, payment gateway reconciliation dashboard, TDS/GST tax reports, CSV/XLSX/PDF export engine. | Planned |
| **11** | **Security & Testing Suite** | Unit test suite (commission/ledger math), integration tests (checkout/webhooks), E2E flows (hire-to-payout), OWASP hardening, rate limiting. | Planned |
| **12** | **Production Deployment & DevOps** | Production environment configuration, Docker containerization, CI/CD pipeline, automated database migrations, health probes. | Planned |

---

## 2. MVP vs Phase-2 Feature Matrix

### 2.1 Core MVP Scope (Production Launch Ready)
- **Identity & Profiles**:
  - Full registration & authentication for Clients and Freelancers.
  - Granular RBAC supporting 7 roles (`SUPER_ADMIN`, `ADMIN`, `FINANCE_ADMIN`, `SUPPORT_ADMIN`, `MODERATOR`, `CLIENT`, `FREELANCER`).
  - Professional freelancer profile with portfolios, skills, hourly rates, and verified badges.
  - Multi-step KYC workflow with PAN verification, masked Aadhaar upload, and bank account penny drop.
- **Commercial & Project Lifecycle**:
  - Structured project posting with budget, category, skill tagging, and milestone planning.
  - Proposal submission engine with cover letters, pricing, and milestone breakdown.
  - Proposal negotiation and mutual contract generation with immutable versioning.
- **Milestone Escrow & Workspace**:
  - Milestone funding flow with transparent fee calculation (Platform Fee + GST + PG fee).
  - Project workspace with task tracking, file sharing, and project messaging.
  - Milestone deliverable submission, client review, and revision request loop.
- **Financial Core & Compliance**:
  - `IPaymentProvider` abstraction with `MockDevelopmentPaymentProvider` and `RazorpayRoutePaymentProvider`.
  - Server-verified payments and HMAC-signed webhook processing with idempotency guards.
  - Double-entry financial general ledger with balanced debits and credits.
  - Configurable commission engine (client fee + freelancer commission).
  - Indian tax compliance: Section 194-O TDS (1%) and Section 52 GST TCS (1%).
  - Freelancer withdrawal engine to verified bank account (IMPS/NEFT).
  - Automated payment gateway reconciliation dashboard.
- **Governance & Arbitration**:
  - Dispute resolution workspace with evidence submission and administrative arbitration.
  - Comprehensive Admin Control Center for user management, KYC review, financial ledger inspection, and audit logging.
  - Bilateral 5-star rating and review system with moderation tools.

### 2.2 Phase-2 Extensions (Post-Launch Enhancements)
- **Subscriptions & Tiers**: Pro / Business memberships offering discounted platform commissions, profile boosts, and custom analytics.
- **Automated Source Code Escrow**: GitHub / GitLab repository webhook integration to automate code delivery verification before release.
- **AI-Powered Talent Matching**: Embedding-based vector search matching client project descriptions to candidate freelancer portfolios and work history.
- **Cross-Border Multi-Currency**: Accepting international client payments in USD/EUR with automated foreign inward remittance certificates (FIRC / e-BRC).
- **Mobile Native Applications**: iOS and Android mobile apps built on React Native.

---

## 3. External Services & Infrastructure Requirements

| Service Category | Recommended Provider | Fallback / Alternative | Purpose in System |
| :--- | :--- | :--- | :--- |
| **Payment Gateway** | Razorpay (Route + RazorpayX) | Cashfree Payments (Easy Split) | Milestone checkout, escrow routing, UPI, bank payouts. |
| **Identity / KYC API** | Cashfree Verification Suite / Sandbox API | Karza Technologies / DigiLocker | PAN verification, Aadhaar OTP verification, Bank account penny-drop. |
| **Transactional Email** | Resend / SendGrid | AWS SES | Transactional alerts, contract confirmations, invoice delivery. |
| **SMS / WhatsApp** | Gupshup / Twilio | MSG91 | Phone OTP verification, urgent milestone and payout notifications. |
| **Object Storage** | Cloudflare R2 / AWS S3 | MinIO (Self-hosted) | Secure storage for portfolio media, KYC docs, and deliverables. |
| **Relational Database** | Managed PostgreSQL (Neon / Supabase / RDS) | Self-hosted PostgreSQL 16 | Primary ACID relational database and immutable ledger. |
| **Cache & Queues** | Upstash Redis / Managed Redis | Redis 7 on Docker | Token-bucket rate limiting, BullMQ background jobs. |

---

## 4. Acceptance Criteria by Module

### Module 1: Design System & Public Website
- [ ] Responsive navigation header with distinct Client, Freelancer, and Admin states.
- [ ] Homepage hero communicates "Find trusted Indian freelancers for your next project" with search bar.
- [ ] Browse Freelancers page supports filtering by category, skill, price range, rating, and verification status.
- [ ] Browse Projects page supports filtering by budget type, budget range, and duration.
- [ ] Legal pages (Terms, Privacy Policy, Refund Policy, Freelancer Agreement, Client Agreement) present and compliant with Indian law.

### Module 2: Authentication & RBAC
- [ ] Email/password registration and login with Argon2id/Bcrypt hashing.
- [ ] Email and phone number verification flow.
- [ ] Session management with rotating refresh tokens and device logout.
- [ ] TOTP 2FA enrollment and challenge enforcement for admin roles.
- [ ] Granular RBAC middleware blocking unauthorized access with HTTP 403 Forbidden.

### Module 3: Profiles & Indian KYC
- [ ] Freelancer profile displays skills, hourly rate, portfolio items, certifications, and rating badges.
- [ ] Indian KYC submission accepts PAN, masked Aadhaar, and bank account details (IFSC, Account Number).
- [ ] Penny-drop bank verification validates account holder name match.
- [ ] Admin verification console enables reviewing documents, approving, rejecting with reason, or requesting resubmission.

### Module 4: Projects & Proposals
- [ ] Client can create and publish projects with budget, milestone plan, and skill requirements.
- [ ] Verified freelancers can submit proposals with pricing, delivery timeline, cover letter, and proposed milestones.
- [ ] Client can shortlist, negotiate, reject, or accept proposals.

### Module 5: Contracts, Milestones & Workspace
- [ ] Proposal acceptance automatically generates an immutable contract with unique contract number.
- [ ] Both client and freelancer must acknowledge the contract terms.
- [ ] Workspace tracks milestones, deliverable submissions, and scope revision requests.
- [ ] Scope change requests cannot alter original milestone pricing without mutual acceptance.

### Module 6: Payments, Commission & Double-Entry Ledger
- [ ] Checkout displays exact breakdown: Milestone + Client Fee + GST + PG fee.
- [ ] Order creation, payment authorization, and signature verification executed strictly server-side.
- [ ] Every milestone funding event creates balanced double-entry ledger entries (Total Debits = Total Credits).
- [ ] Client delivery approval triggers server-side deduction of platform commission, GST on commission, and Section 194-O TDS.
- [ ] Milestone funds transition securely into freelancer payable balance.
- [ ] Payment webhooks verify HMAC-SHA256 signature and enforce idempotency using `payment_events`.

### Module 7: Settlements, Withdrawals, Refunds & Disputes
- [ ] Freelancers can request withdrawal to verified bank accounts (minimum ₹500).
- [ ] Finance Admin can review, approve, or reject withdrawal requests.
- [ ] Payout execution triggers IMPS/NEFT via payment adapter and posts balanced ledger entries upon webhook confirmation.
- [ ] Milestone refunds create compensatory reversal entries in ledger (never deleting historical rows).
- [ ] Either party can raise a dispute; Admin can examine evidence and arbitrate (release, refund, or split).

### Module 8: Admin Control Center & Audit Logging
- [ ] Super Admin can customize roles, permissions, and system settings.
- [ ] Finance Admin can inspect the double-entry ledger, balance sheet, and reconciliation discrepancies.
- [ ] Every administrative action generates an immutable audit log record capturing actor, IP, timestamp, and diff.
