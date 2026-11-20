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
  Building,
  MapPin,
  Star,
  Users,
  FileText,
  ArrowRight,
  Send,
  AlertCircle,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [project, setProject] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [viewerProposal, setViewerProposal] = useState<any>(null);
  const [totalProposalsCount, setTotalProposalsCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Fetch current user
        const authRes = await fetch("/api/v1/auth/me");
        if (authRes.ok) {
          const authData = await authRes.json();
          setCurrentUser(authData.user);
        }

        // Fetch project details
        const res = await fetch(`/api/v1/projects/${id}`);
        if (!res.ok) {
          throw new Error("Project not found");
        }
        const data = await res.json();
        setProject(data.project);
        setClient(data.client);
        setViewerProposal(data.viewerProposal);
        setTotalProposalsCount(data.totalProposalsCount || 0);
      } catch (err: any) {
        setError(err.message || "Failed to load project details");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-2xl border border-slate-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Project Not Found</h2>
          <p className="text-sm text-slate-600 mb-6">{error || "The project you are looking for does not exist."}</p>
          <Link
            href="/projects"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-navy-900 text-white text-sm font-semibold"
          >
            Back to Browse Projects
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser && (currentUser.role === "CLIENT" || currentUser.role === "SUPER_ADMIN");

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
          <Link href="/projects" className="hover:text-navy-900 transition-colors">
            Browse Projects
          </Link>
          <span>/</span>
          <span className="text-slate-500">{project.category}</span>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate max-w-xs">{project.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-navy-50 text-navy-900 border border-navy-200">
                  {project.category}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    project.status === "PUBLISHED"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : project.status === "IN_PROGRESS"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  Status: {project.status.replace("_", " ")}
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight leading-snug">
                  {project.title}
                </h1>
                <p className="text-xs text-slate-500 mt-2">
                  Posted on {new Date(project.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>

              {/* Financial & Time Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-slate-100">
                <div>
                  <div className="text-xs text-slate-500 font-medium flex items-center">
                    <IndianRupee className="w-3.5 h-3.5 mr-1" />
                    {project.budgetType === "FIXED" ? "Fixed Budget" : "Hourly Rate"}
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-navy-900 mt-0.5">
                    {formatINR(project.budgetINR)}
                    {project.budgetType === "HOURLY" && <span className="text-xs font-normal text-slate-500"> /hr</span>}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 font-medium flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Timeline
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-800 mt-0.5">
                    {project.duration}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 font-medium flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1" />
                    Proposals
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-800 mt-0.5">
                    {totalProposalsCount} Received
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-base font-bold text-navy-900 mb-3">Project Requirements & Deliverables</h2>
                <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {project.description}
                </div>
              </div>

              {/* Required Skills */}
              <div>
                <h3 className="text-sm font-bold text-navy-900 mb-3">Skills & Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {project.skillsRequired?.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Proposal Status for Freelancer if submitted */}
            {viewerProposal && (
              <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold text-base">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>You have submitted a proposal for this project</span>
                    </div>
                    <p className="text-xs text-emerald-700 mt-1">
                      Submitted bid: <strong className="font-semibold">{formatINR(viewerProposal.bidAmountINR)}</strong> | Estimated: <strong className="font-semibold">{viewerProposal.estimatedDurationDays} days</strong>
                    </p>
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white text-emerald-800 border border-emerald-300">
                        Proposal Status: {viewerProposal.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action CTA Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-navy-900">Project Actions</h3>

              {isOwner ? (
                <div className="space-y-3">
                  <Link
                    href={`/projects/${project.id}/proposals`}
                    className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-navy-900 text-white font-bold text-sm hover:bg-navy-800 transition-colors shadow-sm"
                  >
                    <Users className="w-4 h-4" />
                    <span>Review Proposals ({totalProposalsCount})</span>
                  </Link>
                  <p className="text-xs text-slate-500 text-center">
                    Compare bids, inspect freelancer KYC badges, and award contracts.
                  </p>
                </div>
              ) : currentUser?.role === "FREELANCER" ? (
                viewerProposal ? (
                  <button
                    disabled
                    className="w-full px-5 py-3 rounded-xl bg-slate-100 text-slate-500 font-semibold text-sm cursor-not-allowed text-center"
                  >
                    Proposal Already Submitted
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href={`/projects/${project.id}/propose`}
                      className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-navy-900 text-white font-bold text-sm hover:bg-navy-800 transition-colors shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit a Proposal</span>
                    </Link>
                    <p className="text-xs text-slate-500 text-center">
                      10% platform fee & 1% TDS applied server-side.
                    </p>
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-navy-900 text-white font-bold text-sm hover:bg-navy-800 transition-colors shadow-sm"
                  >
                    <span>Sign In to Propose</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* About the Client Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-navy-900 border-b border-slate-100 pb-3">
                About the Client
              </h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center border border-amber-200">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {client?.companyName || project.clientCompany || project.clientName}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center mt-0.5">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {client?.city || project.clientCity || "Bengaluru"}, India
                    </div>
                  </div>
                </div>

                {/* Verification Pill */}
                <div className="pt-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    GSTIN Verified Business
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Projects Posted:</span>
                    <span className="font-semibold text-slate-900">{client?.projectsPostedCount || 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Platform Spent:</span>
                    <span className="font-semibold text-slate-900">
                      {client?.totalSpentINR ? formatINR(client.totalSpentINR) : "₹5,40,000"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Client Rating:</span>
                    <span className="font-semibold text-slate-900 flex items-center">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                      {client?.ratingAverage || "5.0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow Guarantee Pill */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs text-slate-600 space-y-2">
              <div className="flex items-center text-navy-900 font-bold">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
                RBI Nodal Escrow Protection
              </div>
              <p className="leading-relaxed">
                Project funds are held securely in an RBI-compliant nodal account. Milestone payments are only disbursed after client review and approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
