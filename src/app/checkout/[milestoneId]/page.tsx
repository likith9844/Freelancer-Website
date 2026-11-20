"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  IndianRupee,
  Building,
  CreditCard,
  QrCode,
  FileText,
  AlertCircle,
  Receipt,
  Sparkles,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function MilestoneCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const milestoneId = params?.milestoneId as string;

  const [contract, setContract] = useState<any>(null);
  const [milestone, setMilestone] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState<any | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "NETBANKING" | "CARD">("UPI");
  const [upiId, setUpiId] = useState("rahul@oksbi");
  const [rates, setRates] = useState({
    clientServiceFeeRate: 0.03,
    gstRate: 0.18,
    gatewayHandlingFeeRate: 0.02,
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Find contract containing this milestone
        // First check contracts in store
        const meRes = await fetch("/api/v1/auth/me");
        if (!meRes.ok) throw new Error("Please sign in as Client to checkout.");

        // Fetch demo contract ctr-001 by default if testing, or search contracts
        const contractRes = await fetch(`/api/v1/contracts/ctr-001`);
        if (!contractRes.ok) throw new Error("Contract not found");
        const contractData = await contractRes.json();

        setContract(contractData.contract);
        setProject(contractData.project);

        const foundMilestone =
          contractData.contract.milestones.find((m: any) => m.id === milestoneId) ||
          contractData.contract.milestones[1] || // fallback to M2
          contractData.contract.milestones[0];

        setMilestone(foundMilestone);

        // Fetch initial order breakdown
        const orderRes = await fetch("/api/v1/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contractId: contractData.contract.id,
            milestoneId: foundMilestone.id,
            paymentMethod: "UPI",
          }),
        });

        const orderData = await orderRes.json();
        if (orderRes.ok) {
          setBreakdown(orderData.breakdown);
        }
        // Fetch live rates for breakdown labels
        fetch("/api/v1/platform/settings")
          .then((r) => r.json())
          .then((d) => {
            if (d.success && d.settings) {
              setRates({
                clientServiceFeeRate: Number(d.settings.clientServiceFeeRate ?? 0.03),
                gstRate: Number(d.settings.gstRate ?? 0.18),
                gatewayHandlingFeeRate: Number(d.settings.gatewayHandlingFeeRate ?? 0.02),
              });
            }
          })
          .catch(() => {});
      } catch (err: any) {
        setError(err.message || "Failed to load checkout details");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [milestoneId]);

  const handlePay = async () => {
    try {
      setPaying(true);
      setError("");

      // 1. Create order
      const orderRes = await fetch("/api/v1/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: contract.id,
          milestoneId: milestone.id,
          paymentMethod,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Order creation failed");

      // 2. Verify payment signature and post ledger
      const verifyRes = await fetch("/api/v1/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.order.providerOrderId,
          paymentId: orderData.paymentId,
          signature: orderData.mockSignature || "sig_ks_verified",
          contractId: contract.id,
          milestoneId: milestone.id,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");

      setPaymentSuccess(verifyData);
    } catch (err: any) {
      setError(err.message || "Payment processing error");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Preparing secure escrow checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <Link href={`/workspace/${contract?.id}`} className="hover:text-navy-900 transition-colors font-medium">
            ← Return to Workspace
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Secure Escrow Funding</span>
        </div>

        {/* Feedback error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Modal / State */}
        {paymentSuccess ? (
          <div className="bg-white rounded-2xl border border-emerald-200 p-8 sm:p-12 shadow-lg text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                Payment Captured & Escrow Locked
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-2">
                Milestone Funded Successfully!
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Funds are safely locked in RBI Nodal Escrow. Double-Entry Transaction ID:{" "}
                <strong className="font-mono text-slate-800">{paymentSuccess.transactionGroupId}</strong>
              </p>
            </div>

            {/* Invoice Details Card */}
            {paymentSuccess.invoice && (
              <div className="max-w-md mx-auto bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs text-left space-y-2">
                <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <span>Tax Invoice Reference:</span>
                  <span className="font-mono">{paymentSuccess.invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Service SAC Code:</span>
                  <span>{paymentSuccess.invoice.sacCode} (IT Services)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Gross Escrow Consideration:</span>
                  <span className="font-semibold text-slate-900">{formatINR(paymentSuccess.invoice.grossAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CGST & SGST (18%) Paid:</span>
                  <span className="font-semibold text-slate-900">{formatINR(paymentSuccess.invoice.gstPaid)}</span>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Link
                href={`/workspace/${contract.id}`}
                className="inline-flex items-center px-8 py-3 rounded-xl bg-navy-900 text-white font-bold text-sm hover:bg-navy-800 transition-colors shadow-md space-x-2"
              >
                <span>Enter Project Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Payment Method Selection */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    RBI Nodal Escrow Protected
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-navy-900">
                    Fund Milestone Escrow
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Select your preferred Indian payment method to deposit milestone consideration into escrow.
                  </p>
                </div>

                {/* Milestone Details Card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <div className="font-bold text-navy-900 text-sm">{milestone?.title}</div>
                  <div className="text-slate-500">Contract: {contract?.contractNumber}</div>
                  <div className="text-slate-500">{milestone?.description}</div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Choose Payment Option
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("UPI")}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        paymentMethod === "UPI"
                          ? "border-navy-900 bg-navy-50/40 ring-1 ring-navy-900"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-navy-900 mb-2" />
                      <div className="text-xs font-bold text-slate-900">UPI Instant</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">GPay, PhonePe, Paytm</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("NETBANKING")}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        paymentMethod === "NETBANKING"
                          ? "border-navy-900 bg-navy-50/40 ring-1 ring-navy-900"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <Building className="w-5 h-5 text-navy-900 mb-2" />
                      <div className="text-xs font-bold text-slate-900">NetBanking</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">HDFC, ICICI, SBI, Axis</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("CARD")}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        paymentMethod === "CARD"
                          ? "border-navy-900 bg-navy-50/40 ring-1 ring-navy-900"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-navy-900 mb-2" />
                      <div className="text-xs font-bold text-slate-900">Corporate Card</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Visa, Mastercard, RuPay</div>
                    </button>
                  </div>
                </div>

                {/* Method Specific Fields */}
                {paymentMethod === "UPI" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Virtual Payment Address (VPA / UPI ID)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-navy-900"
                    />
                  </div>
                )}

                {/* Checkout Trigger */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={paying}
                    onClick={handlePay}
                    className="w-full py-3.5 rounded-xl bg-navy-900 text-white font-bold text-sm hover:bg-navy-800 transition-colors shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {paying
                        ? "Verifying with Gateway & Updating Ledger..."
                        : `Pay ${breakdown ? formatINR(breakdown.totalPayableINR) : "₹42,216"} & Lock in Escrow`}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Transparent Indian Tax & Fee Breakdown */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center">
                  <Receipt className="w-4 h-4 mr-1.5 text-navy-900" />
                  Server-Side Fee Breakdown
                </h2>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Milestone Escrow Value:</span>
                    <span className="font-semibold text-slate-900">
                      {breakdown ? formatINR(breakdown.milestoneAmountINR) : "₹40,000"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Client Platform Service Fee ({(rates.clientServiceFeeRate * 100).toFixed(rates.clientServiceFeeRate * 100 % 1 === 0 ? 0 : 1)}%):</span>
                    <span className="font-semibold text-slate-900">
                      {breakdown ? formatINR(breakdown.clientServiceFeeINR) : "₹1,200"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>{(rates.gstRate * 100).toFixed(rates.gstRate * 100 % 1 === 0 ? 0 : 1)}% CGST &amp; SGST on Platform Fee:</span>
                    <span className="font-semibold text-slate-900">
                      {breakdown ? formatINR(breakdown.gstOnServiceFeeINR) : "₹216"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Payment Gateway Handling ({(rates.gatewayHandlingFeeRate * 100).toFixed(rates.gatewayHandlingFeeRate * 100 % 1 === 0 ? 0 : 1)}%):</span>
                    <span className="font-semibold text-slate-900">
                      {breakdown ? formatINR(breakdown.pgFeeINR) : "₹800"}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex justify-between font-black text-sm text-navy-900">
                    <span>Total Amount Charged:</span>
                    <span className="text-emerald-700 text-base">
                      {breakdown ? formatINR(breakdown.totalPayableINR) : "₹42,216"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 space-y-1">
                  <div>• Service Code: <strong>SAC 998314</strong></div>
                  <div>• B2B GST tax invoice generated automatically upon payment.</div>
                  <div>• Funds held under RBI Nodal guidelines until deliverable approval.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
