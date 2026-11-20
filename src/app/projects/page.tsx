"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  Filter, 
  DollarSign, 
  ArrowRight,
  PlusCircle,
  X,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatINR } from "@/lib/utils";

interface ProjectItem {
  id: string;
  clientId: string;
  clientName: string;
  clientCompany?: string;
  clientCity?: string;
  title: string;
  slug?: string;
  description: string;
  category: string;
  budgetType: "FIXED" | "HOURLY";
  budgetINR: number;
  duration: string;
  skillsRequired: string[];
  status: "DRAFT" | "PUBLISHED" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";
  proposalsCount: number;
  isClientVerified: boolean;
  createdAt: string;
}

export default function BrowseProjectsPage() {
  const [projects, setProjects] = React.useState<ProjectItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [selectedBudgetType, setSelectedBudgetType] = React.useState<string>("all");

  React.useEffect(() => {
    fetch("/api/v1/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.projects)) {
          setProjects(data.projects);
        }
      })
      .catch((e) => console.error("Error fetching projects:", e))
      .finally(() => setLoading(false));
  }, []);

  // Filter projects (showing published or in_progress active projects)
  const filteredProjects = projects.filter((p) => {
    // Hide internal drafts or closed projects unless searched
    if (p.status === "CLOSED" || p.status === "DRAFT") return false;

    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.skillsRequired.some((s) => s.toLowerCase().includes(q)) ||
      (p.clientCity && p.clientCity.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === "all" ? true : p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesBudgetType = selectedBudgetType === "all" ? true : p.budgetType === selectedBudgetType;

    return matchesSearch && matchesCategory && matchesBudgetType;
  });

  const availableCategories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/" className="hover:text-navy-900">Home</Link>
              <span>/</span>
              <span className="text-slate-800 font-medium">Browse Projects</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-navy-900 tracking-tight sm:text-4xl">
              Active Indian Client Projects
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl">
              Bid on verified projects from Indian companies and startups. Every milestone is protected in RBI Nodal Escrow.
            </p>
          </div>
          <Link href="/projects/new">
            <Button variant="saffron" className="gap-2 shrink-0 font-semibold">
              <PlusCircle className="h-4 w-4" />
              <span>Post a Project</span>
            </Button>
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects by title, skill, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-navy-900 placeholder-slate-400 focus:border-navy-900 focus:bg-white focus:outline-none transition-all"
              />
            </div>

            {/* Category Select */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-navy-900 focus:border-navy-900 focus:bg-white focus:outline-none transition-all"
              >
                <option value="all">All Project Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Budget Type Select */}
            <div>
              <select
                value={selectedBudgetType}
                onChange={(e) => setSelectedBudgetType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-navy-900 focus:border-navy-900 focus:bg-white focus:outline-none transition-all"
              >
                <option value="all">All Payment Types</option>
                <option value="FIXED">Fixed Milestone Pricing</option>
                <option value="HOURLY">Hourly Engagement</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
            <span>Showing {filteredProjects.length} real marketplace projects</span>
            {(searchQuery || selectedCategory !== "all" || selectedBudgetType !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedBudgetType("all");
                }}
                className="text-saffron-600 hover:underline font-semibold"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Project List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-navy-900 border-r-transparent" />
            <p className="mt-3 text-xs text-slate-500">Loading marketplace projects...</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="space-y-4">
            {filteredProjects.map((p) => (
              <Card key={p.id} className="p-6 bg-white border-slate-200 hover:border-navy-400 transition-all shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Side Content */}
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-block rounded-md bg-navy-50 text-navy-800 px-2 py-0.5 text-xs font-semibold">
                        {p.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently"}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-navy-900 hover:text-saffron-600 transition-colors">
                      <Link href={`/projects/${p.id}`}>{p.title}</Link>
                    </h2>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.skillsRequired.map((skill) => (
                        <span key={skill} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Side Pricing & Actions */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <div className="text-xl font-extrabold text-navy-900 font-inr">
                        {p.budgetType === "FIXED" ? formatINR(p.budgetINR) : `${formatINR(p.budgetINR)}/hr`}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {p.budgetType} · Est: {p.duration}
                      </div>
                    </div>

                    <Link href={`/projects/${p.id}`}>
                      <Button variant="saffron" size="sm" className="text-xs font-semibold">
                        Submit Proposal
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Footer Details */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{p.clientCompany || p.clientName}</span>
                    {p.isClientVerified && (
                      <span className="flex items-center gap-1 text-emerald-700 font-medium text-[11px]" title="Client payment method verified">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Verified Client
                      </span>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {p.clientCity || "India"}
                    </span>
                  </div>

                  <div className="font-medium text-slate-700">
                    {p.proposalsCount} proposals submitted
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-navy-900">No projects found matching criteria</h3>
            <p className="mt-1 text-xs text-slate-500">
              Try removing some filters or search for broader keywords.
            </p>
            <div className="mt-6">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedBudgetType("all");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
