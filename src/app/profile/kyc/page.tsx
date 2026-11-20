"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Landmark, 
  Lock, 
  FileCheck,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { validatePANFormat, validateIFSCFormat } from "@/lib/kyc/kyc-engine";

export default function KYCVerificationPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successResult, setSuccessResult] = React.useState<any>(null);

  // Form State
  const [panNumber, setPanNumber] = React.useState("ABCPS1234F");
  const [panHolderName, setPanHolderName] = React.useState("Aditya Sharma");
  const [aadhaarNumber, setAadhaarNumber] = React.useState("234567891234");
  const [bankName, setBankName] = React.useState("HDFC Bank");
  const [accountNumber, setAccountNumber] = React.useState("50100234567890");
  const [ifscCode, setIfscCode] = React.useState("HDFC0001234");

  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/v1/profile/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          panNumber,
          panHolderName,
          aadhaarNumber,
          bankName,
          accountNumber,
          ifscCode,
          accountHolderName: panHolderName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "KYC submission failed");
        setIsLoading(false);
        return;
      }

      setSuccessResult(data);
    } catch (err: any) {
      setErrorMessage("Network error communicating with KYC verification gateway.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/dashboard" className="hover:text-navy-900">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">Indian KYC Verification</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-navy-900 sm:text-3xl">
            Identity &amp; Bank Penny-Drop Verification
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Mandatory for Section 194-O TDS compliance and direct IMPS bank payout activation.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <div className={`p-3 rounded-xl border text-xs font-semibold ${step >= 1 ? "border-saffron-500 bg-saffron-50/50 text-saffron-900" : "border-slate-200 bg-white text-slate-400"}`}>
            <span>1. PAN Identity Check</span>
          </div>
          <div className={`p-3 rounded-xl border text-xs font-semibold ${step >= 2 ? "border-saffron-500 bg-saffron-50/50 text-saffron-900" : "border-slate-200 bg-white text-slate-400"}`}>
            <span>2. Masked Aadhaar (DPDPA)</span>
          </div>
          <div className={`p-3 rounded-xl border text-xs font-semibold ${step >= 3 ? "border-saffron-500 bg-saffron-50/50 text-saffron-900" : "border-slate-200 bg-white text-slate-400"}`}>
            <span>3. Bank Penny-Drop API</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-xs text-rose-800 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Banner */}
        {successResult ? (
          <Card className="p-8 bg-white border-emerald-300 shadow-md text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <Badge variant="verified" className="text-xs px-3 py-1 mb-2">
              VERIFIED INDIAN TALENT
            </Badge>
            <h2 className="text-xl font-bold text-navy-900">
              KYC &amp; Bank Account Successfully Verified!
            </h2>
            <p className="mt-2 text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              {successResult.pennyDrop.message} Your account is now fully approved for milestone payouts and 1% Section 194-O TDS certificates.
            </p>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 max-w-md mx-auto text-left text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">CBDT PAN Status:</span>
                <span className="font-bold text-emerald-800">Verified ({panNumber.toUpperCase()})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Penny-Drop Reference:</span>
                <span className="font-mono text-slate-700">{successResult.pennyDrop.pennyReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank Name Match:</span>
                <span className="font-bold text-emerald-700">{successResult.pennyDrop.nameMatchScorePercentage}% Match</span>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-3">
              <Link href="/dashboard">
                <Button variant="saffron" size="sm">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="p-8 bg-white border-slate-200 shadow-sm">
            <form onSubmit={handleSubmitKYC} className="space-y-6">
              {/* Step 1: PAN Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <FileCheck className="h-4 w-4 text-saffron-600" />
                  <h3 className="text-sm font-bold text-navy-900">Step 1: Permanent Account Number (PAN)</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-900 mb-1">
                      10-Digit PAN Number *
                    </label>
                    <Input
                      required
                      maxLength={10}
                      placeholder="ABCPS1234F"
                      className="font-mono uppercase font-bold"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    />
                    <span className="text-[10px] text-slate-400">
                      Format: 5 letters, 4 digits, 1 letter. Required for 1% TDS u/s 194-O.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 mb-1">
                      Full Name (As on PAN Card) *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Aditya Sharma"
                      value={panHolderName}
                      onChange={(e) => setPanHolderName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Aadhaar Details */}
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-navy-900">Step 2: Masked Aadhaar Verification (DPDPA 2023)</h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    12-Digit Aadhaar Number *
                  </label>
                  <Input
                    required
                    maxLength={12}
                    placeholder="2345 6789 1234"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                  />
                  <span className="text-[10px] text-slate-400">
                    We strictly store only the masked format (XXXXXXXX1234) in compliance with the Digital Personal Data Protection Act.
                  </span>
                </div>
              </div>

              {/* Step 3: Bank Account & Penny Drop */}
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Landmark className="h-4 w-4 text-navy-900" />
                  <h3 className="text-sm font-bold text-navy-900">Step 3: Bank Account for Direct IMPS/NEFT Payouts</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-900 mb-1">
                      Bank Name *
                    </label>
                    <Input
                      required
                      placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 mb-1">
                      11-Character IFSC Code *
                    </label>
                    <Input
                      required
                      maxLength={11}
                      placeholder="HDFC0001234"
                      className="font-mono uppercase font-bold"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    Beneficiary Bank Account Number *
                  </label>
                  <Input
                    required
                    type="password"
                    placeholder="Enter bank account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                  <span className="text-[10px] text-slate-400">
                    Encrypted at rest using AES-256-GCM. We execute an instant ₹1 penny-drop to match your account name against PAN records.
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  variant="saffron"
                  size="lg"
                  className="w-full justify-center font-semibold gap-2"
                  isLoading={isLoading}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Execute ₹1 Penny-Drop &amp; Verify Identity</span>
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
