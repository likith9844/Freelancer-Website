"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Briefcase,
  IndianRupee,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  MessageSquare,
  ListTodo,
  History,
  Lock,
  ExternalLink,
  ChevronRight,
  UploadCloud,
  FileCode,
  Sparkles,
  Scale,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<"milestones" | "messages" | "timeline" | "disputes">("milestones");
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals state
  const [submitModalMilestone, setSubmitModalMilestone] = useState<any | null>(null);
  const [freelancerNotes, setFreelancerNotes] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [fileUrlInput, setFileUrlInput] = useState("");

  const [reviewModalMilestone, setReviewModalMilestone] = useState<any | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState("");

  // Message chat state
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);

  const loadWorkspace = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/workspace/${id}`);
      if (!res.ok) throw new Error("Workspace not found");
      const data = await res.json();
      setWorkspace(data.workspace);
    } catch (err: any) {
      setError(err.message || "Failed to load workspace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadWorkspace();
    }
  }, [id]);

  // Handle Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatSending) return;

    try {
      setChatSending(true);
      const res = await fetch(`/api/v1/workspace/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: chatInput.trim() }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      setChatInput("");
      await loadWorkspace();
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    } finally {
      setChatSending(false);
    }
  };

  // Milestone Actions: Fund
  const handleFundMilestone = async (milestoneId: string) => {
    try {
      setError("");
      setSuccess("");
      const res = await fetch(`/api/v1/workspace/${id}/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "FUND" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fund milestone");

      setSuccess("🔒 Milestone funded into RBI Nodal Escrow! Freelancer notified.");
      await loadWorkspace();
    } catch (err: any) {
      setError(err.message || "Funding failed");
    }
  };

  // Milestone Actions: Submit Deliverables
  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitModalMilestone) return;

    try {
      setError("");
      setSuccess("");
      const res = await fetch(`/api/v1/workspace/${id}/milestones/${submitModalMilestone.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freelancerNotes,
          demoUrl: demoUrl || undefined,
          fileUrls: fileUrlInput ? [fileUrlInput] : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit deliverable");

      setSuccess("Deliverable submitted successfully for client verification!");
      setSubmitModalMilestone(null);
      setFreelancerNotes("");
      setDemoUrl("");
      setFileUrlInput("");
      await loadWorkspace();
    } catch (err: any) {
      setError(err.message || "Submission failed");
    }
  };

  // Milestone Actions: Review (Approve or Request Revision)
  const handleReviewAction = async (action: "APPROVE" | "REQUEST_REVISION") => {
    if (!reviewModalMilestone) return;

    try {
      setError("");
      setSuccess("");
      const res = await fetch(`/api/v1/workspace/${id}/milestones/${reviewModalMilestone.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          feedback: action === "REQUEST_REVISION" ? revisionFeedback : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review action failed");

      if (action === "APPROVE") {
        setSuccess("✅ Milestone approved! Escrow payment released to freelancer.");
      } else {
        setSuccess("Revision requested. Freelancer will update deliverables.");
      }

      setReviewModalMilestone(null);
      setRevisionFeedback("");
      await loadWorkspace();
    } catch (err: any) {
      setError(err.message || "Review action failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Initializing project workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-2xl border border-slate-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Workspace Access Denied</h2>
          <p className="text-sm text-slate-600 mb-6">{error || "You are not a member of this workspace."}</p>
          <Link href="/dashboard" className="inline-flex items-center px-4 py-2 rounded-xl bg-navy-900 text-white text-sm font-semibold">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { contract, project, client, freelancer, messages, timelineEvents, currentUserRole } = workspace;
  const isClient = currentUserRole === "CLIENT" || currentUserRole === "ADMIN";
  const isFreelancer = currentUserRole === "FREELANCER" || currentUserRole === "ADMIN";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Workspace Top Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-navy-50 text-navy-900 border border-navy-200">
                  {contract.contractNumber}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    contract.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}
                >
                  Contract: {contract.status}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600">Total: <strong className="text-slate-900">{formatINR(contract.totalValueINR)}</strong></span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight leading-snug">
                {project?.title}
              </h1>
            </div>

            {/* Parties Avatars & Agreement Link */}
            <div className="flex items-center space-x-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="text-right text-xs">
                  <div className="font-bold text-slate-900">{client.companyName || client.fullName}</div>
                  <div className="text-slate-500">Client</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                  {client.fullName.charAt(0)}
                </div>
              </div>

              <div className="text-slate-300 font-light">↔</div>

              <div className="flex items-center space-x-3">
                <img
                  src={freelancer.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"}
                  alt={freelancer.fullName}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">{freelancer.fullName}</div>
                  <div className="text-slate-500">Freelancer</div>
                </div>
              </div>

              <Link
                href={`/contract/${contract.id}`}
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 mr-1 text-navy-900" />
                Legal Agreement
              </Link>
            </div>
          </div>
        </div>

        {/* Global Feedback Alert */}
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

        {/* Workspace Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-3 space-x-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("milestones")}
            className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === "milestones"
                ? "border-navy-900 text-navy-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Milestones & Escrow</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("messages")}
            className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === "messages"
                ? "border-navy-900 text-navy-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Discussion ({messages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === "timeline"
                ? "border-navy-900 text-navy-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("disputes")}
            className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === "disputes"
                ? "border-navy-900 text-navy-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Dispute Protection</span>
          </button>
        </div>

        {/* TAB 1: MILESTONES & ESCROW */}
        {activeTab === "milestones" && (
          <div className="space-y-4">
            <div className="bg-white rounded-b-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-navy-900">Project Milestones Schedule</h2>
                  <p className="text-xs text-slate-500">
                    Each deliverable is funded into RBI Nodal Escrow and released upon client sign-off.
                  </p>
                </div>
                <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  RBI Nodal Escrow Protected
                </div>
              </div>

              <div className="space-y-4">
                {contract.milestones.map((m: any, idx: number) => {
                  const isReleased = m.status === "RELEASED";
                  const isSubmitted = m.status === "SUBMITTED";
                  const isFunded = m.status === "FUNDED" || m.status === "IN_PROGRESS";
                  const isAwaitingFunding = m.status === "AWAITING_FUNDING";
                  const isRevision = m.status === "REVISION_REQUESTED";

                  return (
                    <div
                      key={m.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isReleased
                          ? "bg-slate-50/70 border-slate-200"
                          : isSubmitted
                          ? "bg-amber-50/30 border-amber-200"
                          : isFunded
                          ? "bg-emerald-50/30 border-emerald-200 shadow-sm"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start space-x-3">
                          <span
                            className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isReleased
                                ? "bg-emerald-600 text-white"
                                : isFunded
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {isReleased ? "✓" : idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-bold text-navy-900">{m.title}</h3>
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  isReleased
                                    ? "bg-emerald-100 text-emerald-800"
                                    : isFunded
                                    ? "bg-blue-100 text-blue-800"
                                    : isSubmitted
                                    ? "bg-amber-100 text-amber-800"
                                    : isRevision
                                    ? "bg-red-100 text-red-800"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {m.status.replace("_", " ")}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{m.description}</p>
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center justify-between sm:justify-end space-x-4">
                          <div className="text-right">
                            <div className="text-base font-black text-navy-900">{formatINR(m.amountINR)}</div>
                            <div className="text-[11px] text-slate-400">Escrow Value</div>
                          </div>

                          {/* Role-Specific Action Buttons */}
                          <div className="flex items-center space-x-2">
                            {/* Client Funding Action */}
                            {isClient && isAwaitingFunding && (
                              <button
                                type="button"
                                onClick={() => handleFundMilestone(m.id)}
                                className="px-4 py-2 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 transition-colors shadow-sm flex items-center space-x-1"
                              >
                                <Lock className="w-3.5 h-3.5 mr-1" />
                                <span>Fund Milestone</span>
                              </button>
                            )}

                            {/* Freelancer Submit Deliverable Action */}
                            {isFreelancer && (isFunded || isRevision) && (
                              <button
                                type="button"
                                onClick={() => setSubmitModalMilestone(m)}
                                className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-sm flex items-center space-x-1"
                              >
                                <UploadCloud className="w-3.5 h-3.5 mr-1" />
                                <span>{isRevision ? "Resubmit Work" : "Submit Deliverables"}</span>
                              </button>
                            )}

                            {/* Client Review Deliverable Action */}
                            {isClient && isSubmitted && (
                              <button
                                type="button"
                                onClick={() => setReviewModalMilestone(m)}
                                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm flex items-center space-x-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                <span>Review Work</span>
                              </button>
                            )}

                            {/* Completed Checkmark */}
                            {isReleased && (
                              <div className="text-xs font-semibold text-emerald-700 flex items-center">
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                <span>Paid & Released</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Deliverables Preview if submitted */}
                      {m.deliverable && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs space-y-1.5 text-slate-700">
                          <div>
                            <span className="font-semibold text-slate-900">Submitted Notes: </span>
                            <span>{m.deliverable.freelancerNotes}</span>
                          </div>
                          {m.deliverable.demoUrl && (
                            <div>
                              <span className="font-semibold text-slate-900">Live Demo: </span>
                              <a
                                href={m.deliverable.demoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-navy-900 hover:underline font-medium inline-flex items-center"
                              >
                                {m.deliverable.demoUrl} <ExternalLink className="w-3 h-3 ml-0.5" />
                              </a>
                            </div>
                          )}
                          {m.deliverable.clientFeedback && (
                            <div className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                              <span className="font-semibold">Client Feedback: </span>
                              <span>{m.deliverable.clientFeedback}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MESSAGES & CHAT */}
        {activeTab === "messages" && (
          <div className="bg-white rounded-b-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-navy-900">Project Discussion Feed</h2>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {messages.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No messages sent yet. Start the conversation!</p>
              ) : (
                messages.map((msg: any) => {
                  const isSys = msg.isSystemMessage || msg.senderRole === "SYSTEM";
                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-xl text-xs ${
                        isSys
                          ? "bg-slate-100 border border-slate-200 text-slate-700 font-medium"
                          : "bg-navy-50/50 border border-navy-100 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-navy-900">{msg.senderName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Send Input */}
            <form onSubmit={handleSendMessage} className="flex space-x-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message, query, or update..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
              <button
                type="submit"
                disabled={chatSending || !chatInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 transition-colors shadow-sm disabled:opacity-50 flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: AUDIT TIMELINE */}
        {activeTab === "timeline" && (
          <div className="bg-white rounded-b-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-navy-900">Immutable Audit Trail</h2>
            <p className="text-xs text-slate-500">
              Every critical action and state transition is cryptographically logged with actor IDs and timestamps.
            </p>

            <div className="space-y-4 relative border-l-2 border-slate-200 ml-4 pl-6">
              {timelineEvents.map((evt: any) => (
                <div key={evt.id} className="relative">
                  <div className="w-3 h-3 rounded-full bg-navy-900 absolute -left-[31px] top-1 border-2 border-white" />
                  <div className="text-xs font-bold text-navy-900">{evt.action}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {evt.reason || "System event executed"} • {new Date(evt.createdAt).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DISPUTES & ARBITRATION */}
        {activeTab === "disputes" && (
          <div className="bg-white rounded-b-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-navy-900">Indian Arbitration & Dispute Resolution</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              KaryaSetu provides neutral arbitration for all funded milestones under the{" "}
              <strong>Arbitration and Conciliation Act 1996</strong>. Funds held in RBI Nodal Escrow cannot be unilaterally withdrawn while under dispute review.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-navy-900">Dispute Workflow:</div>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Direct negotiation period (48 hours between Client and Freelancer).</li>
                <li>Evidence submission (code logs, message transcripts, spec comparison).</li>
                <li>Neutral Support Admin arbitration verdict within 5 business days.</li>
                <li>Direct escrow split or release according to final award.</li>
              </ol>
            </div>
          </div>
        )}

        {/* MODAL: SUBMIT DELIVERABLES (Freelancer) */}
        {submitModalMilestone && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-navy-900">Submit Milestone Deliverables</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For <strong>{submitModalMilestone.title}</strong> ({formatINR(submitModalMilestone.amountINR)})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitModalMilestone(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitDeliverable} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Deliverable Summary / Handover Notes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={freelancerNotes}
                    onChange={(e) => setFreelancerNotes(e.target.value)}
                    placeholder="Describe completed tasks, tests written, deployment instructions, and how the client can verify deliverables..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Demo / Staging URL (Optional)</label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://staging.kaveri.tech or https://github.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-navy-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Deliverable File Link / Cloud Vault (Optional)
                  </label>
                  <input
                    type="url"
                    value={fileUrlInput}
                    onChange={(e) => setFileUrlInput(e.target.value)}
                    placeholder="https://s3.ap-south-1.amazonaws.com/karyasetu-vault/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-navy-900"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSubmitModalMilestone(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 transition-colors shadow-sm"
                  >
                    Submit for Approval
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: REVIEW DELIVERABLES (Client) */}
        {reviewModalMilestone && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-navy-900">Review Submitted Deliverables</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For <strong>{reviewModalMilestone.title}</strong> ({formatINR(reviewModalMilestone.amountINR)})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewModalMilestone(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Submitted notes view */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div>
                  <span className="font-semibold text-slate-900">Freelancer Notes: </span>
                  <span className="text-slate-700">{reviewModalMilestone.deliverable?.freelancerNotes}</span>
                </div>
                {reviewModalMilestone.deliverable?.demoUrl && (
                  <div>
                    <span className="font-semibold text-slate-900">Demo URL: </span>
                    <a
                      href={reviewModalMilestone.deliverable.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-navy-900 font-semibold underline inline-flex items-center"
                    >
                      {reviewModalMilestone.deliverable.demoUrl} <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>

              {/* Revision feedback input */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Revision Request Feedback (Only if requesting changes)
                </label>
                <textarea
                  rows={3}
                  value={revisionFeedback}
                  onChange={(e) => setRevisionFeedback(e.target.value)}
                  placeholder="Describe specific changes or corrections needed before approval..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleReviewAction("REQUEST_REVISION")}
                  disabled={!revisionFeedback.trim()}
                  className="px-4 py-2.5 rounded-xl border border-red-300 text-red-700 text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                >
                  Request Revision
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewAction("APPROVE")}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-sm flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Release ₹{reviewModalMilestone.amountINR.toLocaleString("en-IN")}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
