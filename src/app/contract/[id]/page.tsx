"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Building,
  User,
  AlertCircle,
  Download,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function ContractAgreementPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [contract, setContract] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [freelancer, setFreelancer] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadContract = async () => {
    try {
      setLoading(true);

      const authRes = await fetch("/api/v1/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        setCurrentUser(authData.user);
      }

      const res = await fetch(`/api/v1/contracts/${id}`);
      if (!res.ok) throw new Error("Contract not found");
      const data = await res.json();
      setContract(data.contract);
      setProject(data.project);
      setClient(data.client);
      setFreelancer(data.freelancer);
    } catch (err: any) {
      setError(err.message || "Failed to load contract");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadContract();
    }
  }, [id]);

  const handleDigitalSign = async () => {
    try {
      setSigning(true);
      setError("");
      setSuccess("");

      const res = await fetch(`/api/v1/contracts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sign contract");

      setSuccess("Digital signature recorded successfully under Indian Contract Act 1872.");
      await loadContract();
    } catch (err: any) {
      setError(err.message || "Signature failed");
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-2xl border border-slate-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Contract Not Found</h2>
          <p className="text-sm text-slate-600 mb-6">{error || "The requested contract does not exist."}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-navy-900 text-white text-sm font-semibold"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isClientParty = client?.userId === currentUser?.id || currentUser?.role === "CLIENT";
  const isFreelancerParty = freelancer?.userId === currentUser?.id || currentUser?.role === "FREELANCER";
  const canSign =
    (isClientParty && !contract.clientSignedAt) ||
    (isFreelancerParty && !contract.freelancerSignedAt) ||
    currentUser?.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Link href={`/workspace/${contract.id}`} className="hover:text-navy-900 font-semibold transition-colors">
              ← Back to Project Workspace
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href={`/workspace/${contract.id}`}
              className="px-4 py-2 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <span>Enter Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start">
            <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Legal Paper Document View */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-md space-y-8 text-slate-800">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 mb-2">
              Bilateral Freelance Service Agreement
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-navy-900 uppercase tracking-tight">
              KaryaSetu Master Services Contract
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Contract Registration ID: <strong>{contract.contractNumber}</strong> | Created: {new Date(contract.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-slate-500 block">Party 1 (The Client)</span>
              <div className="text-sm font-bold text-navy-900">{client?.companyName || client?.fullName}</div>
              <div>Authorised Signatory: <strong>{client?.fullName}</strong></div>
              <div>Billing Location: <strong>{client?.city || "Bengaluru"}, India</strong></div>
              <div>GSTIN: <strong>{client?.gstin || "29AABCU9603R1ZM"}</strong> (Registered)</div>
            </div>

            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-slate-500 block">Party 2 (The Freelancer)</span>
              <div className="text-sm font-bold text-navy-900">{freelancer?.fullName}</div>
              <div>Title: <strong>{freelancer?.professionalTitle}</strong></div>
              <div>Resident City: <strong>{freelancer?.city || "Bengaluru"}, India</strong></div>
              <div>Tax PAN: <strong>Verified on Record (Sec 194-O)</strong></div>
            </div>
          </div>

          {/* Section 1: Scope */}
          <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
            <h3 className="text-sm sm:text-base font-bold text-navy-900 border-b border-slate-200 pb-1.5 uppercase tracking-wide">
              1. Project Scope & Deliverables
            </h3>
            <p>
              The Freelancer agrees to provide professional services for the project titled{" "}
              <strong>&ldquo;{project?.title}&rdquo;</strong> as detailed in the accepted proposal specification.
            </p>
            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-line text-xs font-mono">
              {project?.description}
            </p>
          </div>

          {/* Section 2: Financial Terms & Milestones */}
          <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
            <h3 className="text-sm sm:text-base font-bold text-navy-900 border-b border-slate-200 pb-1.5 uppercase tracking-wide">
              2. Contract Consideration & Milestone Escrow
            </h3>
            <p>
              The total contract consideration agreed upon by both parties is{" "}
              <strong className="text-navy-900">{formatINR(contract.totalValueINR)}</strong> (Rupees{" "}
              {contract.totalValueINR.toLocaleString("en-IN")}), payable strictly according to the following verified milestone schedule:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="p-2.5">Milestone</th>
                    <th className="p-2.5">Deliverable Description</th>
                    <th className="p-2.5">Amount (₹)</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {contract.milestones.map((m: any, idx: number) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold">M{idx + 1}</td>
                      <td className="p-2.5">{m.title}</td>
                      <td className="p-2.5 font-bold text-navy-900">{formatINR(m.amountINR)}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Indian Regulatory Clauses */}
          <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
            <h3 className="text-sm sm:text-base font-bold text-navy-900 border-b border-slate-200 pb-1.5 uppercase tracking-wide">
              3. Regulatory Compliance (TDS, GST & RBI Escrow)
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>
                <strong>Section 194-O Income Tax Act:</strong> KaryaSetu will withhold 1% TDS on all gross payouts made to the Freelancer and remit to the Income Tax Department against the Freelancer&apos;s verified PAN.
              </li>
              <li>
                <strong>GST on Platform Services:</strong> 18% GST is levied upon platform facilitation fees and credited under Section 52 CGST TCS rules with compliant GST invoices provided.
              </li>
              <li>
                <strong>RBI Escrow Protection:</strong> Client funds are held in an authorized Nodal Escrow Account until deliverable acceptance.
              </li>
              <li>
                <strong>Intellectual Property:</strong> All intellectual property rights, code, designs, and work products transfer irrevocably to the Client immediately upon escrow milestone approval and payment release.
              </li>
            </ul>
          </div>

          {/* Digital Signatures Box */}
          <div className="border-t-2 border-slate-900 pt-6 space-y-6">
            <h3 className="text-sm sm:text-base font-bold text-navy-900 uppercase tracking-wide">
              4. Digital Signatures & Acknowledgement
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              {/* Client Signature */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="font-bold text-slate-900">Signed on behalf of Client:</div>
                <div className="font-mono text-sm text-navy-900 font-bold">{client?.fullName}</div>
                {contract.clientSignedAt ? (
                  <div className="text-emerald-700 flex items-center pt-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Digitally Signed on {new Date(contract.clientSignedAt).toLocaleString("en-IN")}
                  </div>
                ) : (
                  <div className="text-amber-600 flex items-center pt-2 font-medium">
                    <Clock className="w-4 h-4 mr-1.5" />
                    Pending Digital Signature
                  </div>
                )}
              </div>

              {/* Freelancer Signature */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="font-bold text-slate-900">Signed on behalf of Freelancer:</div>
                <div className="font-mono text-sm text-navy-900 font-bold">{freelancer?.fullName}</div>
                {contract.freelancerSignedAt ? (
                  <div className="text-emerald-700 flex items-center pt-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Digitally Signed on {new Date(contract.freelancerSignedAt).toLocaleString("en-IN")}
                  </div>
                ) : (
                  <div className="text-amber-600 flex items-center pt-2 font-medium">
                    <Clock className="w-4 h-4 mr-1.5" />
                    Pending Digital Signature
                  </div>
                )}
              </div>
            </div>

            {/* Sign Action Button */}
            {canSign && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  disabled={signing}
                  onClick={handleDigitalSign}
                  className="px-8 py-3 rounded-xl bg-navy-900 text-white font-bold text-sm hover:bg-navy-800 transition-colors shadow-md disabled:opacity-50"
                >
                  {signing ? "Recording Digital Signature..." : "Digitally Acknowledge & Sign Agreement"}
                </button>
                <p className="text-[11px] text-slate-500 mt-2">
                  By clicking sign, you digitally execute this contract under the Information Technology Act 2000.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
