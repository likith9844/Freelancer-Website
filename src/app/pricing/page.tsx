"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Calculator, 
  CheckCircle2, 
  HelpCircle, 
  IndianRupee, 
  ArrowRight,
  ShieldCheck,
  Percent,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { formatINR } from "@/lib/utils";

interface PlatformSettings {
  clientServiceFeeRate: number;
  freelancerCommissionRate: number;
  gstRate: number;
  gatewayHandlingFeeRate: number;
  tdsRate: number;
  minWithdrawalINR: number;
}

export default function PricingPage() {
  const [projectValue, setProjectValue] = React.useState<number>(50000);
  const [settings, setSettings] = React.useState<PlatformSettings>({
    clientServiceFeeRate: 0.03,
    freelancerCommissionRate: 0.10,
    gstRate: 0.18,
    gatewayHandlingFeeRate: 0.02,
    tdsRate: 0.01,
    minWithdrawalINR: 500,
  });
  const [loading, setLoading] = React.useState(true);

  // Fetch live marketplace settings from public endpoint
  React.useEffect(() => {
    fetch("/api/v1/platform/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings({
            clientServiceFeeRate: Number(data.settings.clientServiceFeeRate ?? 0.03),
            freelancerCommissionRate: Number(data.settings.freelancerCommissionRate ?? 0.10),
            gstRate: Number(data.settings.gstRate ?? 0.18),
            gatewayHandlingFeeRate: Number(data.settings.gatewayHandlingFeeRate ?? 0.02),
            tdsRate: Number(data.settings.tdsRate ?? 0.01),
            minWithdrawalINR: Number(data.settings.minWithdrawalINR ?? 500),
          });
        }
      })
      .catch((e) => console.error("Error loading platform settings:", e))
      .finally(() => setLoading(false));
  }, []);

  // Format percentage helper (e.g. 0 -> "0%", 0.035 -> "3.5%", 0.1 -> "10%")
  const formatPercent = (rate: number) => {
    const p = rate * 100;
    return p % 1 === 0 ? `${p.toFixed(0)}%` : `${p.toFixed(1)}%`;
  };

  const clientPercentStr = formatPercent(settings.clientServiceFeeRate);
  const freelancerPercentStr = formatPercent(settings.freelancerCommissionRate);
  const gstPercentStr = formatPercent(settings.gstRate);
  const pgPercentStr = formatPercent(settings.gatewayHandlingFeeRate);
  const tdsPercentStr = formatPercent(settings.tdsRate);

  // Dynamic fee calculation engine matching server-side rules
  const clientServiceFee = Math.round(projectValue * settings.clientServiceFeeRate);
  const gstOnClientFee = Math.round(clientServiceFee * settings.gstRate);
  const pgFee = Math.round((projectValue + clientServiceFee + gstOnClientFee) * settings.gatewayHandlingFeeRate);
  const totalClientPayable = projectValue + clientServiceFee + gstOnClientFee + pgFee;

  const freelancerCommission = Math.round(projectValue * settings.freelancerCommissionRate);
  const gstOnCommission = Math.round(freelancerCommission * settings.gstRate);
  const tdsDeduction = Math.round(projectValue * settings.tdsRate);
  const freelancerNetPayout = projectValue - freelancerCommission - gstOnCommission - tdsDeduction;

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-saffron-100 text-saffron-800">
            <Sparkles className="h-3.5 w-3.5 text-saffron-600" />
            Live Marketplace Rates
          </span>
          <h1 className="mt-3 text-4xl font-extrabold text-navy-900 tracking-tight font-display sm:text-5xl">
            Transparent Indian Pricing
          </h1>
          <p className="mt-3 text-base text-slate-500">
            No expensive USD forex conversion losses. No ambiguous deductions. Fully compliant with GST and Indian Income Tax law.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Client Side Pricing */}
          <Card className="p-8 bg-white border-slate-200 shadow-sm relative overflow-hidden">
            {settings.clientServiceFeeRate === 0 && (
              <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                0% Fee Active
              </div>
            )}
            <div className="inline-block rounded-lg bg-navy-100 text-navy-900 px-3 py-1 text-xs font-bold uppercase">
              For Clients
            </div>
            <h2 className="mt-4 text-3xl font-bold text-navy-900">
              {clientPercentStr} Service Fee
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {settings.clientServiceFeeRate === 0 
                ? "Zero platform charges for clients. Free escrow security and dedicated project support."
                : "Covers milestone escrow security, contract arbitration, and 24/7 dedicated support."}
            </p>

            <ul className="mt-6 space-y-3 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Zero charge to post projects or review proposals</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Automated B2B GST tax invoice with your GSTIN for 100% ITC claim</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Funds held safely in RBI-regulated nodal escrow until your approval</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Free milestone dispute resolution and contract protection</span>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link href="/projects/new">
                <Button className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold">
                  Post a Project for Free
                </Button>
              </Link>
            </div>
          </Card>

          {/* Freelancer Side Pricing */}
          <Card className="p-8 bg-white border-slate-200 shadow-sm relative overflow-hidden">
            {settings.freelancerCommissionRate === 0 && (
              <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                0% Commission Active
              </div>
            )}
            <div className="inline-block rounded-lg bg-saffron-100 text-saffron-900 px-3 py-1 text-xs font-bold uppercase">
              For Freelancers
            </div>
            <h2 className="mt-4 text-3xl font-bold text-navy-900">
              {freelancerPercentStr} Platform Fee
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {settings.freelancerCommissionRate === 0
                ? "Zero platform commission! You keep 100% of your earnings upon milestone approval."
                : "Only charged when your work is approved and payment is released. No upfront fee."}
            </p>

            <ul className="mt-6 space-y-3 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Unlimited proposals and profile portfolio listings</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Automatic {tdsPercentStr} Section 194-O TDS filing reflecting in your Form 26AS</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Direct payout to verified Indian bank accounts via Razorpay Route &amp; IMPS</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Guaranteed payment assurance on funded milestones</span>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link href="/register?role=FREELANCER">
                <Button className="w-full bg-saffron-600 hover:bg-saffron-700 text-white font-semibold">
                  Join as a Freelancer
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Interactive Fee Calculator */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-100 text-saffron-800">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy-900">Interactive Milestone Fee Calculator</h3>
                <p className="text-xs text-slate-500">Calculates with live marketplace rates in real time.</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-400 block">Min Withdrawal: ₹{settings.minWithdrawalINR}</span>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-2">
              Milestone Scope Value: <span className="text-lg font-bold text-navy-900 font-inr">{formatINR(projectValue)}</span>
            </label>
            <input
              type="range"
              min="5000"
              max="500000"
              step="5000"
              value={projectValue}
              onChange={(e) => setProjectValue(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-saffron-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>₹5,000</span>
              <span>₹2,50,000</span>
              <span>₹5,00,000</span>
            </div>
          </div>

          {/* Breakdown Comparison Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-8">
            {/* Client Breakdown */}
            <div className="rounded-xl bg-slate-50 p-5">
              <h4 className="text-sm font-bold text-navy-900 border-b border-slate-200 pb-2">Client Checkout Breakdown</h4>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Milestone Consideration:</span>
                  <span className="font-semibold text-slate-900 font-inr">{formatINR(projectValue)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Service Fee ({clientPercentStr}):</span>
                  <span className="font-semibold text-slate-900 font-inr">{formatINR(clientServiceFee)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST on Service Fee ({gstPercentStr}):</span>
                  <span className="font-semibold text-slate-900 font-inr">{formatINR(gstOnClientFee)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Payment Gateway Handling ({pgPercentStr}):</span>
                  <span className="font-semibold text-slate-900 font-inr">{formatINR(pgFee)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-navy-900 text-sm">
                  <span>Total Payable:</span>
                  <span className="text-emerald-700 font-inr">{formatINR(totalClientPayable)}</span>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-400 italic">
                * Eligible for full 100% B2B Input Tax Credit (ITC) with valid GSTIN.
              </p>
            </div>

            {/* Freelancer Breakdown */}
            <div className="rounded-xl bg-slate-50 p-5">
              <h4 className="text-sm font-bold text-navy-900 border-b border-slate-200 pb-2">Freelancer Settlement Payout</h4>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Milestone Consideration:</span>
                  <span className="font-semibold text-slate-900 font-inr">{formatINR(projectValue)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Commission ({freelancerPercentStr}):</span>
                  <span className="font-semibold text-rose-600 font-inr">-{formatINR(freelancerCommission)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST on Commission ({gstPercentStr}):</span>
                  <span className="font-semibold text-rose-600 font-inr">-{formatINR(gstOnCommission)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Section 194-O TDS ({tdsPercentStr} to PAN):</span>
                  <span className="font-semibold text-slate-800 font-inr">-{formatINR(tdsDeduction)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-navy-900 text-sm">
                  <span>Net Withdrawable Payout:</span>
                  <span className="text-saffron-700 font-inr">{formatINR(freelancerNetPayout)}</span>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-400 italic">
                * TDS deposited directly to your PAN and verified quarterly in Form 26AS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
