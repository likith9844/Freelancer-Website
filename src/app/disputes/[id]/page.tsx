"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  User,
  Gavel,
  History,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [dispute, setDispute] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [milestone, setMilestone] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ruling, setRuling] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Admin Arbitration state
  const [resolutionType, setResolutionType] = useState<"FULL_RELEASE" | "FULL_REFUND" | "SPLIT">("FULL_RELEASE");
  const [flAward, setFlAward] = useState<number>(20000);
  const [clAward, setClAward] = useState<number>(20000);
  const [arbitrationNotes, setArbitrationNotes] = useState("");

  const loadDispute = async () => {
    try {
      setLoading(true);

      const authRes = await fetch("/api/v1/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        setCurrentUser(authData.user);
      }

      const res = await fetch(`/api/v1/disputes/${id}`);
      if (!res.ok) throw new Error("Dispute not found");
      const data = await res.json();
      setDispute(data.dispute);
      setContract(data.contract);
      setMilestone(data.milestone);
      if (data.dispute.disputedAmountINR) {
        const half = Math.round(data.dispute.disputedAmountINR / 2);
        setFlAward(half);
        setClAward(data.dispute.disputedAmountINR - half);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dispute");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadDispute();
    }
  }, [id]);

  const handleArbitrate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRuling(true);
      setError("");
      setSuccess("");

      const res = await fetch(`/api/v1/disputes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolutionType,
          freelancerAwardedINR: resolutionType === "SPLIT" ? flAward : undefined,
          clientAwardedINR: resolutionType === "SPLIT" ? clAward : undefined,
          arbitrationNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Arbitration ruling failed");

      setSuccess(`Dispute ruled as ${resolutionType}. Escrow funds disbursed.`);
      await loadDispute();
    } catch (err: any) {
      setError(err.message || "Ruling failed");
    } finally {
      setRuling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin =
    currentUser?.role === "SUPER_ADMIN" ||
    currentUser?.role === "SUPPORT_ADMIN" ||
    currentUser?.role === "ADMIN";

  const isResolved = dispute?.status === "RESOLVED";

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <Link href={contract ? `/workspace/${contract.id}` : "/dashboard"} className="hover:text-navy-900 transition-colors">
            ← Back to Project Workspace
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Dispute Case Review</span>
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

        {/* Case Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-navy-50 text-navy-900 border border-navy-200">
                  {dispute?.disputeNumber}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isResolved
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  Status: {dispute?.status}
                </span>
              </div>
              <h1 className="text-2xl font-black text-navy-900 mt-2">
                Arbitration Case: {milestone?.title || "Milestone Deliverable"}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Filed under the Arbitration and Conciliation Act 1996 | Disputed Consideration:{" "}
                <strong className="text-slate-900">{formatINR(dispute?.disputedAmountINR || 40000)}</strong>
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold flex items-center">
              <Scale className="w-4 h-4 mr-1.5 text-navy-900" />
              RBI Escrow Locked
            </div>
          </div>

          {/* Statement Box */}
          <div className="space-y-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500">Claimant Statement & Grounds</span>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-line font-mono">
              {dispute?.statement}
            </div>
            <div className="text-slate-500 text-[11px]">Reason Code: <strong>{dispute?.reasonCode}</strong></div>
          </div>

          {/* Resolution Result if Resolved */}
          {isResolved && (
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
              <div className="text-emerald-900 font-bold text-sm flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                Arbitration Closed: Verdict {dispute?.resolutionType}
              </div>
              <p className="text-emerald-800 leading-relaxed">
                Arbitrator Ruling Notes: &ldquo;{dispute?.arbitrationNotes}&rdquo;
              </p>
              <div className="flex space-x-6 text-emerald-900 pt-1 font-semibold">
                <span>Freelancer Award: {formatINR(dispute?.freelancerAwardedINR || 0)}</span>
                <span>Client Refund: {formatINR(dispute?.clientAwardedINR || 0)}</span>
              </div>
            </div>
          )}

          {/* Admin Arbitration Form */}
          {isAdmin && !isResolved && (
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center">
                <Gavel className="w-4 h-4 mr-1.5 text-navy-900" />
                Administrative Arbitration Console (Support Admin)
              </h2>

              <form onSubmit={handleArbitrate} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Arbitration Ruling Verdict</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setResolutionType("FULL_RELEASE")}
                      className={`p-3 rounded-xl border font-bold text-center transition-all ${
                        resolutionType === "FULL_RELEASE"
                          ? "bg-navy-900 text-white border-navy-900"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      Full Release (Freelancer 100%)
                    </button>

                    <button
                      type="button"
                      onClick={() => setResolutionType("FULL_REFUND")}
                      className={`p-3 rounded-xl border font-bold text-center transition-all ${
                        resolutionType === "FULL_REFUND"
                          ? "bg-navy-900 text-white border-navy-900"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      Full Refund (Client 100%)
                    </button>

                    <button
                      type="button"
                      onClick={() => setResolutionType("SPLIT")}
                      className={`p-3 rounded-xl border font-bold text-center transition-all ${
                        resolutionType === "SPLIT"
                          ? "bg-navy-900 text-white border-navy-900"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      Arbitrated Split (50/50 or Custom)
                    </button>
                  </div>
                </div>

                {resolutionType === "SPLIT" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">Freelancer Award (₹ INR)</label>
                      <input
                        type="number"
                        value={flAward}
                        onChange={(e) => setFlAward(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">Client Award (₹ INR)</label>
                      <input
                        type="number"
                        value={clAward}
                        onChange={(e) => setClAward(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Arbitration Reason & Ruling Notes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={arbitrationNotes}
                    onChange={(e) => setArbitrationNotes(e.target.value)}
                    placeholder="Document the legal rationale, milestone deliverable inspection findings, and escrow release instructions..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={ruling}
                    className="px-6 py-2.5 rounded-xl bg-navy-900 text-white font-bold text-xs hover:bg-navy-800 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {ruling ? "Disbursing Verdict..." : "Execute Binding Arbitration Ruling"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
