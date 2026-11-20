import * as React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  Landmark, 
  CheckCircle2, 
  Scale, 
  AlertTriangle,
  FileCheck,
  Server
} from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function TrustAndSafetyPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Governance & Security</span>
          <h1 className="mt-2 text-4xl font-extrabold text-navy-900 tracking-tight font-display sm:text-5xl">
            Trust & Safety Framework
          </h1>
          <p className="mt-3 text-base text-slate-500">
            How KaryaSetu guarantees contractual validity, financial non-repudiation, and personal data protection under Indian regulatory statutes.
          </p>
        </div>

        <div className="space-y-12 max-w-5xl mx-auto">
          {/* Pillar 1: Escrow Nodal Account */}
          <Card className="p-8 bg-white border-slate-200">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-100 text-navy-900">
                <Landmark className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy-900">1. RBI-Regulated Nodal Escrow Mechanism</h2>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  In compliance with Reserve Bank of India (RBI) Master Directions for Payment Aggregators (PAs) and Payment Gateways (PGs), client funds deposited for milestones are never pooled into platform operational current accounts. All payments flow directly into an authorized Payment Aggregator Nodal / Escrow account monitored under RBI guidelines. Funds are settled to freelancers strictly upon explicit client deliverable approval or administrative arbitration order.
                </p>
              </div>
            </div>
          </Card>

          {/* Pillar 2: Double-Entry Ledger */}
          <Card className="p-8 bg-white border-slate-200">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Server className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy-900">2. Immutable Double-Entry Financial Ledger</h2>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Every rupee transacted on KaryaSetu is recorded through strict double-entry bookkeeping (Debits = Credits). No client-side price, fee, or tax calculation is ever trusted. Database triggers prevent any updating or deletion of ledger rows. Reversals or dispute refunds are handled solely through compensatory adjusting journal entries.
                </p>
              </div>
            </div>
          </Card>

          {/* Pillar 3: KYC & Penny-Drop */}
          <Card className="p-8 bg-white border-slate-200">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-saffron-100 text-saffron-800">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy-900">3. Multi-Factor Identity & Penny-Drop Verification</h2>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  To eliminate identity fraud, fake accounts, and money laundering:
                </p>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                  <li>Freelancers must submit valid Permanent Account Numbers (PAN) verified against Income Tax records.</li>
                  <li>Bank account details (IFSC and Account Number) undergo automated ₹1 penny-drop validation where the registered bank account holder name is matched against the PAN identity.</li>
                  <li>Aadhaar cards are stored in masked format (only last 4 digits visible) in encrypted private vaults under DPDPA 2023 guidelines.</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Pillar 4: Legal Contracts & Arbitration */}
          <Card className="p-8 bg-white border-slate-200">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-900">
                <Scale className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy-900">4. Legal Enforceability & Dispute Arbitration</h2>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Every contract formed between client and freelancer represents a binding commercial agreement under Section 10A of the Information Technology Act 2000 and the Indian Contract Act 1872. In the event of scope disagreements or quality contestations:
                </p>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                  <li>Either party may open a dispute freezing the milestone escrow funds.</li>
                  <li>Both parties submit documentation, workspace transcripts, and code evidence.</li>
                  <li>A certified dispute arbitrator conducts an objective review and issues an enforceable resolution within 72 business hours.</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
