# KaryaSetu (कार्यसेतु) — Freelancing For India
### Production-Grade Two-Sided Indian Freelance Marketplace Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-darkblue.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)
[![Compliance](https://img.shields.io/badge/Compliance-RBI%20Escrow%20%7C%20GST%20TCS%20%7C%20TDS%20194--O-green.svg)](https://incometaxindia.gov.in/)

---

## 1. Overview & Vision

**KaryaSetu ("The Bridge of Work")** is an enterprise-grade, two-sided freelance marketplace engineered specifically for the Indian economy. It connects Indian professionals (freelancers, agencies, solo specialists) with clients (startups, MSMEs, enterprises, individuals) under a structured, secure, and legally compliant commercial umbrella.

### Key Differentiators:
1. **Regulated Milestone-Based Escrow**: Eliminates client hesitation by requiring milestone-based funding before work commences, while protecting freelancers from non-payment through escrow-backed guarantees compliant with RBI Payment Aggregator guidelines.
2. **Indian Tax & Compliance Engine**: Native handling of **Section 194-O TDS (1%)**, **Section 52 GST TCS (1%)**, **18% GST on platform service fees**, PAN validation, masked Aadhaar KYC, and penny-drop bank verification.
3. **Double-Entry General Ledger**: Mathematical proof of financial integrity. Every rupee collected, held in escrow, withheld for taxes, deducted as commission, or disbursed to freelancers is balanced across strict debit/credit accounts.
4. **Bilateral Commercial Contracts**: Immutable, digitally acknowledged project agreements binding scope, milestones, deliverables, and revision parameters.
5. **Granular Multi-Tier RBAC**: 7 configurable user roles (`SUPER_ADMIN`, `ADMIN`, `FINANCE_ADMIN`, `SUPPORT_ADMIN`, `MODERATOR`, `CLIENT`, `FREELANCER`) governed by granular permissions.
6. **Zero-Trust Financial Architecture**: No client-side fee or price calculation is trusted; all monetary values and state transitions are computed and verified server-side.

---

## 2. Comprehensive Documentation Index

All architectural specifications, database schemas, payment models, security audits, and roadmaps are documented in detail:

| Document | Purpose & Contents |
| :--- | :--- |
| **[`ARCHITECTURE.md`](file:///c:/Users/likhi/Desktop/Freelancer/ARCHITECTURE.md)** | Full system architecture, modular monolith domain layout, client/freelancer/admin state machines, RBAC permission matrix, and tech stack rationale. |
| **[`DATABASE.md`](file:///c:/Users/likhi/Desktop/Freelancer/DATABASE.md)** | Complete Entity Relationship Diagram (ERD), SQL schemas for 45+ normalized entities, double-entry ledger tables, triggers, and index strategies. |
| **[`PAYMENTS.md`](file:///c:/Users/likhi/Desktop/Freelancer/PAYMENTS.md)** | RBI Escrow compliance, `IPaymentProvider` abstraction, transparent checkout breakdown formulas, double-entry journal entries, webhook idempotency, and reconciliation. |
| **[`SECURITY.md`](file:///c:/Users/likhi/Desktop/Freelancer/SECURITY.md)** | STRIDE threat model, Argon2id/TOTP authentication, zero-trust financial guards, DPDPA 2023 compliance, Aadhaar masking, and AES-256-GCM bank encryption. |
| **[`ROADMAP.md`](file:///c:/Users/likhi/Desktop/Freelancer/ROADMAP.md)** | 12-Phase implementation master plan, MVP vs Phase-2 scope, external service dependencies, and acceptance criteria. |
| **[`DECISIONS.md`](file:///c:/Users/likhi/Desktop/Freelancer/DECISIONS.md)** | Architectural Decision Records (ADR-001 through ADR-007) detailing design trade-offs and rationale. |
| **[`PROGRESS.md`](file:///c:/Users/likhi/Desktop/Freelancer/PROGRESS.md)** | Real-time progress tracking, phase completion checklists, and current project lifecycle status. |

---

## 3. Technology Stack

- **Frontend**: Next.js 14+ (App Router, React Server Components), Tailwind CSS, Radix UI Primitives, Lucide Icons.
- **Backend API**: Modular Monolith with Next.js Server Actions & REST API (`/api/v1/*`), Zod schema validation.
- **Data Persistence**: PostgreSQL 16 (Relational DB & JSONB storage), Prisma ORM with strict migration management.
- **Financial Engine**: Double-Entry General Ledger with trigger-enforced row immutability and atomic transactions (`SELECT FOR UPDATE`).
- **Payment Abstraction**: `IPaymentProvider` interface with `MockDevelopmentPaymentProvider`, `RazorpayRoutePaymentProvider`, and `CashfreeMarketplacePaymentProvider`.
- **Cache & Async Workers**: Redis 7 + BullMQ for background webhook processing, email/SMS queues, and reconciliation crons.
- **Storage**: S3-Compatible Storage Provider (`IStorageProvider`) with time-limited pre-signed URLs.

---

## 4. Current Status & Next Steps

**Current Status**: **Phase 0 (System Architecture & Requirements Analysis) Complete**.

Implementation of **Phase 1 (Design System & Public Website)** is ready to commence upon user review and approval of the architectural foundation.
