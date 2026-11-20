"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  IndianRupee,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building,
  Sparkles,
} from "lucide-react";

const CATEGORIES = [
  "Web & Mobile Development",
  "Design & Creative",
  "AI & Data Science",
  "Writing & Translation",
  "Digital Marketing",
  "Finance & Legal",
];

const SUGGESTED_SKILLS = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Python",
  "Tailwind CSS",
  "UI/UX Design",
  "AWS",
  "Razorpay Integration",
  "Figma",
  "Mobile App Development",
];

interface MilestoneInput {
  title: string;
  amountINR: number;
  durationDays: number;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [budgetType, setBudgetType] = useState<"FIXED" | "HOURLY">("FIXED");
  const [budgetINR, setBudgetINR] = useState<number>(50000);
  const [duration, setDuration] = useState("1 to 3 months");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>(["Next.js", "TypeScript"]);
  const [newSkill, setNewSkill] = useState("");

  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { title: "Phase 1: Architecture & Auth Setup", amountINR: 20000, durationDays: 15 },
    { title: "Phase 2: Core Feature Implementation", amountINR: 20000, durationDays: 20 },
    { title: "Phase 3: Testing & Staging Deployment", amountINR: 10000, durationDays: 10 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const milestoneSum = milestones.reduce((acc, m) => acc + (Number(m.amountINR) || 0), 0);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Phase ${milestones.length + 1}: Final Polish & Handover`,
        amountINR: 10000,
        durationDays: 10,
      },
    ]);
  };

  const removeMilestone = (idx: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const updateMilestone = (idx: number, field: keyof MilestoneInput, value: any) => {
    const updated = [...milestones];
    updated[idx] = { ...updated[idx], [field]: value };
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || title.length < 5) {
      setError("Please provide a project title of at least 5 characters.");
      return;
    }

    if (!description.trim() || description.length < 20) {
      setError("Please describe project scope and deliverables in at least 20 characters.");
      return;
    }

    if (budgetType === "FIXED" && milestoneSum !== Number(budgetINR)) {
      setError(
        `Total milestone amounts (₹${milestoneSum.toLocaleString("en-IN")}) must equal total budget (₹${Number(budgetINR).toLocaleString("en-IN")}).`
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          budgetType,
          budgetINR: Number(budgetINR),
          duration,
          description,
          skillsRequired: skills,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      setSuccess("Project successfully published to KaryaSetu marketplace!");
      setTimeout(() => {
        router.push(`/projects/${data.project.id}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to create project. Please verify client login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
          <Link href="/projects" className="hover:text-navy-900 transition-colors">
            Browse Projects
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Post a New Project</span>
        </div>

        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                RBI Nodal Escrow Protected Hiring
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                Post an Indian Marketplace Project
              </h1>
              <p className="mt-2 text-slate-600 text-sm sm:text-base">
                Hire vetted Indian developers, designers, and specialists. Funds remain safely in escrow until you approve each milestone.
              </p>
            </div>
            <div className="hidden sm:flex p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-700">
              <Briefcase className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Error / Success Feedback */}
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

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-navy-900 border-b border-slate-100 pb-3 flex items-center">
              <span className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center mr-2">
                1
              </span>
              Project Scope & Overview
            </h2>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Next.js FinTech Dashboard with Razorpay Route Escrow Integration"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900 text-sm"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Keep it concise and highlight the core deliverable.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900 text-sm bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Estimated Duration <span className="text-red-500">*</span>
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900 text-sm bg-white"
                >
                  <option value="Less than 1 month">Less than 1 month</option>
                  <option value="1 to 3 months">1 to 3 months</option>
                  <option value="3 to 6 months">3 to 6 months</option>
                  <option value="More than 6 months">More than 6 months</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Detailed Scope & Requirements <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline project goals, required tech stack, key APIs, expected milestones, and acceptance criteria..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900 text-sm leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Section 2: Budget & Financial Terms */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-navy-900 border-b border-slate-100 pb-3 flex items-center">
              <span className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center mr-2">
                2
              </span>
              Budget & Indian Escrow Allocation
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Pricing Structure</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBudgetType("FIXED")}
                    className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all text-center ${
                      budgetType === "FIXED"
                        ? "bg-navy-900 text-white border-navy-900 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Fixed Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudgetType("HOURLY")}
                    className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all text-center ${
                      budgetType === "HOURLY"
                        ? "bg-navy-900 text-white border-navy-900 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Hourly Rate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  {budgetType === "FIXED" ? "Total Budget (₹ INR)" : "Hourly Budget (₹/hour)"}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={budgetINR}
                    onChange={(e) => setBudgetINR(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900 text-sm font-semibold"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Escrow Fee Transparency Card */}
            {(() => {
              const b = Number(budgetINR) || 0;
              const fee = Math.round(b * rates.clientServiceFeeRate);
              const gst = Math.round(fee * rates.gstRate);
              const total = b + fee + gst;
              const feePercentStr = (rates.clientServiceFeeRate * 100).toFixed(rates.clientServiceFeeRate * 100 % 1 === 0 ? 0 : 1);
              const gstPercentStr = (rates.gstRate * 100).toFixed(rates.gstRate * 100 % 1 === 0 ? 0 : 1);

              return (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                  <div className="flex justify-between font-medium">
                    <span>Contract Escrow Amount:</span>
                    <span className="text-slate-900 font-bold">₹{b.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Client Platform Fee ({feePercentStr}%):</span>
                    <span>₹{fee.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST on Platform Fee ({gstPercentStr}%):</span>
                    <span>₹{gst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-navy-900">
                    <span>Total Client Funding Commitment:</span>
                    <span className="text-emerald-700">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    * GST invoice with ITC eligibility issued upon funding. Section 52 CGST TCS &amp; 194-O TDS handled automatically.
                  </p>
                </div>
              );
            })()}

            {/* Milestone Breakdown */}
            {budgetType === "FIXED" && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-navy-900">Proposed Milestone Schedule</h3>
                    <p className="text-xs text-slate-500">
                      Break project into sequential deliverables funded individually into escrow.
                    </p>
                  </div>
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
                  <span className={milestoneSum === Number(budgetINR) ? "text-emerald-700" : "text-amber-600"}>
                    Allocated: ₹{milestoneSum.toLocaleString("en-IN")} / ₹{Number(budgetINR).toLocaleString("en-IN")}
                  </span>
                  {milestoneSum !== Number(budgetINR) && (
                    <span className="text-amber-600">Difference: ₹{Math.abs(Number(budgetINR) - milestoneSum).toLocaleString("en-IN")}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Required Skills */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-navy-900 border-b border-slate-100 pb-3 flex items-center">
              <span className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center mr-2">
                3
              </span>
              Required Skills & Technologies
            </h2>

            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-navy-900 text-white"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="ml-1.5 text-slate-300 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(newSkill);
                  }
                }}
                placeholder="Type a skill and press Enter (e.g. Flutter, Docker)"
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
              <button
                type="button"
                onClick={() => addSkill(newSkill)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                Add
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-2 font-medium">Suggested skills:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSkill(s)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              href="/projects"
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 text-center transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-navy-900 text-white text-sm font-bold hover:bg-navy-800 transition-colors shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Publishing Project...</span>
              ) : (
                <>
                  <span>Publish Project to Marketplace</span>
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
