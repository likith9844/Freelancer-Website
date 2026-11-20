# Security & Compliance Specification: KaryaSetu (Freelancing For India)

## 1. Threat Modeling (STRIDE Matrix)

| Threat Category | Potential Attack Vectors | Architectural Defense Mechanism |
| :--- | :--- | :--- |
| **Spoofing Identity** | Fake admin login, spoofed freelancer profiles, fraudulent KYC identity theft. | Multi-Factor Authentication (TOTP) mandatory for all admin tiers; Penny-drop bank verification + PAN verification; Secure HTTP-only cookies with JWT and device fingerprint tracking. |
| **Tampering with Data** | Client-side manipulation of milestone amounts, tampering with commission calculations, altering ledger balances. | Zero-Trust Financial Model: All fees calculated purely server-side in ACID database transactions; Postgres database triggers enforce complete immutability on `ledger_entries`; Cryptographic HMAC-SHA256 signature verification on all payment webhooks. |
| **Repudiation** | Disputing milestone approvals, denying payout requests, admin claiming unauthorized commission alteration. | Complete audit trail in `audit_logs` capturing actor ID, IP address, timestamp, prior state, new state, and explicit reason; Bilateral digital signature hashes stored on `contracts`. |
| **Information Disclosure** | Leakage of PAN cards, Aadhaar documents, unencrypted bank account numbers, or private workspace chat messages. | Aadhaar numbers strictly masked (storing only `XXXXXXXX1234`); Bank account numbers encrypted at rest using AES-256-GCM; Pre-signed, time-limited URLs (15-minute expiration) for KYC files and private deliverables; Role-based row-level authorization on API responses. |
| **Denial of Service** | Bot flooding proposal submissions, brute-force login attacks, webhook spamming. | Redis-backed token bucket rate limiting: Auth endpoints restricted to 5 attempts/min; Search restricted to 60 req/min; Webhook endpoints throttled to 300 req/min; Account lockouts triggered after 5 consecutive failed login attempts. |
| **Elevation of Privilege** | Normal client or freelancer manipulating JWT claims or URL parameters to invoke administrative endpoints. | Strict server-side RBAC middleware validating user role and granular permission keys (`users.suspend`, `commissions.manage`) before executing controller actions; Super Admin isolation with break-glass audit logs. |

---

## 2. Authentication & Session Security Architecture

### 2.1 Password Hashing & Credentials
- Passwords hashed using **Argon2id** (memory cost: 65,536 KiB, iterations: 3, parallelism: 4) or **Bcrypt** with salt rounds 12.
- Minimum password strength enforced: 10 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
- Breached password checks against HaveIBeenPwned API during registration and password resets.

### 2.2 Multi-Factor Authentication (MFA / 2FA)
- Mandatory for:
  - `SUPER_ADMIN`
  - `ADMIN`
  - `FINANCE_ADMIN`
  - `SUPPORT_ADMIN`
- Implementation: Standard RFC 6238 Time-based One-Time Password (TOTP) compatible with Google Authenticator, Microsoft Authenticator, and Authy.
- Recovery codes generated during initial enrollment, hashed before persistence.

### 2.3 Session Management
- Tokens issued as short-lived Access Tokens (JWT, 15-minute lifespan) paired with cryptographically secure, rotating Refresh Tokens (30-day lifespan) stored in `sessions` table.
- Storage: `__Host-` prefixed, `HttpOnly`, `Secure`, `SameSite=Strict` browser cookies to prevent XSS exfiltration and CSRF attacks.
- Session revocation: Users can view all active sessions (IP, device, city, last active) and trigger single or global session invalidation ("Log out from all other devices").

---

## 3. Financial & Ledger Integrity Guards

