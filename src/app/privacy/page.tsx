import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Data Protection & DPDPA</span>
          <h1 className="mt-2 text-3xl font-extrabold text-navy-900 tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-slate-500">
            Compliant with the Digital Personal Data Protection Act, 2023 (DPDPA) · Last Updated: October 12, 2026
          </p>
        </div>

        <Card className="p-8 sm:p-12 bg-white border-slate-200 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">1. Data Fiduciary Commitment</h2>
            <p>
              KaryaSetu Technologies India Private Limited operates as a Data Fiduciary under the Digital Personal Data Protection Act, 2023 (&ldquo;DPDPA&rdquo;). We process personal data solely with lawful consent for specific, clear purposes including identity verification, contractual fulfillment, regulatory tax compliance, and platform security.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">2. Categories of Personal Data Collected</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li><strong>Contact Information:</strong> Full name, verified email, verified Indian mobile number (+91), residential address.</li>
              <li><strong>Tax & KYC Identifiers:</strong> Permanent Account Number (PAN) for Section 194-O Income Tax withholding; Masked Aadhaar cards (storing only last 4 digits e.g. &ldquo;XXXXXXXX1234&rdquo;).</li>
              <li><strong>Banking Data:</strong> Indian bank account numbers (encrypted at rest using AES-256-GCM) and IFSC codes for penny-drop verification and IMPS/NEFT payouts.</li>
              <li><strong>Technical Identifiers:</strong> IP addresses, session tokens, device fingerprints, and security login logs.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">3. Purpose Limitation & Prohibited Uses</h2>
            <p>
              We strictly forbid the selling, leasing, or unauthorized commercial sharing of user personal data. Data is processed exclusively to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Execute bilateral freelance contracts and workspace deliveries.</li>
              <li>Remit statutory 1% Section 194-O TDS to the Central Board of Direct Taxes (CBDT) and generate Form 16A certificates.</li>
              <li>Disburse verified payouts to authenticated bank accounts.</li>
              <li>Detect fraudulent, duplicate, or sanctioned marketplace actors.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">4. Statutory Data Retention & Erasure Limitations</h2>
            <p>
              Under DPDPA, users possess the right to data correction and erasure. However, pursuant to Section 149 of the Indian Income Tax Act, 1961 and Goods and Services Tax laws, commercial transaction records, signed contract agreements, and financial ledger logs must be retained for a mandatory statutory period of <strong>8 years</strong> from the conclusion of the relevant financial year.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">5. Grievance Redressal Officer</h2>
            <p>
              In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and DPDPA, our designated Grievance Officer can be contacted at:
            </p>
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 text-xs text-slate-600 space-y-1">
              <p><strong>Name:</strong> Sridhar Venkatesh, Grievance Officer</p>
              <p><strong>Email:</strong> grievance@karyasetu.in</p>
              <p><strong>Address:</strong> KaryaSetu Technologies India Pvt. Ltd., Outer Ring Road, Bellandur, Bengaluru 560103</p>
            </div>
          </section>
        </Card>
      </div>
    </div>
  );
}
