import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function FreelancerAgreementPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-600">Contractual Framework</span>
          <h1 className="mt-2 text-3xl font-extrabold text-navy-900 tracking-tight sm:text-4xl">
            Freelancer Service Agreement
          </h1>
          <p className="mt-2 text-xs text-slate-500">
            Standard Terms Governing Independent Freelance Professionals on KaryaSetu · Last Updated: October 12, 2026
          </p>
        </div>

        <Card className="p-8 sm:p-12 bg-white border-slate-200 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">1. Independent Contractor Status</h2>
            <p>
              The Freelancer enters into this Agreement as an independent contractor, sole proprietor, or corporate entity, and not as an employee, agent, partner, or joint venturer of KaryaSetu or any Client. The Freelancer retains complete autonomy regarding the location, equipment, manner, and schedule of executing agreed deliverables.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">2. Mandatory Indian Tax Compliance (Section 194-O)</h2>
            <p>
              The Freelancer acknowledges that KaryaSetu is legally required to deduct 1% TDS under Section 194-O of the Income Tax Act, 1961 on the gross amount of all marketplace services facilitated through the platform. The Freelancer agrees to provide an authentic PAN. If the Freelancer is registered under GST, they must supply their GSTIN for appropriate electronic invoicing.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">3. Non-Circumvention Obligation</h2>
            <p>
              For a period of 24 months from initial contact on KaryaSetu, the Freelancer agrees not to solicit, invoice, or accept payments from any Client introduced via the platform outside the KaryaSetu escrow payment infrastructure. Circumvention deprives both parties of contract arbitration and escrow protection and results in immediate permanent account termination and forfeiture of pending clearance balances.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">4. Deliverable Quality, Warranties & Revisions</h2>
            <p>
              The Freelancer warrants that all code, designs, and content submitted are original, do not infringe third-party copyrights or proprietary trade secrets, and conform to the project specifications agreed in the bilateral contract. The Freelancer agrees to accommodate reasonable revisions requested by the Client within the original milestone scope.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
