import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function TermsPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-600">Legal Agreement</span>
          <h1 className="mt-2 text-3xl font-extrabold text-navy-900 tracking-tight sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs text-slate-500">
            Last Updated: October 12, 2026 · Effective Date: October 12, 2026
          </p>
        </div>

        <Card className="p-8 sm:p-12 bg-white border-slate-200 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">1. Acceptance of Terms & Regulatory Framework</h2>
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;Client&rdquo;, or &ldquo;Freelancer&rdquo;) and KaryaSetu Technologies India Private Limited (&ldquo;KaryaSetu&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By accessing or using the platform, you agree to be bound by these Terms, governed by the Information Technology Act, 2000 and the Indian Contract Act, 1872.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">2. Marketplace Platform Nature & Milestone Escrow Alignment</h2>
            <p>
              KaryaSetu operates an online commercial marketplace enabling independent clients to contract with independent freelancers. KaryaSetu is not an employer, employment agency, or banking institution. All commercial financial transactions involving milestone funding are facilitated strictly through an authorized Payment Aggregator (PA) Nodal/Escrow account pursuant to the Reserve Bank of India (RBI) Master Directions on Payment Aggregators and Payment Gateways.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">3. User Eligibility & Mandatory Indian KYC Verification</h2>
            <p>
              To participate as a Freelancer receiving monetary settlements, you must be at least 18 years of age and complete our Indian Know Your Customer (KYC) verification, including submission of a valid Permanent Account Number (PAN) and bank account details validated via automated penny-drop verification. Clients must provide verifiable contact and company details, including a Goods and Services Tax Identification Number (GSTIN) where applicable.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">4. Financial Transactions, Commissions & Indian Tax Withholding</h2>
            <p>
              Clients agree to pay the milestone amount plus the configured platform service fee (currently 3%) and applicable 18% GST. Freelancers agree that upon milestone release, KaryaSetu will deduct its platform commission (currently 10% plus 18% GST thereon) and deduct 1% Tax Deducted at Source (TDS) under Section 194-O of the Income Tax Act, 1961 (escalating to 5% under Section 206AA if a valid PAN is not furnished).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">5. Intellectual Property & Code Ownership</h2>
            <p>
              Unless otherwise agreed in a customized bilateral contract, upon complete and approved milestone payment release by the Client, the Freelancer transfers and assigns all intellectual property rights, source code, designs, and documentation created under that milestone exclusively to the Client, subject to full discharge of milestone financial consideration.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">6. Dispute Resolution, Arbitration & Governing Law</h2>
            <p>
              Any disputes arising out of project deliverables or milestones shall first be submitted to KaryaSetu&apos;s internal dispute arbitration procedure. These Terms shall be governed exclusively by the laws of the Republic of India, and courts in Bengaluru, Karnataka shall have sole jurisdiction over legal proceedings.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
