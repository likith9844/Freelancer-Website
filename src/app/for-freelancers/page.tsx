import * as React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  IndianRupee, 
  CheckCircle2, 
  Award, 
  FileText, 
  ArrowRight,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function ForFreelancersPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">For Indian Professionals</span>
          <h1 className="mt-2 text-4xl font-extrabold text-navy-900 tracking-tight font-display sm:text-5xl">
            Build Your Independent Career on Guaranteed Payments
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Stop chasing unpaid invoices or losing 15-20% on international USD currency conversion fees. KaryaSetu guarantees your milestone payment before you start writing code or designing.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact?role=freelancer">
              <Button variant="saffron" size="lg" className="font-semibold gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Join as a Verified Freelancer</span>
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="outline" size="lg">
                Explore Open Projects
              </Button>
            </Link>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 bg-white border-slate-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy-900">Zero Payment Ghosting</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Every project operates strictly on funded milestones. The platform formally notifies you as soon as client funds are locked in nodal escrow, so you never work for free.
            </p>
          </Card>

          <Card className="p-8 bg-white border-slate-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-saffron-50 text-saffron-800">
              <IndianRupee className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy-900">Direct INR Bank Payouts</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Receive your earnings directly into your Indian bank account via IMPS or NEFT. No PayPal delays, wire fees, or exorbitant currency spread charges.
            </p>
          </Card>

          <Card className="p-8 bg-white border-slate-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-900">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy-900">Automated Section 194-O TDS</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              We deduct 1% TDS on your gross marketplace earnings and remit it directly to the Income Tax Department with quarterly Form 16A issuance for effortless ITR filing.
            </p>
          </Card>
        </div>

        {/* 4-Step Onboarding Guide */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
          <h2 className="text-2xl font-bold text-navy-900">How to Become a Verified Freelancer</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-xs font-bold text-saffron-600">STEP 1</div>
              <h4 className="mt-1 text-sm font-bold text-navy-900">Register Account</h4>
              <p className="mt-1 text-xs text-slate-500">Sign up with your professional email, Indian phone number, and location.</p>
            </div>
            <div>
              <div className="text-xs font-bold text-saffron-600">STEP 2</div>
              <h4 className="mt-1 text-sm font-bold text-navy-900">Complete Indian KYC</h4>
              <p className="mt-1 text-xs text-slate-500">Submit your PAN and bank details for penny-drop name matching validation.</p>
            </div>
            <div>
              <div className="text-xs font-bold text-saffron-600">STEP 3</div>
              <h4 className="mt-1 text-sm font-bold text-navy-900">Publish Portfolio</h4>
              <p className="mt-1 text-xs text-slate-500">Showcase past case studies, GitHub links, Figma design systems, and testimonials.</p>
            </div>
            <div>
              <div className="text-xs font-bold text-saffron-600">STEP 4</div>
              <h4 className="mt-1 text-sm font-bold text-navy-900">Bid & Win Projects</h4>
              <p className="mt-1 text-xs text-slate-500">Submit targeted milestone proposals and work with top Indian founders.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
