"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  IndianRupee,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  Calculator,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

interface MilestoneRow {
  title: string;
  amountINR: number;
  durationDays: number;
}

export default function ProposeProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [bidAmount, setBidAmount] = useState<number>(50000);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [coverLetter, setCoverLetter] = useState("");
  const [milestones, setMilestones] = useState<MilestoneRow[]>([
    { title: "Milestone 1: Architectural Foundation & Database Design", amountINR: 20000, durationDays: 10 },
    { title: "Milestone 2: Feature Development & Third-Party Integration", amountINR: 20000, durationDays: 12 },
    { title: "Milestone 3: End-to-End Testing & Production Deployment", amountINR: 10000, durationDays: 8 },
  ]);

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/projects/${id}`);
        if (!res.ok) throw new Error("Project not found");
        const data = await res.json();
        setProject(data.project);
        if (data.project.budgetINR) {
          setBidAmount(data.project.budgetINR);
          // Distribute equally across initial 3 milestones
          const part = Math.round(data.project.budgetINR / 3);
          setMilestones([
            { title: "Milestone 1: Architecture & Foundation", amountINR: part, durationDays: 10 },
            { title: "Milestone 2: Core Feature Implementation", amountINR: part, durationDays: 12 },
            { title: "Milestone 3: QA, Deployment & Handover", amountINR: data.project.budgetINR - part * 2, durationDays: 8 },
          ]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load project details");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProject();
    }
  }, [id]);

  const [rates, setRates] = useState({
    freelancerCommissionRate: 0.10,
    gstRate: 0.18,
    tdsRate: 0.01,
  });

  useEffect(() => {
    fetch("/api/v1/platform/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.settings) {
          setRates({
            freelancerCommissionRate: Number(d.settings.freelancerCommissionRate ?? 0.10),
            gstRate: Number(d.settings.gstRate ?? 0.18),
            tdsRate: Number(d.settings.tdsRate ?? 0.01),
          });
        }
      })
      .catch(() => {});
  }, []);

  const milestoneSum = milestones.reduce((sum, m) => sum + (Number(m.amountINR) || 0), 0);

  // Financial calculations using live server rates
  const platformFee = Math.round(bidAmount * rates.freelancerCommissionRate);
  const gstOnFee = Math.round(platformFee * rates.gstRate);
  const tds194O = Math.round(bidAmount * rates.tdsRate);
  const netTakeHome = bidAmount - platformFee - gstOnFee - tds194O;

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Milestone ${milestones.length + 1}: Additional Deliverable`,
        amountINR: 5000,
        durationDays: 5,
      },
    ]);
  };

  const removeMilestone = (idx: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const updateMilestone = (idx: number, field: keyof MilestoneRow, value: any) => {
    const updated = [...milestones];
    updated[idx] = { ...updated[idx], [field]: value };
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (bidAmount < 500) {
      setError("Minimum valid bid is ₹500.");
      return;
    }

    if (milestoneSum !== bidAmount) {
      setError(
        `Total milestone sum (₹${milestoneSum.toLocaleString("en-IN")}) must match total bid amount (₹${bidAmount.toLocaleString("en-IN")}).`
      );
      return;
    }

    if (!coverLetter.trim() || coverLetter.length < 30) {
      setError("Cover letter must be at least 30 characters detailing your relevant expertise.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/v1/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          bidAmountINR: bidAmount,
          estimatedDurationDays: durationDays,
          coverLetter,
          milestones,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit proposal");
      }

      setSuccess("Proposal submitted successfully to client!");
      setTimeout(() => {
        router.push(`/projects/${project.id}`);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
          <Link href="/projects" className="hover:text-navy-900 transition-colors">
            Projects
          </Link>
          <span>/</span>
          <Link href={`/projects/${project?.id}`} className="hover:text-navy-900 transition-colors truncate max-w-xs">
            {project?.title}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Submit Proposal</span>
        </div>

        {/* Project Header Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitting Proposal For</span>
              <h1 className="text-xl sm:text-2xl font-bold text-navy-900 mt-0.5">{project?.title}</h1>
              <div className="flex items-center space-x-3 text-xs text-slate-600 mt-2">
                <span>Category: <strong className="text-slate-800">{project?.category}</strong></span>
                <span>•</span>
                <span>Client Budget: <strong className="text-slate-800">{formatINR(project?.budgetINR)}</strong></span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
              Direct Nodal Escrow Settlement
            </div>
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start">
            <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Financial Proposal & Terms */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-navy-900 border-b border-slate-100 pb-3 flex items-center">
              <span className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center mr-2">
                1
              </span>
              Your Bid & Indian Tax Deductions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Proposed Total Bid (₹ INR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={500}
                    step={500}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900 text-base font-bold"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">This is the gross amount the client will fund.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Estimated Delivery Time (Days) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900 text-base font-semibold"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Total calendar days to complete all deliverables.</p>
              </div>
            </div>

            {/* Indian Earnings Calculator Card */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center text-navy-900 font-bold text-sm mb-1">
                <Calculator className="w-4 h-4 mr-1.5 text-navy-900" />
                Server-Side Payout Breakdown
              </div>
              <div className="flex justify-between">
                <span>Gross Project Bid:</span>
                <span className="font-semibold text-slate-900">₹{bidAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Platform Commission ({(rates.freelancerCommissionRate * 100).toFixed(rates.freelancerCommissionRate * 100 % 1 === 0 ? 0 : 1)}%):</span>
                <span>- ₹{platformFee.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>GST on Commission ({(rates.gstRate * 100).toFixed(rates.gstRate * 100 % 1 === 0 ? 0 : 1)}%):</span>
                <span>- ₹{gstOnFee.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>Section 194-O TDS ({(rates.tdsRate * 100).toFixed(rates.tdsRate * 100 % 1 === 0 ? 0 : 1)}% to PAN):</span>
                <span>- ₹{tds194O.toLocaleString("en-IN")}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-emerald-800">
                <span>Net Estimated Bank Payout:</span>
                <span className="text-base">₹{netTakeHome.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 leading-normal">
                * TDS of 1% is deposited with the Income Tax Department against your PAN. Quarterly Form 16A certificates will be automatically provided.
              </p>
            </div>
          </div>

          {/* Section 2: Milestone Schedule */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-navy-900 flex items-center">
                <span className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center mr-2">
                  2
                </span>
                Proposed Milestone Breakdown
              </h2>
              <button
                type="button"
                onClick={addMilestone}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-navy-50 text-navy-900 hover:bg-navy-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Milestone
              </button>
            </div>

            <div className="space-y-3">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    placeholder="Milestone deliverable description"
                    value={m.title}
                    onChange={(e) => updateMilestone(idx, "title", e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-navy-900"
                    required
                  />
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative w-32">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={500}
                        step={500}
                        value={m.amountINR}
                        onChange={(e) => updateMilestone(idx, "amountINR", Number(e.target.value))}
                        className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-navy-900"
                        required
                      />
                    </div>
                    <div className="relative w-24">
                      <input
                        type="number"
                        min={1}
                        placeholder="Days"
                        value={m.durationDays}
                        onChange={(e) => updateMilestone(idx, "durationDays", Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-navy-900"
                        required
                      />
                    </div>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs font-semibold px-2">
              <span className={milestoneSum === bidAmount ? "text-emerald-700" : "text-amber-600"}>
                Sum: ₹{milestoneSum.toLocaleString("en-IN")} / ₹{bidAmount.toLocaleString("en-IN")}
              </span>
              {milestoneSum !== bidAmount && (
                <span className="text-amber-600">Difference: ₹{Math.abs(bidAmount - milestoneSum).toLocaleString("en-IN")}</span>
              )}
            </div>
          </div>

          {/* Section 3: Technical Pitch & Cover Letter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-navy-900 border-b border-slate-100 pb-3 flex items-center">
              <span className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center mr-2">
                3
              </span>
              Technical Cover Letter & Methodology
            </h2>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Pitch your solution & previous relevant experience <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Detail how you will execute this project, specific tools or frameworks you will leverage, past Indian client case studies, and your communication cadence..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900 text-sm leading-relaxed"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Minimum 30 characters. Highlighting specific architecture builds trust.</p>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              href={`/projects/${project?.id}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 text-center transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-navy-900 text-white text-sm font-bold hover:bg-navy-800 transition-colors shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Submitting Proposal...</span>
              ) : (
                <>
                  <span>Submit Proposal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
