"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  IndianRupee,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Star,
  FileText,
  AlertCircle,
  ArrowRight,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function ProjectProposalsReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [project, setProject] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Hiring Modal State
  const [selectedProposalForHire, setSelectedProposalForHire] = useState<any | null>(null);
  const [rates, setRates] = useState({
    clientServiceFeeRate: 0.03,
    gstRate: 0.18,
  });

  useEffect(() => {
    fetch("/api/v1/platform/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.settings) {
          setRates({
            clientServiceFeeRate: Number(d.settings.clientServiceFeeRate ?? 0.03),
            gstRate: Number(d.settings.gstRate ?? 0.18),
          });
        }
      })
      .catch(() => {});
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/projects/${id}`);
      if (!res.ok) throw new Error("Failed to load project proposals");
      const data = await res.json();
      setProject(data.project);
      setProposals(data.proposals || []);
    } catch (err: any) {
      setError(err.message || "Failed to load proposals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const handleProposalAction = async (proposalId: string, action: "SHORTLIST" | "REJECT") => {
    try {
      setActionLoading(proposalId);
      setError("");
      setSuccess("");

      const res = await fetch(`/api/v1/proposals/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      setSuccess(`Proposal successfully marked as ${action.toLowerCase()}`);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to update proposal");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptAndHire = async (proposal: any) => {
    try {
      setActionLoading(proposal.id);
      setError("");
      setSuccess("");

      const res = await fetch(`/api/v1/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ACCEPT" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to hire freelancer");

      setSuccess(`🎉 Contract established! Redirecting to project workspace...`);
      setSelectedProposalForHire(null);

      setTimeout(() => {
        router.push(`/workspace/${data.contract.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to hire freelancer");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Loading received proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
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
          <span className="text-slate-900 font-medium">Review Proposals</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Client Hiring Portal</span>
              <h1 className="text-2xl font-extrabold text-navy-900 mt-1">{project?.title}</h1>
              <div className="flex items-center space-x-3 text-xs text-slate-600 mt-2">
                <span>Budget: <strong className="text-slate-900">{formatINR(project?.budgetINR)}</strong></span>
                <span>•</span>
                <span>Proposals Received: <strong className="text-slate-900">{proposals.length}</strong></span>
                <span>•</span>
                <span>Category: <strong className="text-slate-900">{project?.category}</strong></span>
              </div>
            </div>
            <Link
              href={`/projects/${project?.id}`}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 self-start sm:self-auto"
            >
              View Public Project Page
            </Link>
          </div>
        </div>

        {/* Feedback alerts */}
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

        {/* Proposals List */}
        {proposals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Proposals Received Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Your project is active on the marketplace. Verified Indian freelancers will submit technical bids shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((prop) => {
              const isExpanded = expandedId === prop.id;
              const isAccepted = prop.status === "ACCEPTED";
              const isRejected = prop.status === "REJECTED";

              return (
                <div
                  key={prop.id}
                  className={`bg-white rounded-2xl border transition-all ${
                    isAccepted
                      ? "border-emerald-300 ring-2 ring-emerald-500/20 shadow-md"
                      : "border-slate-200 shadow-sm hover:shadow"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Freelancer Info */}
                      <div className="flex items-start space-x-4">
                        <img
                          src={prop.freelancerAvatar}
                          alt={prop.freelancerName}
                          className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-bold text-navy-900">{prop.freelancerName}</h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                              KYC Verified
                            </span>
                          </div>

                          <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center text-amber-600 font-semibold">
                              <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                              4.98 (47 reviews)
                            </span>
                            <span>•</span>
                            <span>Bengaluru, India</span>
                          </div>

                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                prop.status === "ACCEPTED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : prop.status === "SHORTLISTED"
                                  ? "bg-amber-100 text-amber-800"
                                  : prop.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              Status: {prop.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bid Amount & Delivery */}
                      <div className="sm:text-right bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-xl">
                        <div className="text-xl sm:text-2xl font-black text-navy-900">
                          {formatINR(prop.bidAmountINR)}
                        </div>
                        <div className="text-xs text-slate-500 font-medium flex items-center sm:justify-end mt-0.5">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          Delivery in {prop.estimatedDurationDays} days
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {prop.milestones?.length || 1} proposed milestones
                        </div>
                      </div>
                    </div>

                    {/* Cover Letter Excerpt */}
                    <div className="mt-5 pt-5 border-t border-slate-100">
                      <div className="text-xs font-bold text-slate-800 mb-1.5 flex items-center">
                        <FileText className="w-3.5 h-3.5 mr-1 text-navy-900" />
                        Technical Proposal Pitch
                      </div>
                      <p className={`text-xs sm:text-sm text-slate-600 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                        {prop.coverLetter}
                      </p>
                      {prop.coverLetter.length > 120 && (
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : prop.id)}
                          className="mt-2 text-xs font-semibold text-navy-900 hover:underline flex items-center"
                        >
                          {isExpanded ? (
                            <>
                              Show Less <ChevronUp className="w-3.5 h-3.5 ml-1" />
                            </>
                          ) : (
                            <>
                              Read Full Proposal <ChevronDown className="w-3.5 h-3.5 ml-1" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Milestones Preview */}
                    {isExpanded && prop.milestones && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                        <div className="text-xs font-bold text-slate-800 mb-2">Proposed Milestone Schedule</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {prop.milestones.map((m: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                              <div className="font-semibold text-slate-900 truncate">{m.title}</div>
                              <div className="text-emerald-700 font-bold mt-1">{formatINR(m.amountINR)}</div>
                              <div className="text-slate-500 text-[11px] mt-0.5">{m.durationDays} days</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions Bar */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
                      {isAccepted ? (
                        <div className="flex items-center text-emerald-700 font-bold text-sm">
                          <CheckCircle2 className="w-5 h-5 mr-1.5" />
                          Hired & Contract Active
                        </div>
                      ) : isRejected ? (
                        <div className="text-xs text-slate-400 font-medium">Proposal Rejected</div>
                      ) : (
                        <>
                          {prop.status !== "SHORTLISTED" && (
                            <button
                              type="button"
                              disabled={actionLoading === prop.id}
                              onClick={() => handleProposalAction(prop.id, "SHORTLIST")}
                              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                              Shortlist
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={actionLoading === prop.id}
                            onClick={() => handleProposalAction(prop.id, "REJECT")}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading === prop.id}
                            onClick={() => setSelectedProposalForHire(prop)}
                            className="px-5 py-2.5 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 transition-colors shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                          >
                            <span>Accept & Hire</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Hire Confirmation & Contract Locking */}
        {selectedProposalForHire && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-navy-900">Confirm Hire & Create Legal Contract</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Award project to <strong>{selectedProposalForHire.freelancerName}</strong> under Indian Contract Act 1872.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProposalForHire(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Financial Review Box */}
              {(() => {
                const bid = selectedProposalForHire.bidAmountINR || 0;
                const fee = Math.round(bid * rates.clientServiceFeeRate);
                const gst = Math.round(fee * rates.gstRate);
                const total = bid + fee + gst;
                const feePercentStr = (rates.clientServiceFeeRate * 100).toFixed(rates.clientServiceFeeRate * 100 % 1 === 0 ? 0 : 1);
                const gstPercentStr = (rates.gstRate * 100).toFixed(rates.gstRate * 100 % 1 === 0 ? 0 : 1);

                return (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between font-semibold">
                      <span>Contract Value:</span>
                      <span className="text-slate-900">{formatINR(bid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Client Service Fee ({feePercentStr}%):</span>
                      <span>{formatINR(fee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST on Fee ({gstPercentStr}%):</span>
                      <span>{formatINR(gst)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-navy-900">
                      <span>Total Escrow Commitment:</span>
                      <span className="text-emerald-700">
                        {formatINR(total)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="text-xs text-slate-500 space-y-1">
                <p>• Milestone 1 will be scheduled immediately in the Project Workspace.</p>
                <p>• You will fund Milestone 1 via UPI, NetBanking or Corporate Card into RBI Nodal Escrow.</p>
                <p>• Work commences once Milestone 1 is funded.</p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedProposalForHire(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading === selectedProposalForHire.id}
                  onClick={() => handleAcceptAndHire(selectedProposalForHire)}
                  className="px-6 py-2.5 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 transition-colors shadow-sm disabled:opacity-50 flex items-center space-x-2"
                >
                  {actionLoading === selectedProposalForHire.id ? (
                    <span>Establishing Contract...</span>
                  ) : (
                    <>
                      <span>Lock Contract & Enter Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
