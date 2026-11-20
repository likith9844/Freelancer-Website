"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Receipt,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { validateGSTINFormat } from "@/lib/kyc/kyc-engine";

export default function ClientProfilePage() {
  const [profile, setProfile] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  // Editable fields
  const [companyName, setCompanyName] = React.useState("");
  const [companyWebsite, setCompanyWebsite] = React.useState("");
  const [clientType, setClientType] = React.useState("PVT_LTD");
  const [gstin, setGstin] = React.useState("");
  const [city, setCity] = React.useState("Bengaluru");
  const [state, setState] = React.useState("Karnataka");
  const [pincode, setPincode] = React.useState("560103");

  React.useEffect(() => {
    fetch("/api/v1/profile/client")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
          setCompanyName(data.profile.companyName || "");
          setCompanyWebsite(data.profile.companyWebsite || "");
          setClientType(data.profile.clientType || "PVT_LTD");
          setGstin(data.profile.gstin || "");
          setCity(data.profile.city || "Bengaluru");
          setState(data.profile.state || "Karnataka");
          setPincode(data.profile.pincode || "560103");
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (gstin && !validateGSTINFormat(gstin)) {
      setErrorMessage("Invalid 15-character Indian GSTIN format (e.g. 29AABCU9603R1ZM).");
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/profile/client", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          companyWebsite,
          clientType,
          gstin,
          city,
          state,
          pincode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to update profile");
      } else {
        setSuccessMessage("Client business profile updated successfully!");
        setProfile(data.profile);
      }
    } catch (e) {
      setErrorMessage("Network error updating client profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">
        Loading client profile...
      </div>
    );
  }

  const isGSTValid = gstin ? validateGSTINFormat(gstin) : false;

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/dashboard" className="hover:text-navy-900">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">Client Profile &amp; Billing</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-navy-900 sm:text-3xl">
            Company Profile &amp; GSTIN Settings
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Configure your registered business details for automated 100% Input Tax Credit (ITC) tax invoicing.
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-xs text-rose-800 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Card className="p-8 bg-white border-slate-200 shadow-sm">
          <form onSubmit={handleSave} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-navy-900 mb-1">Company / Organization Name *</label>
                <Input
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Kaveri Logistics Tech Pvt Ltd"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">Entity Type *</label>
                <select
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-saffron-600 focus:outline-none"
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value)}
                >
                  <option value="PVT_LTD">Private Limited (Pvt Ltd)</option>
                  <option value="LLP">Limited Liability Partnership (LLP)</option>
                  <option value="PROPRIETORSHIP">Proprietorship / MSME</option>
                  <option value="INDIVIDUAL">Individual Client</option>
                  <option value="ENTERPRISE">Public Limited / Enterprise</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-navy-900 mb-1">Company Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-9"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="https://company.com"
                />
              </div>
            </div>

            {/* GSTIN Section with Live Status Badge */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-saffron-600" />
                  <label className="font-bold text-navy-900">Goods and Services Tax Number (GSTIN)</label>
                </div>
                {isGSTValid ? (
                  <Badge variant="verified" className="text-[10px] gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Eligible for 18% GST ITC</span>
                  </Badge>
                ) : (
                  <span className="text-[10px] text-slate-400">15-Digit Format</span>
                )}
              </div>

              <Input
                maxLength={15}
                className="font-mono uppercase font-bold"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="29AABCU9603R1ZM"
              />
              <p className="text-[11px] text-slate-500">
                Supplying your verified GSTIN ensures all milestone platform fee invoices (18% GST) feature your business identifier for Input Tax Credit claims.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-navy-900 mb-1">City</label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <label className="block font-semibold text-navy-900 mb-1">State</label>
                <Input value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <div>
                <label className="block font-semibold text-navy-900 mb-1">Pincode</label>
                <Input value={pincode} onChange={(e) => setPincode(e.target.value)} />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="saffron" size="sm" isLoading={isSaving} className="gap-1.5 font-semibold">
                <Save className="h-4 w-4" />
                <span>Save Business Profile</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
