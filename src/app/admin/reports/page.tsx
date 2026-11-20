"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  ArrowLeft,
  DollarSign,
  PieChart,
  Calendar,
  Building,
  Hash,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<"reconciliation" | "tds" | "gst" | "ledger">("reconciliation");
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [taxReport, setTaxReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [recRes, taxRes] = await Promise.all([
        fetch("/api/v1/admin/reconciliation"),
        fetch("/api/v1/admin/reports/tax"),
      ]);

      if (recRes.ok) {
        const rData = await recRes.json();
        setReconciliation(rData.reconciliation);
      }
      if (taxRes.ok) {
        const tData = await taxRes.json();
        setTaxReport(tData.taxReport);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load financial reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownload = (type: "TDS" | "GST" | "LEDGER") => {
    window.open(`/api/v1/admin/reports/export?type=${type}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="p-2 rounded-xl text-slate-500 hover:text-navy-950 hover:bg-slate-100 transition-colors"
                title="Back to Admin Center"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="p-2.5 bg-navy-900 text-white rounded-xl">
                <Landmark className="w-6 h-6 text-saffron-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-navy-950">
                  Financial Reconciliation &amp; Regulatory Tax Reporting
                </h1>
                <p className="text-sm text-slate-500">
                  RBI Nodal Escrow balancing, Section 194-O TDS Form 26AS summaries, and SAC 998314 GST reports.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => handleDownload("TDS")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              TDS (CSV)
            </button>
            <button
              onClick={() => handleDownload("GST")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-navy-900 hover:bg-navy-800 text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              GST (CSV)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Top KPI Summary Banner */}
        {reconciliation && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Ledger Invariant</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    reconciliation.status === "BALANCED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {reconciliation.status}
                </span>
              </div>
              <div className="text-xl font-bold text-navy-950">
                {formatINR(reconciliation.totalDebits)}
              </div>
              <p className="text-xs text-slate-500">
                Debits == Credits (Imbalance: {formatINR(reconciliation.ledgerImbalance)})
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Nodal Escrow Commitment</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-emerald-700">
                {formatINR(reconciliation.reconciliations.escrow.escrowLiabilityNetINR)}
              </div>
              <p className="text-xs text-slate-500">
                Active Milestones: {formatINR(reconciliation.reconciliations.escrow.activeMilestoneCommitmentINR)} (Variance: {formatINR(reconciliation.reconciliations.escrow.varianceINR)})
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Section 194-O TDS (1%)</span>
                <Hash className="w-4 h-4 text-saffron-600" />
              </div>
              <div className="text-xl font-bold text-saffron-700">
                {formatINR(reconciliation.reconciliations.tax.tds194OWithheldINR)}
              </div>
              <p className="text-xs text-slate-500">
                Withheld for ITD TRACES / Form 26AS deposit
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>GST Output Liability</span>
                <Building className="w-4 h-4 text-navy-700" />
              </div>
              <div className="text-xl font-bold text-navy-950">
                {formatINR(reconciliation.reconciliations.tax.gstOutputLiabilityINR)}
              </div>
              <p className="text-xs text-slate-500">
                18% on platform commission &amp; service fees (SAC 998314)
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1 bg-white p-2 rounded-xl shadow-sm border border-slate-200 text-xs font-semibold">
          {[
            { id: "reconciliation", label: "Ledger & Escrow Reconciliation", icon: Landmark },
            { id: "tds", label: "Section 194-O TDS (Form 26AS)", icon: Hash },
            { id: "gst", label: "GST Summary (SAC 998314)", icon: Building },
            { id: "ledger", label: "Ledger Audit Trail", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-navy-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-navy-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. RECONCILIATION TAB */}
        {activeTab === "reconciliation" && reconciliation && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-navy-950 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Gateway Clearing Reconciliation
                  </h3>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {reconciliation.reconciliations.gateway.isReconciled ? "RECONCILED" : "MISMATCH"}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Total Gateway Captured Payments:</span>
                    <span className="font-semibold text-navy-950">
                      {formatINR(reconciliation.reconciliations.gateway.totalCapturedINR)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Clearing Account (1010) Debits:</span>
                    <span className="font-semibold text-navy-950">
                      {formatINR(reconciliation.reconciliations.gateway.clearingAccountDebitsINR)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 font-bold">
                    <span className="text-slate-700">Variance:</span>
                    <span className="text-emerald-700">
                      {formatINR(reconciliation.reconciliations.gateway.varianceINR)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-navy-950 text-sm flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-saffron-600" />
                    RBI Nodal Escrow Reconciliation
                  </h3>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {reconciliation.reconciliations.escrow.isReconciled ? "RECONCILED" : "MISMATCH"}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Active Funded Milestone Value:</span>
                    <span className="font-semibold text-navy-950">
                      {formatINR(reconciliation.reconciliations.escrow.activeMilestoneCommitmentINR)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Client Escrow Account (2010) Balance:</span>
                    <span className="font-semibold text-navy-950">
                      {formatINR(reconciliation.reconciliations.escrow.escrowLiabilityNetINR)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 font-bold">
                    <span className="text-slate-700">Variance:</span>
                    <span className="text-emerald-700">
                      {formatINR(reconciliation.reconciliations.escrow.varianceINR)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart of Accounts Matrix */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-navy-950 text-sm">
                    Chart of Accounts Trial Balance
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live balances across asset, liability, revenue, and expense accounts.
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  Total Debits: <span className="font-bold text-navy-950">{formatINR(reconciliation.totalDebits)}</span> · Total Credits: <span className="font-bold text-navy-950">{formatINR(reconciliation.totalCredits)}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Account Code</th>
                      <th className="py-3 px-4">Account Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Debits</th>
                      <th className="py-3 px-4 text-right">Credits</th>
                      <th className="py-3 px-4 text-right">Net Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {reconciliation.accounts.map((acc: any) => (
                      <tr key={acc.accountCode} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-navy-950">{acc.accountCode}</td>
                        <td className="py-3 px-4 font-sans text-slate-700">{acc.accountName}</td>
                        <td className="py-3 px-4">
                          <span className="font-sans px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {acc.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-800">{formatINR(acc.totalDebits)}</td>
                        <td className="py-3 px-4 text-right text-slate-800">{formatINR(acc.totalCredits)}</td>
                        <td className="py-3 px-4 text-right font-bold text-navy-950">{formatINR(acc.netBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. SECTION 194-O TDS TAB */}
        {activeTab === "tds" && taxReport && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-navy-950 text-base">
                    Section 194-O TDS Deduction Register (Quarterly Summary)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mandatory 1% TDS on gross participant payouts under Indian Income Tax Act 1961 for Form 26AS/26EQ.
                  </p>
                </div>
                <button
                  onClick={() => handleDownload("TDS")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download TRACES Form 26AS CSV
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500">Financial Period:</span>
                  <div className="font-bold text-navy-950 text-sm mt-0.5">
                    {taxReport.financialYear} · {taxReport.quarter}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Total Gross Disbursed:</span>
                  <div className="font-bold text-navy-950 text-sm mt-0.5">
                    {formatINR(taxReport.tds.totalGrossDisbursedINR)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Total TDS Withheld (1%):</span>
                  <div className="font-bold text-saffron-700 text-sm mt-0.5">
                    {formatINR(taxReport.tds.totalTdsWithheldINR)}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Freelancer Name</th>
                      <th className="py-3 px-4">PAN Number</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4 text-right">Gross Disbursed</th>
                      <th className="py-3 px-4 text-right">TDS (1%)</th>
                      <th className="py-3 px-4">Filing Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {taxReport.tds.records.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          No completed milestone settlements recorded in this period yet.
                        </td>
                      </tr>
                    ) : (
                      taxReport.tds.records.map((r: any) => (
                        <tr key={r.freelancerId} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-semibold text-navy-950">{r.freelancerName}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">{r.panNumber}</td>
                          <td className="py-3 px-4 text-slate-500">{r.email}</td>
                          <td className="py-3 px-4 text-right font-medium text-slate-800">
                            {formatINR(r.grossAmountINR)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-saffron-700">
                            {formatINR(r.tdsDeductedINR)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              {r.challanStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. GST SUMMARY TAB */}
        {activeTab === "gst" && taxReport && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-navy-950 text-base">
                    GST Tax Liability &amp; Invoicing Register
                  </h3>
                  <p className="text-xs text-slate-500">
                    SAC Code 998314 (IT and Software Consultancy Services) under CGST / SGST Act 2017.
                  </p>
                </div>
                <button
                  onClick={() => handleDownload("GST")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-navy-900 text-white hover:bg-navy-800 transition-colors self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download GSTR-8 Summary CSV
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500">Total Taxable Value:</span>
                  <div className="font-bold text-navy-950 text-sm mt-0.5">
                    {formatINR(taxReport.gst.totalTaxableValueINR)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">CGST (9%):</span>
                  <div className="font-bold text-navy-950 text-sm mt-0.5">
                    {formatINR(taxReport.gst.totalCgstINR)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">SGST (9%):</span>
                  <div className="font-bold text-navy-950 text-sm mt-0.5">
                    {formatINR(taxReport.gst.totalSgstINR)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Total GST Liability:</span>
                  <div className="font-bold text-emerald-700 text-sm mt-0.5">
                    {formatINR(taxReport.gst.totalGstCollectedINR)}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Invoice ID</th>
                      <th className="py-3 px-4">Recipient</th>
                      <th className="py-3 px-4">SAC Code</th>
                      <th className="py-3 px-4 text-right">Taxable (INR)</th>
                      <th className="py-3 px-4 text-right">CGST (9%)</th>
                      <th className="py-3 px-4 text-right">SGST (9%)</th>
                      <th className="py-3 px-4 text-right">Total Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {taxReport.gst.records.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          No taxable platform fee events generated yet.
                        </td>
                      </tr>
                    ) : (
                      taxReport.gst.records.map((r: any) => (
                        <tr key={r.invoiceId} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-navy-950">{r.invoiceId}</td>
                          <td className="py-3 px-4 text-slate-700 font-medium">{r.recipientName}</td>
                          <td className="py-3 px-4 font-mono text-slate-500">{r.sacCode}</td>
                          <td className="py-3 px-4 text-right font-medium text-slate-800">
                            {formatINR(r.taxableValueINR)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600">{formatINR(r.cgstAmountINR)}</td>
                          <td className="py-3 px-4 text-right text-slate-600">{formatINR(r.sgstAmountINR)}</td>
                          <td className="py-3 px-4 text-right font-bold text-navy-950">
                            {formatINR(r.totalInvoiceINR)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. LEDGER AUDIT TRAIL TAB */}
        {activeTab === "ledger" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-navy-950 text-base">
                  Double-Entry General Ledger Historical Journal
                </h3>
                <p className="text-xs text-slate-500">
                  Every debit and credit transaction logged with cryptographic reference IDs and balances.
                </p>
              </div>
              <button
                onClick={() => handleDownload("LEDGER")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-navy-900 text-white hover:bg-navy-800 transition-colors self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                Download General Ledger CSV
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              To review raw ledger entries live, open the <strong>Double-Entry Ledger</strong> tab in the main{" "}
              <Link href="/admin" className="text-saffron-600 underline font-semibold">
                Admin Control Center
              </Link>
              , or download the full immutable journal export above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
