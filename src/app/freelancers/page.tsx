"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Award, 
  Filter, 
  SlidersHorizontal,
  Briefcase,
  X,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { formatINR } from "@/lib/utils";

interface FreelancerItem {
  id: string;
  name: string;
  title: string;
  avatar: string;
  city: string;
  state: string;
  hourlyRateINR: number;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  skills: string[];
  bio: string;
  isKycVerified: boolean;
  isTopRated: boolean;
  onTimeDeliveryRate: number;
}

export default function FindFreelancersPage() {
  const [freelancers, setFreelancers] = React.useState<FreelancerItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [onlyVerified, setOnlyVerified] = React.useState(false);
  const [selectedCity, setSelectedCity] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("rating");

  React.useEffect(() => {
    fetch("/api/v1/freelancers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.freelancers)) {
          setFreelancers(data.freelancers);
        }
      })
      .catch((e) => console.error("Error fetching freelancers:", e))
      .finally(() => setLoading(false));
  }, []);

  // Filtering Logic
  const filteredFreelancers = freelancers.filter((fl) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      fl.name.toLowerCase().includes(q) ||
      fl.title.toLowerCase().includes(q) ||
      fl.skills.some((s) => s.toLowerCase().includes(q)) ||
      fl.city.toLowerCase().includes(q);

    const matchesVerified = onlyVerified ? fl.isKycVerified : true;
    const matchesCity = selectedCity === "all" ? true : fl.city.toLowerCase() === selectedCity.toLowerCase();

    return matchesSearch && matchesVerified && matchesCity;
  }).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "price_low") return a.hourlyRateINR - b.hourlyRateINR;
    if (sortBy === "price_high") return b.hourlyRateINR - a.hourlyRateINR;
    if (sortBy === "projects") return b.completedProjects - a.completedProjects;
    return 0;
  });

  const availableCities = Array.from(new Set(freelancers.map((f) => f.city).filter(Boolean)));

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-navy-900">Home</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">Find Freelancers</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
            <div>
              <h1 className="text-3xl font-bold text-navy-900 tracking-tight sm:text-4xl">
                Hire Verified Indian Freelancers
              </h1>
              <p className="mt-2 text-sm text-slate-500 max-w-3xl">
                Connect with real, PAN-verified Indian talent. Protected milestone payments via RBI-regulated Nodal Escrow.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {freelancers.length} Registered Talent
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Search Input */}
            <div className="relative lg:col-span-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, role (e.g. Next.js, Flutter), or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-navy-900 placeholder-slate-400 focus:border-navy-900 focus:bg-white focus:outline-none transition-all"
              />
            </div>

            {/* City Filter */}
            <div className="lg:col-span-3">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-navy-900 focus:border-navy-900 focus:bg-white focus:outline-none transition-all"
              >
                <option value="all">All Indian Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="lg:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-navy-900 focus:border-navy-900 focus:bg-white focus:outline-none transition-all"
              >
                <option value="rating">Top Rated (Client Score)</option>
                <option value="projects">Most Projects Completed</option>
                <option value="price_low">Hourly Rate: Low to High</option>
                <option value="price_high">Hourly Rate: High to Low</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 flex-wrap gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-saffron-600 focus:ring-saffron-500"
              />
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Govt KYC &amp; PAN Verified Only
              </span>
            </label>

            <span className="text-xs text-slate-400">
              Showing {filteredFreelancers.length} of {freelancers.length} Freelancers
            </span>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-saffron-600 border-r-transparent" />
            <p className="mt-3 text-xs text-slate-500">Loading verified talent directory...</p>
          </div>
        ) : filteredFreelancers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFreelancers.map((fl) => (
              <Card key={fl.id} className="flex flex-col justify-between border-slate-200 bg-white hover:border-navy-400 transition-all p-5 shadow-sm">
                <CardHeader className="p-0 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={fl.avatar}
                          alt={fl.name}
                          className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        {fl.isKycVerified && (
                          <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 shadow-sm" title="Govt KYC Verified">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-navy-900">{fl.name}</h3>
                        <p className="text-xs font-medium text-slate-600 line-clamp-1">{fl.title}</p>
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>{fl.city || "India"}, {fl.state}</span>
                        </div>
                      </div>
                    </div>
                    {fl.isTopRated && (
                      <Badge variant="saffron" className="text-[10px] gap-1 shrink-0">
                        <Award className="h-3 w-3" />
                        <span>Top Rated</span>
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-0 py-2">
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {fl.bio || "Full-stack developer offering professional software development and design services."}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {fl.skills.map((skill) => (
                      <span key={skill} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2 text-center text-xs">
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase">Rating</div>
                      <div className="flex items-center justify-center gap-0.5 font-bold text-slate-800 mt-0.5">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span>{fl.rating || 5.0}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase">Projects</div>
                      <div className="font-bold text-slate-800 mt-0.5">{fl.completedProjects}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase">On-Time</div>
                      <div className="font-bold text-emerald-700 mt-0.5">{fl.onTimeDeliveryRate || 100}%</div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-0 pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Hourly Rate</div>
                    <div className="text-base font-bold text-navy-900 font-inr">
                      {formatINR(fl.hourlyRateINR)}/hr
                    </div>
                  </div>
                  <Link href={`/projects/new?freelancerId=${fl.id}`}>
                    <Button variant="saffron" size="sm" className="text-xs font-semibold">
                      Hire Freelancer
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-navy-900">No freelancers matched your criteria</h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search query, clearing filters, or browsing other skills.
            </p>
            <div className="mt-6">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCity("all");
                  setOnlyVerified(false);
                }}
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
