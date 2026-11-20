import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-700">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand Info */}
          <div className="col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-white">
                <span className="text-base font-bold font-display text-saffron-400">K</span>
                <span className="text-base font-bold font-display text-emerald-400">S</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-navy-900">
                Karya<span className="text-saffron-600">Setu</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              India&apos;s trusted freelance exchange. Guaranteed milestone payments, verified KYC talent, and transparent fee settlement.
            </p>
            <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
              <p>Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103</p>
              <p>support@karyasetu.in</p>
            </div>
          </div>

          {/* For Clients */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950">For Clients</h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li><Link href="/freelancers" className="hover:text-navy-950 transition-colors">Find Freelancers</Link></li>
              <li><Link href="/projects/new" className="hover:text-navy-950 transition-colors">Post a Project</Link></li>
              <li><Link href="/pricing" className="hover:text-navy-950 transition-colors">Pricing</Link></li>
              <li><Link href="/client-agreement" className="hover:text-navy-950 transition-colors">Client Agreement</Link></li>
            </ul>
          </div>

          {/* For Freelancers */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950">For Freelancers</h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li><Link href="/projects" className="hover:text-navy-950 transition-colors">Browse Projects</Link></li>
              <li><Link href="/for-freelancers" className="hover:text-navy-950 transition-colors">Apply as Talent</Link></li>
              <li><Link href="/wallet" className="hover:text-navy-950 transition-colors">Payouts &amp; Wallet</Link></li>
              <li><Link href="/freelancer-agreement" className="hover:text-navy-950 transition-colors">Freelancer Agreement</Link></li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950">Trust &amp; Legal</h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li><Link href="/trust-and-safety" className="hover:text-navy-950 transition-colors">Trust &amp; Safety</Link></li>
              <li><Link href="/terms" className="hover:text-navy-950 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-navy-950 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-navy-950 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Regulatory Bottom Bar */}
        <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p className="flex items-center gap-1">
            © 2026 KaryaSetu Technologies India Pvt. Ltd.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              RBI Escrow Compliant
            </span>
            <span>•</span>
            <span>Section 194-O TDS Ready</span>
            <span>•</span>
            <span>NPCI IMPS Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
