import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function RefundPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Financial Assurance</span>
          <h1 className="mt-2 text-3xl font-extrabold text-navy-900 tracking-tight sm:text-4xl">
            Refund & Dispute Policy
          </h1>
          <p className="mt-2 text-xs text-slate-500">
            Last Updated: October 12, 2026 · Transparent Escrow Refund Protocol
          </p>
        </div>

        <Card className="p-8 sm:p-12 bg-white border-slate-200 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">1. Milestone Escrow Refund Eligibility</h2>
            <p>
              KaryaSetu operates an escrow-based settlement model. Funds deposited by a Client for a specific milestone remain in regulated nodal escrow until explicit approval or arbitration. Refunds are processed under the following scenarios:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li><strong>Unstarted Milestones:</strong> If a milestone has been funded but work has not commenced, the Client may cancel the milestone and receive a 100% refund of the milestone escrow balance.</li>
              <li><strong>Freelancer Abandonment:</strong> If the Freelancer becomes unresponsive for more than 5 consecutive business days without prior notice, the Client is entitled to an automatic cancellation and full escrow refund.</li>
              <li><strong>Non-Conformance with Agreed Scope:</strong> If submitted deliverables fail materially to satisfy documented contract scope criteria after standard revision cycles.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">2. Irreversible Milestone Approvals</h2>
            <p>
              Once a Client clicks &ldquo;Approve Deliverable &amp; Release Funds&rdquo; in the project workspace, milestone funds are irrevocably transferred into the Freelancer&apos;s ledger balance, platform commissions and statutory Section 194-O TDS deductions are applied, and tax invoices are generated. Approved milestone payments <strong>cannot be reversed or refunded</strong> post-approval.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">3. Third-Party Gateway Processing Charges</h2>
            <p>
              Payment gateway convenience charges (e.g. 2% charged by card networks and UPI switches) represent consumed payment infrastructure expenses and are strictly non-refundable upon cancellation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">4. Refund Disbursement Timeline</h2>
            <p>
              Approved refunds are initiated immediately via our Payment Aggregator integration. Depending on the Client&apos;s financial institution:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li><strong>UPI Payments:</strong> Credited within 24–48 hours.</li>
              <li><strong>NetBanking & Debit Cards:</strong> Credited within 3–5 business days.</li>
              <li><strong>Credit Cards:</strong> Credited within 5–7 business days according to the card issuer&apos;s billing cycle.</li>
            </ul>
          </section>
        </Card>
      </div>
    </div>
  );
}
