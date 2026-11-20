# Architecture Decision Records (ADRs): KaryaSetu

## ADR-001: Modular Monolith vs Microservices Architecture
- **Date**: 2026-10-12
- **Status**: Accepted
- **Context**: Building a two-sided freelance marketplace requires rapid iteration, transactional integrity across projects, proposals, contracts, milestones, and financial ledgers, and manageable operational complexity.
- **Decision**: Adopt a **Modular Monolith** architecture built on Next.js 14+ (App Router) and TypeScript. Organize domain modules (Auth, Identity, Catalog, Commercial, Workspaces, Financial Core, Disputes, Admin) into distinct internal packages/directories with explicit interfaces and domain boundaries.
- **Consequences**:
  - *Positive*: Enables single-transaction ACID guarantees across contracts and ledgers; simplifies deployment, local development, and continuous integration; eliminates network latency and distributed failure modes.
  - *Mitigations*: Enforce strict boundary enforcement via directory structure and linting rules to prevent circular dependencies.

---

## ADR-002: Relational Database & ORM Selection (PostgreSQL 16 + Prisma)
- **Date**: 2026-10-12
- **Status**: Accepted
- **Context**: The marketplace platform manages highly relational, mission-critical data: multi-party contracts, milestone state transitions, financial transactions, and immutable audit logs.
- **Decision**: Use **PostgreSQL 16** as the primary relational database with **Prisma ORM**.
- **Consequences**:
  - *Positive*: Unrivaled transactional reliability, robust JSONB support for polymorphic metadata and audit events, B-tree and GIN indexing, and trigger-based row protection. Prisma provides end-to-end type safety, reliable migrations, and clean query composition.
  - *Mitigations*: Use raw SQL parameterized queries for high-throughput or lock-critical operations (`SELECT FOR UPDATE` in financial settlements).

---

## ADR-003: Double-Entry Bookkeeping Engine for Marketplace Financials
- **Date**: 2026-10-12
- **Status**: Accepted
- **Context**: Conventional single-balance or ledgerless e-commerce architectures cannot support regulatory audits, dispute reconciliations, platform fee breakdowns, or tax withholdings.
- **Decision**: Implement a **Double-Entry General Ledger** system inside the database. Every financial event (milestone funding, commission deduction, tax withholding, withdrawal, refund, dispute settlement) must generate balanced Debit and Credit entries across pre-configured Chart of Accounts. Ledger rows are append-only and immutable.
- **Consequences**:
  - *Positive*: Mathematically proves that money is neither created nor destroyed; zero discrepancies during financial audits; immediate detection of reconciliation mismatches.
  - *Mitigations*: Trigger function on `ledger_entries` forbids `UPDATE` and `DELETE` operations; reversals are posted as compensatory adjusting journal entries.

---

## ADR-004: Payment Gateway & Escrow Model for India
- **Date**: 2026-10-12
- **Status**: Accepted
- **Context**: Under Reserve Bank of India (RBI) Payment Aggregator guidelines, a marketplace cannot pool customer funds in its own ordinary current account without a PA license.
- **Decision**: Implement an **Adapter Pattern (`IPaymentProvider`)** with three drivers:
  1. `MockDevelopmentPaymentProvider`: Deterministic local development, testing, and webhook simulation.
  2. `RazorpayRoutePaymentProvider`: Production marketplace routing (Linked Accounts, Escrow Nodal routing, and RazorpayX Payouts).
  3. `CashfreeMarketplacePaymentProvider`: Production marketplace split settlement and Payouts.
- **Consequences**:
  - *Positive*: Keeps business logic decoupled from third-party vendor SDKs; complies with RBI nodal guidelines; enables easy switching or multi-homing across payment gateways.
  - *Mitigations*: Webhook signature verification and idempotency tracking are mandatory across all drivers.

---

## ADR-005: Indian Tax Compliance Strategy (GST TCS & TDS Section 194-O)
- **Date**: 2026-10-12
- **Status**: Accepted
- **Context**: Indian tax law imposes obligations on e-commerce operators to deduct 1% TDS under Section 194-O on gross freelancer payments and collect 1% GST TCS under Section 52 of the CGST Act.
- **Decision**: Embed tax withholding logic into the core settlement calculation engine:
  - Verify Freelancer PAN during KYC. If PAN is verified, deduct 1% Section 194-O TDS. If unverified/missing, deduct 5% under Section 206AA.
  - Compute 18% GST on platform service fees and commissions.
  - Record each tax withholding in dedicated liability ledger accounts (`2040 GST_PAYABLE`, `2050 TDS_194O_PAYABLE`) for monthly/quarterly government remittance.
  - Issue quarterly TDS certificates (Form 16A) and B2B/B2C GST tax invoices.

---

## ADR-006: Granular Role-Based Access Control (RBAC)
- **Date**: 2026-10-12
- **Status**: Accepted
- **Context**: The platform requires 7 distinct roles (`SUPER_ADMIN`, `ADMIN`, `FINANCE_ADMIN`, `SUPPORT_ADMIN`, `MODERATOR`, `CLIENT`, `FREELANCER`) with configurable, granular permissions.
- **Decision**: Implement a database-driven RBAC schema with `roles`, `permissions`, and `role_permissions` join tables. Super Admin can dynamically grant or revoke permissions to custom admin roles without code deployment.
- **Consequences**:
  - *Positive*: Least-privilege operational security; finance admins cannot alter code or moderate content; moderators cannot approve payouts or edit commission rates.

---

## ADR-007: Object Storage Abstraction for Protected Deliverables & KYC
- **Date**: 2026-10-12
- **Status**: Accepted
- **Context**: Freelancer KYC documents and unreleased project source deliverables contain sensitive confidential data that must never be publicly accessible over the internet.
- **Decision**: Implement an `IStorageProvider` abstraction supporting local disk storage for development and S3-compatible object storage (AWS S3 / Cloudflare R2) for production. Sensitive files are stored in private buckets and delivered strictly through time-expiring (15-minute) pre-signed URLs generated only after authorization checks.
