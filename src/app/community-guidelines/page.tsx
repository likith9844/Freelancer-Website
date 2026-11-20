import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function CommunityGuidelinesPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-600">Ethics & Conduct</span>
          <h1 className="mt-2 text-3xl font-extrabold text-navy-900 tracking-tight sm:text-4xl">
            Community Guidelines
          </h1>
          <p className="mt-2 text-xs text-slate-500">
            Fostering a Culture of Professionalism, Integrity, and Mutual Respect · Last Updated: October 12, 2026
          </p>
        </div>

        <Card className="p-8 sm:p-12 bg-white border-slate-200 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">1. Professional & Respectful Collaboration</h2>
            <p>
              KaryaSetu is a high-trust professional ecosystem. We enforce a zero-tolerance policy against abusive language, harassment, discrimination based on gender, religion, caste, language, or geography, and threatening behavior in project workspaces or public forums.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">2. Prohibited Work & Content</h2>
            <p>
              Users may not post or bid on projects involving:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Malware, spyware, ransomware, or unauthorized scraping/hacking tools.</li>
              <li>Academic dishonesty (e.g. ghostwriting university theses, taking exams for students).</li>
              <li>Defamatory, illegal, pornographic, or fraudulent products.</li>
              <li>Financial pyramid schemes, unauthorized forex trading software, or misleading crypto promotions.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">3. Integrity of Reviews and Ratings</h2>
            <p>
              Reviews must reflect genuine commercial engagements. The following are strictly prohibited and result in immediate account suspension:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Offering incentives, discounts, or refunds in exchange for positive reviews.</li>
              <li>Creating self-dealing &ldquo;sham&rdquo; projects to artificially boost rating counts or badges.</li>
              <li>Coercing a counterparty through review extortion (&ldquo;Approve this or I will leave a 1-star review&rdquo;).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900">4. Reporting Violations</h2>
            <p>
              If you observe a violation of these guidelines, notify our Trust &amp; Safety team immediately at <a href="mailto:trust@karyasetu.in" className="text-saffron-700 underline">trust@karyasetu.in</a>. All reports are investigated with strict confidentiality.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
