import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Heart, Landmark, Award, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-600">Our Mission</span>
          <h1 className="mt-2 text-4xl font-extrabold text-navy-900 tracking-tight font-display sm:text-5xl">
            Bridging India&apos;s Talent with Sovereign Trust
          </h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            India is home to the world&apos;s most gifted software engineers, designers, Chartered Accountants, and thinkers. Yet the Indian freelance ecosystem was plagued by payment defaults, informal WhatsApp contracts, and punitive foreign currency conversion rates. We built KaryaSetu to change that forever.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <Card className="p-8 bg-white border-slate-200">
            <h3 className="text-lg font-bold text-navy-900">Contractual Dignity</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Every project is backed by an enforceable digital agreement, clear scope milestones, and objective dispute resolution.
            </p>
          </Card>

          <Card className="p-8 bg-white border-slate-200">
            <h3 className="text-lg font-bold text-navy-900">Financial Integrity</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Regulated nodal escrow accounts and immutable double-entry bookkeeping guarantee that every rupee is protected.
            </p>
          </Card>

          <Card className="p-8 bg-white border-slate-200">
            <h3 className="text-lg font-bold text-navy-900">Tax Ease for India</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Native Section 194-O TDS deductions and B2B GST tax invoices simplify tax filings for both Indian startups and freelancers.
            </p>
          </Card>
        </div>

        {/* Corporate Details */}
        <div className="max-w-3xl mx-auto rounded-xl bg-white border border-slate-200 p-8 text-center text-xs text-slate-500 space-y-2">
          <p className="font-semibold text-slate-700">KaryaSetu Technologies India Private Limited</p>
          <p>CIN: U72900KA2026PTC199401 · Registered with Registrar of Companies, Karnataka</p>
          <p>Registered Office: Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103</p>
        </div>
      </div>
    </div>
  );
}
