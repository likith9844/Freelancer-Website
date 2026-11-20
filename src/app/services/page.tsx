import * as React from "react";
import Link from "next/link";
import { 
  Search, 
  Star, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { formatINR } from "@/lib/utils";

interface ProductizedService {
  id: string;
  title: string;
  freelancerName: string;
  freelancerCity: string;
  freelancerAvatar: string;
  priceINR: number;
  deliveryDays: number;
  rating: number;
  reviewCount: number;
  salesCount: number;
  category: string;
  thumbnail: string;
  features: string[];
}

export default function BrowseServicesPage() {
  const services: ProductizedService[] = [
    {
      id: "srv-1",
      title: "Production Next.js 14 SaaS Starter with Razorpay Checkout",
      freelancerName: "Aditya Sharma",
      freelancerCity: "Bengaluru",
      freelancerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
      priceINR: 45000,
      deliveryDays: 7,
      rating: 4.98,
      reviewCount: 34,
      salesCount: 42,
      category: "Web & Software Engineering",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600",
      features: ["Next.js App Router + TypeScript", "Razorpay Route & Webhook Ingestion", "PostgreSQL + Prisma Schema", "Tailwind + Radix UI Design System"],
    },
    {
      id: "srv-2",
      title: "Complete Figma Design System for SaaS & Mobile App",
      freelancerName: "Pooja Deshmukh",
      freelancerCity: "Pune",
      freelancerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
      priceINR: 35000,
      deliveryDays: 5,
      rating: 4.96,
      reviewCount: 28,
      salesCount: 37,
      category: "UI/UX & Product Design",
      thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=600",
      features: ["500+ Atomic UI Components", "Dark & Light Mode Variables", "Responsive Mobile & Desktop Grids", "Figma Auto-Layout & Interactive Prototypes"],
    },
    {
      id: "srv-3",
      title: "New Company Incorporation, GST Registration & First Filing",
      freelancerName: "Kavita Rao",
      freelancerCity: "Mumbai",
      freelancerAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250",
      priceINR: 18000,
      deliveryDays: 10,
      rating: 4.94,
      reviewCount: 51,
      salesCount: 68,
      category: "Finance, GST & Legal",
      thumbnail: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600",
      features: ["Pvt Ltd / LLP SPICe+ MCA Drafting", "GSTIN Registration & Certificate", "PAN & TAN Generation", "Initial Director DIN & DSC Setup"],
    },
    {
      id: "srv-4",
      title: "Cross-Platform Flutter Mobile Starter with UPI Integration",
      freelancerName: "Sneha Nair",
      freelancerCity: "Kochi",
      freelancerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250",
      priceINR: 40000,
      deliveryDays: 7,
      rating: 4.91,
      reviewCount: 22,
      salesCount: 29,
      category: "Mobile App Development",
      thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=600",
      features: ["iOS & Android Flutter App", "Deep-linked UPI Payments", "Firebase Push Notifications", "Clean BLoC Architecture"],
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/" className="hover:text-navy-900">Home</Link>
              <span>/</span>
              <span className="text-slate-800 font-medium">Browse Services</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-navy-900 tracking-tight sm:text-4xl font-display">
              Fixed-Scope Services by Indian Experts
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl">
              Buy pre-packaged, fixed-price deliverables with transparent milestones, upfront timelines, and escrow protection.
            </p>
          </div>
          <Link href="/projects">
            <Button variant="outline" size="sm" className="gap-2 shrink-0">
              <span>Looking for Custom Projects?</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv) => (
            <Card key={srv.id} className="overflow-hidden border-slate-200 bg-white hover:border-saffron-400 transition-all shadow-sm flex flex-col justify-between">
              <div>
                {/* Thumbnail */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={srv.thumbnail}
                    alt={srv.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <Badge variant="navy" className="text-[10px] bg-navy-900/90 backdrop-blur-sm">
                      {srv.category.split("&")[0]}
                    </Badge>
                  </div>
                </div>

                <div className="p-5 pb-3">
                  {/* Freelancer Creator Header */}
                  <div className="flex items-center gap-2 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={srv.freelancerAvatar}
                      alt={srv.freelancerName}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-slate-800">{srv.freelancerName}</span>
                    <span className="text-[10px] text-slate-400">({srv.freelancerCity})</span>
                  </div>

                  <h3 className="text-sm font-bold text-navy-900 line-clamp-2 leading-snug hover:text-saffron-700 transition-colors">
                    <Link href={`/contact?service=${srv.id}`}>{srv.title}</Link>
                  </h3>

                  {/* Feature Highlights */}
                  <ul className="mt-3 space-y-1 text-[11px] text-slate-500">
                    {srv.features.slice(0, 3).map((feat, i) => (
                      <li key={i} className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <div className="flex items-center gap-1 font-semibold text-slate-800">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span>{srv.rating}</span>
                    <span className="text-slate-400">({srv.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>{srv.deliveryDays} Days Delivery</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Fixed Price</span>
                    <div className="text-base font-extrabold text-navy-900 font-inr">
                      {formatINR(srv.priceINR)}
                    </div>
                  </div>
                  <Link href={`/contact?service=${srv.id}`}>
                    <Button variant="saffron" size="sm" className="text-xs font-semibold">
                      Order Package
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
