import * as React from "react";
import Link from "next/link";
import { 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  Star, 
  MapPin, 
  CheckCircle2, 
  Briefcase, 
  Code2, 
  Smartphone, 
  Palette, 
  BrainCircuit, 
  Scale, 
  TrendingUp, 
  FileText, 
  Video,
  Award,
  Lock,
  Landmark,
  IndianRupee,
  Clock,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { formatINR } from "@/lib/utils";
import { 
  CATEGORIES, 
  FEATURED_FREELANCERS, 
  FEATURED_PROJECTS, 
  POPULAR_SKILLS, 
  TESTIMONIALS 
} from "@/data/mock-marketplace-data";

export default function HomePage() {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Code2": return <Code2 className="h-6 w-6 text-saffron-600" />;
      case "Smartphone": return <Smartphone className="h-6 w-6 text-saffron-600" />;
      case "Palette": return <Palette className="h-6 w-6 text-saffron-600" />;
      case "BrainCircuit": return <BrainCircuit className="h-6 w-6 text-saffron-600" />;
      case "Scale": return <Scale className="h-6 w-6 text-saffron-600" />;
      case "TrendingUp": return <TrendingUp className="h-6 w-6 text-saffron-600" />;
      case "FileText": return <FileText className="h-6 w-6 text-saffron-600" />;
      case "Video": return <Video className="h-6 w-6 text-saffron-600" />;
      default: return <Briefcase className="h-6 w-6 text-saffron-600" />;
    }
  };

  return (
    <div className="flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 py-20 text-white lg:py-28">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-saffron-500/30 bg-saffron-500/10 px-3.5 py-1 text-xs font-medium text-saffron-300">
              <Sparkles className="h-3.5 w-3.5 text-saffron-400" />
              <span>India&apos;s First RBI-Escrow Aligned Freelance Marketplace</span>
            </div>

            {/* Core Headline */}
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl font-display">
              Find trusted Indian freelancers for your next project.
            </h1>

            <p className="mt-6 text-lg text-slate-300 leading-relaxed">
              Connect with government-KYC verified developers, designers, Chartered Accountants, and engineers. Every rupee protected in regulated milestone escrow until you approve the deliverable.
            </p>

            {/* Interactive Search Bar Form */}
            <form action="/freelancers" method="GET" className="mt-8 flex flex-col sm:flex-row gap-2 rounded-xl bg-white p-2 shadow-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Try 'Next.js developer', 'Figma UI designer', 'GST filing CA'..."
                  className="w-full rounded-lg border-0 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />
              </div>
              <Button type="submit" variant="saffron" size="lg" className="gap-2 shrink-0">
                <Search className="h-4 w-4" />
                <span>Search Talent</span>
              </Button>
            </form>

            {/* Popular Skills Quick Tags */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Popular Skills:</span>
              {POPULAR_SKILLS.slice(0, 7).map((skill) => (
                <Link
                  key={skill}
                  href={`/freelancers?skill=${encodeURIComponent(skill)}`}
                  className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-slate-300 hover:border-saffron-500 hover:text-white transition-colors"
                >
                  {skill}
                </Link>
              ))}
            </div>
          </div>

          {/* Value Metric Ribbons */}
          <div className="mt-16 grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-8 sm:grid-cols-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white font-inr">₹45+ Crore</div>
              <div className="mt-1 text-xs text-slate-400">Escrow Milestone Volume</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">100% Verified</div>
              <div className="mt-1 text-xs text-slate-400">Govt PAN & Bank Penny-Drop</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">12,000+</div>
              <div className="mt-1 text-xs text-slate-400">Vetted Indian Freelancers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-saffron-400">Sec 194-O TDS</div>
              <div className="mt-1 text-xs text-slate-400">Automated Tax & GST Invoices</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BROWSE BY CATEGORY */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-saffron-600">Specialized Categories</span>
              <h2 className="mt-1 text-3xl font-bold text-navy-900 tracking-tight">Explore In-Demand Indian Talent</h2>
              <p className="mt-2 text-sm text-slate-500">Hire certified professionals across major technology, creative, and business domains.</p>
            </div>
            <Link href="/categories">
              <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                <span>View All Categories</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <Link key={cat.id} href={`/freelancers?category=${cat.slug}`} className="group">
                <Card className="h-full border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-saffron-400 transition-all p-5 shadow-none hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-saffron-50 border border-saffron-100 group-hover:scale-105 transition-transform">
                    {getCategoryIcon(cat.iconName)}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-navy-900 group-hover:text-saffron-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
                    <span>{cat.freelancerCount.toLocaleString()} Freelancers</span>
                    <span className="text-emerald-700 font-medium">{cat.projectCount} Open Projects</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED INDIAN FREELANCERS */}
      <section className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Vetted & KYC-Verified</span>
              <h2 className="mt-1 text-3xl font-bold text-navy-900 tracking-tight">Featured Indian Freelancers</h2>
              <p className="mt-2 text-sm text-slate-500">Every profile authenticated with Govt PAN, bank penny-drop, and portfolio audit.</p>
            </div>
            <Link href="/freelancers">
              <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                <span>Browse All Freelancers</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_FREELANCERS.map((fl) => (
              <Card key={fl.id} className="flex flex-col justify-between border-slate-200 bg-white hover:border-navy-400 transition-all">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={fl.avatar}
                        alt={fl.name}
                        className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      {fl.isKycVerified && (
                        <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 shadow-sm" title="Govt KYC Verified">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />
                        </div>
                      )}
                    </div>
                    {fl.isTopRated && (
                      <Badge variant="saffron" className="text-[11px] gap-1">
                        <Award className="h-3 w-3" />
                        <span>Top Rated</span>
                      </Badge>
                    )}
                  </div>

                  <h3 className="mt-3 text-base font-bold text-navy-900">{fl.name}</h3>
                  <p className="text-xs font-medium text-slate-600 line-clamp-1">{fl.title}</p>
                  
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{fl.city}, {fl.state}</span>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0">
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {fl.bio}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {fl.skills.slice(0, 3).map((s) => (
                      <span key={s} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <div className="flex items-center gap-1 font-semibold text-slate-800">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span>{fl.rating}</span>
                      <span className="text-slate-400">({fl.reviewCount})</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-navy-900 font-inr">{formatINR(fl.hourlyRateINR)}/hr</div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 mt-0">
                  <Link href={`/freelancers?id=${fl.id}`} className="w-full">
                    <Button variant="secondary" size="sm" className="w-full text-xs font-medium text-navy-900 hover:bg-navy-900 hover:text-white transition-colors">
                      View Profile & Portfolio
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW THE MARKETPLACE WORKS */}
      <section className="py-16 sm:py-24 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-saffron-600">Transparent Operating Model</span>
            <h2 className="mt-1 text-3xl font-bold text-navy-900 tracking-tight">How KaryaSetu Works</h2>
            <p className="mt-2 text-sm text-slate-500">
              A legally anchored, milestone-escrow workflow designed for mutual trust between Clients and Freelancers.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* For Clients Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="inline-block rounded-lg bg-navy-900 px-3 py-1 text-xs font-semibold text-white">FOR CLIENTS</span>
                <span className="text-xs text-slate-500 font-medium">Hiring & Delivery</span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-navy-900">Hire Without Financial Risk</h3>
              
              <div className="mt-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">1</div>
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900">Post Project & Receive Proposals</h4>
                    <p className="mt-1 text-xs text-slate-600">Publish your scope, budget, and milestones. Compare verified Indian freelancers and negotiate deliverables.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">2</div>
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900">Fund Milestones into Escrow</h4>
                    <p className="mt-1 text-xs text-slate-600">Never pay 100% upfront. Fund individual milestones into our regulated nodal escrow before work starts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">3</div>
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900">Inspect Delivery & Release Funds</h4>
                    <p className="mt-1 text-xs text-slate-600">Review the deliverable in your workspace. Request revisions or release funds with 1-click. Receive GST ITC tax invoices.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <Link href="/projects">
                  <Button variant="navy" className="w-full justify-center">
                    Post a Project Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* For Freelancers Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="inline-block rounded-lg bg-saffron-600 px-3 py-1 text-xs font-semibold text-white">FOR FREELANCERS</span>
                <span className="text-xs text-slate-500 font-medium">Earnings & Security</span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-navy-900">Get Paid On Time, Every Time</h3>
              
              <div className="mt-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-saffron-600 text-xs font-bold text-white">1</div>
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900">Complete Indian KYC & Build Profile</h4>
                    <p className="mt-1 text-xs text-slate-600">Verify your PAN, masked Aadhaar, and bank account. Showcase your portfolio to high-paying Indian and global clients.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-saffron-600 text-xs font-bold text-white">2</div>
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900">Work Only with Funded Milestones</h4>
                    <p className="mt-1 text-xs text-slate-600">No more client ghosting. You are formally notified when milestone funds are secured in escrow before coding starts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-saffron-600 text-xs font-bold text-white">3</div>
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900">Direct Bank Payouts with TDS Credit</h4>
                    <p className="mt-1 text-xs text-slate-600">Receive net earnings directly to your bank account via IMPS/NEFT. Section 194-O TDS credit auto-reflected in your Form 26AS.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <Link href="/for-freelancers">
                  <Button variant="saffron" className="w-full justify-center">
                    Apply as a Freelancer
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LATEST MARKETPLACE PROJECTS */}
      <section className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-saffron-600">Active Opportunities</span>
              <h2 className="mt-1 text-3xl font-bold text-navy-900 tracking-tight">Latest Indian Projects</h2>
              <p className="mt-2 text-sm text-slate-500">Discover verified commercial projects with committed milestone budgets.</p>
            </div>
            <Link href="/projects">
              <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                <span>View All Projects</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FEATURED_PROJECTS.map((proj) => (
              <Card key={proj.id} className="border-slate-200 bg-white hover:border-saffron-400 transition-all p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="navy" className="text-[11px] mb-2">{proj.category}</Badge>
                    <h3 className="text-lg font-bold text-navy-900 hover:text-saffron-700 transition-colors">
                      <Link href={`/projects?id=${proj.id}`}>{proj.title}</Link>
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-extrabold text-emerald-700 font-inr">
                      {formatINR(proj.budgetINR)}
                    </span>
                    <span className="block text-[11px] text-slate-500">{proj.budgetType} Budget</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-600 line-clamp-2">
                  {proj.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {proj.skillsRequired.map((skill) => (
                    <span key={skill} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{proj.clientCompany}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {proj.clientCity}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{proj.proposalsCount} Proposals</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {proj.postedDate}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TRUST & SAFETY PILLAR SECTION */}
      <section className="py-16 sm:py-24 bg-navy-950 text-white border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Security Architecture</span>
            <h2 className="mt-1 text-3xl font-bold font-display sm:text-4xl text-white">Built on Uncompromising Trust</h2>
            <p className="mt-3 text-sm text-slate-300">
              We eliminated the risks of freelance transactions in India with legal, banking, and cryptographic safeguards.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Landmark className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">RBI Nodal Escrow Integration</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Client funds never pool in proprietary company current accounts. They are locked in RBI-regulated Payment Aggregator nodal escrows and disbursed only when you confirm deliverable acceptance.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-saffron-500/10 text-saffron-400 border border-saffron-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">Verified Identity & Penny-Drop</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Zero ghost freelancers or scam accounts. Indian PAN is checked with CBDT database, masked Aadhaar verified, and bank account holder name verified via RBI penny-drop API before payouts.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">Bilateral Contracts & Arbitration</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Every project is legally governed under the Indian Contract Act 1872 with immutable digital agreements. Unresolved disagreements are arbitrated by certified support admins with complete audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="py-16 sm:py-24 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-saffron-600">Client & Freelancer Feedback</span>
            <h2 className="mt-1 text-3xl font-bold text-navy-900 tracking-tight">Trusted Across India</h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.id} className="border-slate-200 bg-slate-50/60 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="mt-4 text-xs italic text-slate-700 leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <h4 className="text-sm font-bold text-navy-900">{t.author}</h4>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 8. DUAL CALL TO ACTION */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-navy-950 to-navy-800 p-8 sm:p-12 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold font-display sm:text-4xl text-white">
                Ready to transform how you hire and work in India?
              </h2>
              <p className="mt-3 text-sm text-slate-300">
                Join thousands of Indian businesses and top-tier freelancers collaborating under guaranteed milestone escrow and automated tax compliance.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/projects">
                <Button variant="saffron" size="lg" className="w-full sm:w-auto font-semibold">
                  Post a Project for Free
                </Button>
              </Link>
              <Link href="/for-freelancers">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-white bg-transparent border-slate-600 hover:bg-slate-800">
                  Join as a Freelancer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
