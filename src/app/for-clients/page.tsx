import * as React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Landmark, 
  CheckCircle2, 
  FileCheck, 
  Users, 
  ArrowRight,
  Receipt,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function ForClientsPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-600">Enterprise & Startup Hiring</span>
          <h1 className="mt-2 text-4xl font-extrabold text-navy-900 tracking-tight font-display sm:text-5xl">
            Hire Top Indian Freelancers with Complete Financial Security
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Eliminate ghosting, poor code quality, and upfront financial losses. KaryaSetu offers verified Indian specialists with milestone-based escrow locks and compliant B2B GST invoicing.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/projects">
              <Button variant="saffron" size="lg" className="font-semibold">
                Post a Project for Free
              </Button>
            </Link>
            <Link href="/freelancers">
              <Button variant="outline" size="lg">
                Browse Verified Freelancers
              </Button>
            </Link>
          </div>
        </div>

        {/* Core Pillars for Clients */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 bg-white border-slate-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-900">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy-900">Milestone Escrow Protection</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Never pay for an entire project upfront. Agree on milestone deliverables (M1, M2, M3) and fund only the active milestone. Funds stay in RBI-regulated nodal escrow until you review and approve the work.
            </p>
          </Card>

          <Card className="p-8 bg-white border-slate-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
              <Receipt className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy-900">100% GST ITC Tax Invoices</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Claim full Input Tax Credit (ITC) on all platform service fees and eligible freelance expenditures. Enter your corporate GSTIN during project creation to receive automated tax invoices.
            </p>
          </Card>

          <Card className="p-8 bg-white border-slate-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-saffron-50 text-saffron-800">
              <FileCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy-900">Bilateral Legal Contracts</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Every hire automatically generates an immutable digital contract under the Indian Contract Act 1872 covering deliverables, IP ownership assignment, confidentiality (NDA), and revision limits.
            </p>
          </Card>
        </div>

        {/* Enterprise Solutions Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-900">Enterprise Solutions</span>
            <h2 className="mt-2 text-2xl font-bold text-navy-900">Need Custom Teams or High-Volume Talent?</h2>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              We assist Indian corporate teams, venture-backed startups, and GCCs in sourcing dedicated squads of senior engineers, UI/UX designers, and financial analysts with customized Master Service Agreements (MSA) and net-30 billing.
            </p>
            <div className="mt-6">
              <Link href="/contact">
                <Button variant="navy" className="gap-2">
                  <span>Speak with an Enterprise Advisor</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
