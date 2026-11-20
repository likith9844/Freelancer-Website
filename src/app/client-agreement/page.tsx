import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function ClientAgreementPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-navy-900">Contractual Framework</span>
          <h1 className="mt-2 text-3xl font-extrabold text-navy-900 tracking-tight sm:text-4xl">
            Client Hiring Agreement
          </h1>
          <p className="mt-2 text-xs text-slate-500">
            Standard Terms Governing Hiring Organizations & Individuals on KaryaSetu · Last Updated: October 12, 2026
          </p>
        </div>

        <Card className="p-8 sm:p-12 bg-white border-slate-200 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">1. Commercial Engagement & Milestone Funding</h2>
            <p>
              The Client agrees to clearly define scope requirements, milestones, acceptance criteria, and deadlines prior to formal contract formation. The Client agrees to fund each milestone into the regulated Payment Aggregator nodal escrow before directing the Freelancer to commence milestone work.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">2. Deliverable Review Obligation & 14-Day Auto-Release Rule</h2>
            <p>
              Upon submission of a milestone deliverable by the Freelancer, the Client has a mandatory review window of <strong>14 consecutive calendar days</strong> to either:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Approve the deliverable and authorize fund release; or</li>
              <li>Submit specific, detailed revision feedback within original scope parameters; or</li>
              <li>Initiate a formal dispute if material non-conformance persists.</li>
            </ul>
            <p className="mt-2">
              If the Client fails to take any action within 14 calendar days despite automated reminders, the platform reserves the contractual right to auto-approve the milestone deliverable and release escrow funds to the Freelancer.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">3. Intellectual Property Assignment</h2>
            <p>
              Full legal title, copyright, source code ownership, and patent rights in custom deliverables transfer to the Client <strong>strictly upon full release of milestone funds</strong> from escrow. Unapproved or refunded milestone work remains the exclusive property of the Freelancer.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">4. Non-Circumvention</h2>
            <p>
              The Client agrees not to solicit, entice, or execute direct payments with any Freelancer introduced via KaryaSetu outside of platform escrow channels for 24 months from the introduction date.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
