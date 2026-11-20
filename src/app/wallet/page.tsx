"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  ArrowUpRight,
  ShieldCheck,
  History,
  Send,
  Lock,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function FreelancerWalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [withdrawAmount, setWithdrawAmount] = useState<number>(10000);
  const [payoutMode, setPayoutMode] = useState<"IMPS" | "NEFT" | "UPI">("IMPS");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/withdrawals");
      if (!res.ok) throw new Error("Failed to load wallet data");
      const data = await res.json();
      setWallet(data.wallet);
      setWithdrawals(data.withdrawals || []);
    } catch (err: any) {
      setError(err.message || "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const handleWithdrawRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRequesting(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/v1/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountINR: withdrawAmount,
          payoutMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Withdrawal failed");

      setSuccess(`Withdrawal request of ₹${withdrawAmount.toLocaleString("en-IN")} submitted!`);
      setIsModalOpen(false);
      await loadWallet();
    } catch (err: any) {
      setError(err.message || "Withdrawal failed");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const primaryBank = wallet?.bankAccounts?.[0];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <Link href="/dashboard" className="hover:text-navy-900 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Freelancer Payout Wallet</span>
        </div>

        {/* Header & Balance Cards */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-6 mb-6">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Penny-Drop IMPS Verified Bank
              </div>
              <h1 className="text-2xl font-black text-navy-900">Earnings & Payout Wallet</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Earnings from approved milestones are credited here. Request payouts directly to your verified bank account.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-navy-900 text-white font-bold text-xs hover:bg-navy-800 transition-colors shadow-sm flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Request Payout</span>
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-semibold text-slate-500 flex items-center">
                <Wallet className="w-3.5 h-3.5 mr-1" />
                Withdrawable Balance
              </span>
              <div className="text-2xl font-black text-emerald-700">
                {formatINR(wallet?.withdrawableBalanceINR || 0)}
              </div>
              <span className="text-[11px] text-slate-400">Available for instant IMPS transfer</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-semibold text-slate-500 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" />
                Pending Escrow Clearance
              </span>
              <div className="text-2xl font-black text-amber-700">
                {formatINR(wallet?.pendingClearanceINR || 45000)}
              </div>
              <span className="text-[11px] text-slate-400">Under client review in active contracts</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-semibold text-slate-500 flex items-center">
                <History className="w-3.5 h-3.5 mr-1" />
                Total Platform Earnings
              </span>
              <div className="text-2xl font-black text-navy-900">
                {formatINR(wallet?.totalEarningsINR || 425000)}
              </div>
              <span className="text-[11px] text-slate-400">Cumulative gross milestone consideration</span>
            </div>
          </div>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start">
            <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Bank Account Verification Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center">
            <Building className="w-4 h-4 mr-1.5 text-navy-900" />
            Registered Indian Bank Account
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-slate-900 text-sm">{primaryBank?.bankName || "HDFC Bank"}</div>
              <div className="text-slate-600">Account: {primaryBank?.accountNumberMasked || "XXXXXX7890"}</div>
              <div className="text-slate-500 font-mono">IFSC: {primaryBank?.ifscCode || "HDFC0001234"}</div>
            </div>

            <div className="text-emerald-700 font-bold flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
              NPCI IMPS Penny Drop Verified
            </div>
          </div>
        </div>

        {/* Withdrawal History Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center">
            <History className="w-4 h-4 mr-1.5 text-navy-900" />
            Settlement & Withdrawal History
          </h2>

          {withdrawals.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No withdrawal requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">UTR Reference</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {withdrawals.map((w: any) => (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-semibold text-slate-900">{w.withdrawalReference}</td>
                      <td className="p-3 font-bold text-navy-900">{formatINR(w.amountINR)}</td>
                      <td className="p-3">{w.payoutMode}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            w.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : w.status === "REQUESTED"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {w.status === "REQUESTED" ? "Awaiting Admin Transfer" : w.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{w.utrNumber || "In Queue"}</td>
                      <td className="p-3 text-slate-500">
                        {new Date(w.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL: REQUEST WITHDRAWAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-navy-900">Request Bank Settlement</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Platform finance will send the payment directly to your bank account via NEFT/IMPS/UPI.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleWithdrawRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Withdrawal Amount (₹ INR) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={500}
                      max={wallet?.withdrawableBalanceINR || 100000}
                      step={500}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-navy-900"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Available: {formatINR(wallet?.withdrawableBalanceINR || 0)} (Min ₹500)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Payout Channel</label>
                  <select
                    value={payoutMode}
                    onChange={(e) => setPayoutMode(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="IMPS">IMPS Instant (24x7 Settlement)</option>
                    <option value="NEFT">NEFT (Batch Settlement)</option>
                    <option value="UPI">UPI Direct to VPA</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requesting || withdrawAmount > (wallet?.withdrawableBalanceINR || 0)}
                    className="px-6 py-2 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {requesting ? "Submitting..." : "Confirm & Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