### 3.1 Zero-Trust Financial Processing
- **Frontend Submission Restriction**: The frontend checkout component is strictly prohibited from submitting numerical amounts, commission percentages, or tax calculations.
- **Server-Side Authority**: The backend receives only resource IDs (`milestone_id`, `payment_method_id`). The financial calculation engine queries the database, retrieves the authoritative agreed price, looks up active versioned commission rules, computes GST/TDS, and creates the order.
- **Concurrency & Race Condition Defense**: Milestone funding and milestone releases utilize pessimistic row locking (`SELECT FOR UPDATE`) within PostgreSQL transactions with isolation level `READ COMMITTED` or `SERIALIZABLE` to prevent double-funding or double-release race conditions.

### 3.2 Database-Level Ledger Immutability
Ledger rows cannot be altered, edited, or deleted once written. PostgreSQL trigger functions unconditionally block any `UPDATE` or `DELETE` statements on the `ledger_entries` table:
```sql
CREATE OR REPLACE FUNCTION prevent_ledger_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Ledger entries are strictly immutable. Correction must be made via reversal entries.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ledger_immutable
BEFORE UPDATE OR DELETE ON ledger_entries
FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();
```

---

## 4. Indian Regulatory Compliance & Data Privacy (DPDPA 2023)

### 4.1 Digital Personal Data Protection Act, 2023 (DPDPA)
- **Purpose Limitation**: Personal identification documents (PAN, Aadhaar) collected exclusively for tax deduction (Section 194-O) and anti-money laundering (AML) compliance.
- **Right to Erasure & Financial Retention**: While users may request account deletion, financial transaction history, tax withholding records, and contract documents are retained for **8 years** in accordance with Section 149 of the Indian Income Tax Act.
- **Consent Architecture**: Clear, granular opt-in checkboxes for Terms of Service, Privacy Policy, and Escrow Arbitration rules during onboarding.

### 4.2 Aadhaar & Identity Document Protection
- Raw 12-digit Aadhaar numbers are **never stored** in plaintext.
- The platform stores only the masked representation (`XXXXXXXX1234`).
- Document uploads (Aadhaar cards, PAN cards, cancelled cheques) are stored in private object storage buckets with server-side encryption (SSE-S3 / SSE-KMS).
- Access to KYC media is restricted to authenticated moderators and finance admins via short-lived (15-minute) pre-signed URLs.

### 4.3 Bank Account Data Encryption
- Freelancer bank account numbers are encrypted at rest using **AES-256-GCM** with a distinct encryption key managed via environment secrets (`ENCRYPTION_KEY_BANK_ACCOUNTS`).
- Only masked account numbers (`XXXXXX5678`) are displayed in user-facing dashboards.

---

## 5. Network & Infrastructure Defense-in-Depth

```mermaid
graph TD
    User([User Request]) --> Cloudflare[Cloudflare WAF & DDoS Shield]
    Cloudflare --> RateLimiter[Redis Token-Bucket Rate Limiter]
    RateLimiter --> SecureHeaders[Security Headers Middleware (CSP, HSTS, X-Frame-Options)]
    SecureHeaders --> AuthCheck[Authentication & Session Validator]
    AuthCheck --> RBACGuard[RBAC Permission Validator]
    RBACGuard --> InputValidation[Zod Strict Schema Validation & Sanitization]
    InputValidation --> DomainLogic[Core Business Domain Logic]
    DomainLogic --> DB[(PostgreSQL with Parameterized Queries)]
```

### 5.1 Security Headers
The application enforces strict HTTP security headers:
- `Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-...'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.s3.ap-south-1.amazonaws.com; font-src 'self'; connect-src 'self' https://api.razorpay.com; frame-ancestors 'none';`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 5.2 File Upload Hygiene
- **Strict MIME & Magic Byte Validation**: Files checked against true binary magic numbers (e.g., verifying `\xFF\xD8\xFF` for JPEG, `\x25\x50\x44\x46` for PDF) rather than trusting the user-supplied filename extension.
- **Maximum File Sizes**:
  - Profile Photos: 5 MB
  - KYC Documents: 10 MB
  - Project Deliverables: 250 MB
- **Antivirus / Malware Scanning Hook**: File uploads pass through a background ClamAV / AWS GuardDuty container check prior to permanent publication.
