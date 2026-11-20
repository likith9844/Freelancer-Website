import * as React from "react";
import Link from "next/link";
import { 
  Search, 
  HelpCircle, 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  UserCheck, 
  ArrowRight,
  LifeBuoy
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function HelpCenterPage() {
  const faqs = [
    {
      category: "Payments & Escrow",
      icon: CreditCard,
      items: [
        {
          q: "How does milestone escrow protect my payment?",
          a: "When you fund a milestone, funds enter an RBI-regulated Payment Aggregator nodal escrow account. The freelancer is notified that the milestone is funded, but funds are only released to their account when you inspect and approve the deliverable.",
        },
        {
          q: "Can I get a refund if the freelancer fails to deliver?",
          a: "Yes. If the freelancer abandons the project or fails to deliver according to agreed specifications, you can request a milestone cancellation or raise a dispute. Escrow funds are refunded directly to your original payment method.",
        },
        {
          q: "How do I claim GST Input Tax Credit (ITC)?",
          a: "During project setup or in your Client Profile, input your valid 15-digit Indian GSTIN. All platform service fee tax invoices will automatically feature your GSTIN for B2B ITC claims.",
        },
      ],
    },
    {
      category: "Freelancer KYC & TDS",
      icon: UserCheck,
      items: [
        {
          q: "Why is PAN verification mandatory for Indian freelancers?",
          a: "Under Section 194-O of the Indian Income Tax Act, e-commerce marketplace operators must deduct 1% TDS on all sales or services. With a verified PAN, your rate is 1%. Without a PAN, statutory rules mandate an escalated 5% withholding.",
        },
        {
          q: "What is penny-drop bank verification?",
          a: "We deposit ₹1 into your registered bank account via RBI IMPS. The automated API returns the registered account holder name from your bank, which is verified against your PAN card to prevent payout fraud.",
        },
        {
          q: "When does Section 194-O TDS reflect in my Form 26AS?",
          a: "TDS deductions are deposited with the government monthly and reconciled quarterly. Your Form 26AS and AIS will reflect the credits at the end of each fiscal quarter.",
        },
      ],
    },
    {
      category: "Contracts & Disputes",
      icon: ShieldCheck,
      items: [
        {
          q: "Are KaryaSetu digital agreements legally binding?",
          a: "Yes. All contracts created on KaryaSetu are valid electronic contracts under Section 10A of the Information Technology Act 2000 and the Indian Contract Act 1872 with cryptographic version hashes.",
        },
        {
          q: "What is the timeline for dispute resolution?",
          a: "Once a dispute is raised, both parties have 48 hours to submit evidence, workspace logs, and deliverables. Our dedicated arbitration team resolves the dispute within 72 business hours.",
        },
      ],
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-600">Support & Knowledgebase</span>
          <h1 className="mt-2 text-4xl font-extrabold text-navy-900 tracking-tight font-display sm:text-5xl">
            Help Center & Knowledgebase
          </h1>
          <p className="mt-3 text-base text-slate-500">
            Answers to common questions regarding milestone escrows, Indian KYC, GST tax invoices, and contract arbitration.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12 max-w-4xl mx-auto mb-16">
          {faqs.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.category} className="space-y-4">
                <div className="flex items-center gap-2.5 text-navy-900">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-100 text-navy-900">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="text-xl font-bold">{group.category}</h2>
                </div>

                <div className="space-y-3">
                  {group.items.map((item, idx) => (
                    <Card key={idx} className="p-6 bg-white border-slate-200">
                      <h3 className="text-sm font-bold text-navy-900">{item.q}</h3>
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed">{item.a}</p>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Need more help banner */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-navy-900 text-white p-8 text-center">
          <h3 className="text-xl font-bold">Still have questions?</h3>
          <p className="mt-2 text-xs text-slate-300">
            Our Indian support desk is available Monday through Saturday, 9:00 AM to 8:00 PM IST.
          </p>
          <div className="mt-6">
            <Link href="/contact">
              <Button variant="saffron" size="sm">
                Contact Platform Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
