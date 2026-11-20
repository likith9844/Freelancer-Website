import * as React from "react";
import Link from "next/link";
import { 
  Code2, 
  Smartphone, 
  Palette, 
  BrainCircuit, 
  Scale, 
  TrendingUp, 
  FileText, 
  Video,
  ArrowRight,
  Briefcase,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CATEGORIES } from "@/data/mock-marketplace-data";

export default function CategoriesPage() {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Code2": return <Code2 className="h-8 w-8 text-saffron-600" />;
      case "Smartphone": return <Smartphone className="h-8 w-8 text-saffron-600" />;
      case "Palette": return <Palette className="h-8 w-8 text-saffron-600" />;
      case "BrainCircuit": return <BrainCircuit className="h-8 w-8 text-saffron-600" />;
      case "Scale": return <Scale className="h-8 w-8 text-saffron-600" />;
      case "TrendingUp": return <TrendingUp className="h-8 w-8 text-saffron-600" />;
      case "FileText": return <FileText className="h-8 w-8 text-saffron-600" />;
      case "Video": return <Video className="h-8 w-8 text-saffron-600" />;
      default: return <Briefcase className="h-8 w-8 text-saffron-600" />;
    }
  };

  const subcategoriesMap: Record<string, string[]> = {
    "cat-1": ["Next.js & React Frontend", "Node.js & Python Backend", "Full-Stack Web Apps", "API & Cloud Microservices", "DevOps & AWS Architecture"],
    "cat-2": ["Flutter Cross-Platform", "React Native Apps", "Native iOS Swift", "Native Android Kotlin", "Mobile UI Architecture"],
    "cat-3": ["Figma Design Systems", "SaaS & Web App UI", "Mobile App UX", "Wireframing & Prototyping", "Brand Identity & Guidelines"],
    "cat-4": ["Generative AI & LLMs", "Computer Vision & OCR", "Python Data Science", "LangChain & RAG Workflows", "Predictive Analytics"],
    "cat-5": ["Chartered Accountant (CA) Retainers", "GST Registration & Returns", "TDS Section 194-O Advisory", "ROC & MCA Compliance", "Startup Valuation & Pitch Decks"],
    "cat-6": ["Search Engine Optimization (SEO)", "Google & Meta Paid Ads", "B2B LinkedIn Marketing", "Content Marketing Strategy", "Email Growth Marketing"],
    "cat-7": ["Technical & API Documentation", "B2B SaaS Copywriting", "Hindi & Regional Translation", "SEO Blog Content", "Legal Contract Drafting"],
    "cat-8": ["After Effects Motion Graphics", "YouTube Long-form Editing", "Reels & Social Video", "3D Product Modeling", "Explainer Video Production"],
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-600">Marketplace Directory</span>
          <h1 className="mt-2 text-4xl font-extrabold text-navy-900 tracking-tight font-display">
            Browse Talent by Category
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Access certified Indian freelance specialists across technical, financial, and creative verticals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CATEGORIES.map((cat) => (
            <Card key={cat.id} className="p-8 border-slate-200 bg-white hover:border-saffron-400 transition-all shadow-sm">
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-saffron-50 border border-saffron-100">
                  {getCategoryIcon(cat.iconName)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-navy-900">{cat.name}</h2>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      {cat.projectCount} Open Projects
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600">{cat.description}</p>

                  {/* Subcategories Tags */}
                  <div className="mt-5 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Popular Specializations:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(subcategoriesMap[cat.id] || []).map((sub) => (
                        <Link 
                          key={sub} 
                          href={`/freelancers?category=${cat.slug}&sub=${encodeURIComponent(sub)}`}
                          className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-navy-900 hover:text-white transition-colors"
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs text-slate-500">
                      {cat.freelancerCount.toLocaleString()} Verified Indian Experts
                    </span>
                    <Link href={`/freelancers?category=${cat.slug}`}>
                      <Button variant="ghost" size="sm" className="text-saffron-700 hover:text-saffron-800 gap-1 text-xs font-semibold">
                        <span>Explore Talent</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
