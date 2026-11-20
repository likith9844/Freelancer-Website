import * as React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  CheckCircle2, 
  Briefcase, 
  CreditCard, 
  FileCheck, 
  FileText, 
  Lock, 
  ArrowRight,
  Landmark,
  Scale
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function HowItWorksPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-600">Operating Protocol</span>
          <h1 className="mt-2 text-4xl font-extrabold text-navy-900 tracking-tight font-display sm:text-5xl">
            How KaryaSetu Works
          </h1>
          <p className="mt-3 text-base text-slate-500">
            A regulated, milestone-escrow marketplace model eliminating trust deficits between Indian clients and freelancers.
          </p>
        </div>

        {/* 1. Client Journey */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-lg bg-navy-900 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
              Client Operating Journey
            </span>
            <span className="text-sm font-medium text-slate-500">From Posting to Production Delivery</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-white border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-900 font-bold text-lg">1</div>
              <h3 className="mt-4 text-base font-bold text-navy-900">Define Scope & Milestones</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Post your project with required tech stack, estimated duration, and broken-down milestones (e.g. M1: Architecture, M2: MVP, M3: Final QA).
              </p>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-900 font-bold text-lg">2</div>
              <h3 className="mt-4 text-base font-bold text-navy-900">Vet & Form Agreement</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Compare bids from verified Indian freelancers. Accept a proposal to instantly create a digitally acknowledged bilateral contract.
              </p>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-900 font-bold text-lg">3</div>
              <h3 className="mt-4 text-base font-bold text-navy-900">Fund Milestones to Escrow</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Fund individual milestones via UPI, NetBanking, or Cards. Funds are secured in regulated nodal escrow — never paid directly to the freelancer upfront.
              </p>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-900 font-bold text-lg">4</div>
              <h3 className="mt-4 text-base font-bold text-navy-900">Approve & Release</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Inspect code/deliverables in your workspace. Request revisions if necessary or approve with 1-click to release payout and receive GST tax invoices.
              </p>
            </Card>
          </div>
        </div>

        {/* 2. Freelancer Journey */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-lg bg-saffron-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
              Freelancer Operating Journey
            </span>
            <span className="text-sm font-medium text-slate-500">From Verification to Guaranteed Bank Payout</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-white border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-50 text-saffron-800 font-bold text-lg">1</div>
              <h3 className="mt-4 text-base font-bold text-navy-900">Pass Indian KYC Check</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Submit PAN and bank account details. We execute a penny-drop verification to ensure name alignment and activate your verified badge.
              </p>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-50 text-saffron-800 font-bold text-lg">2</div>
              <h3 className="mt-4 text-base font-bold text-navy-900">Submit Strategic Proposals</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Bid on high-value Indian and global projects with custom milestone roadmaps, portfolio proofs, and transparent pricing.
              </p>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-50 text-saffron-800 font-bold text-lg">3</div>
              <h3 className="mt-4 text-base font-bold text-navy-900">Work Under Escrow Lock</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Never risk working without payment security. You receive official platform notification as soon as the client deposits milestone funds.
              </p>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-50 text-saffron-800 font-bold text-lg">4</div>
              <h3 className="mt-4 text-base font-bold text-navy-900">Automated TDS & Payout</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Upon milestone approval, receive your net earnings directly to your bank account with automatic 1% Section 194-O TDS credit into your Form 26AS.
              </p>
            </Card>
          </div>
        </div>

        {/* 3. Dispute Arbitration Mechanism */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm mb-16">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-800">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy-900">What happens if a dispute occurs?</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-4xl">
                If either party is dissatisfied with milestone delivery or scope adherence, either client or freelancer can initiate a formal dispute. A dedicated Support & Arbitration Admin examines the signed contract agreement, workspace communications, files, and staging demos to arbitrate fair outcomes (full release, partial release, or escrow refund) within 72 hours.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/projects">
            <Button variant="saffron" size="lg" className="gap-2">
              <span>Ready to start? Explore Projects & Talent</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
