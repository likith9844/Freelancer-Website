"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Briefcase, 
  UserCheck, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  IndianRupee, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = React.useState<"CLIENT" | "FREELANCER">("CLIENT");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  // Common fields
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Client fields
  const [companyName, setCompanyName] = React.useState("");
  const [clientType, setClientType] = React.useState("PVT_LTD");
  const [gstin, setGstin] = React.useState("");

  // Freelancer fields
  const [professionalTitle, setProfessionalTitle] = React.useState("");
  const [skillsString, setSkillsString] = React.useState("");
  const [hourlyRateINR, setHourlyRateINR] = React.useState("2000");
  const [city, setCity] = React.useState("Bengaluru");
  const [state, setState] = React.useState("Karnataka");

  const [agreedToTerms, setAgreedToTerms] = React.useState(true);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setErrorMessage("Please accept the Terms of Service and Platform Agreements to proceed.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const skillsArray = skillsString
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        fullName,
        email,
        phone,
        password,
        role,
        ...(role === "CLIENT"
          ? {
              clientType,
              companyName,
              gstin,
              city,
              state,
            }
          : {
              professionalTitle,
              skills: skillsArray.length > 0 ? skillsArray : ["Full-Stack Engineering"],
              hourlyRateINR: Number(hourlyRateINR),
              city,
              state,
            }),
      };

      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Registration failed. Please check form inputs.");
        setIsLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
        window.location.href = "/dashboard";
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage("Network error during registration.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 flex flex-col justify-center sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white shadow-md">
            <span className="text-xl font-bold font-display text-saffron-400">K</span>
            <span className="text-xl font-bold font-display text-emerald-400">S</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-navy-900">
            Karya<span className="text-saffron-600">Setu</span>
          </span>
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-navy-900">
          Create Your KaryaSetu Account
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          India&apos;s Regulated Marketplace with Milestone Escrow &amp; Tax Automation
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <Card className="p-8 bg-white border-slate-200 shadow-sm">
          {/* Role Selection Toggle */}
          <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setRole("CLIENT")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                role === "CLIENT"
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-slate-600 hover:text-navy-900"
              }`}
            >
              <Briefcase className="h-4 w-4 text-navy-900" />
              <span>I want to Hire (Client)</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("FREELANCER")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                role === "FREELANCER"
                  ? "bg-white text-saffron-700 shadow-sm"
                  : "text-slate-600 hover:text-navy-900"
              }`}
            >
              <UserCheck className="h-4 w-4 text-saffron-600" />
              <span>I want to Work (Freelancer)</span>
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Full Legal Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Rahul Verma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Indian Mobile Number (+91) *
                </label>
                <Input
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Create Password * (min 8 chars)
                </label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Role Specific Fields: CLIENT */}
            {role === "CLIENT" && (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-900 mb-1">
                      Company / Organization Name *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Kaveri Logistics Tech"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 mb-1">
                      Organization Entity Type *
                    </label>
                    <select
                      className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-saffron-600 focus:outline-none"
                      value={clientType}
                      onChange={(e) => setClientType(e.target.value)}
                    >
                      <option value="PVT_LTD">Private Limited (Pvt Ltd)</option>
                      <option value="LLP">Limited Liability Partnership (LLP)</option>
                      <option value="PROPRIETORSHIP">Proprietorship / MSME</option>
                      <option value="INDIVIDUAL">Individual Client</option>
                      <option value="ENTERPRISE">Enterprise / Public Ltd</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    GSTIN (For 18% Input Tax Credit Invoices - Optional)
                  </label>
                  <Input
                    placeholder="29AABCU9603R1ZM (15 Digits)"
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  />
                  <span className="text-[10px] text-slate-400">
                    If supplied, tax invoices will feature this GSTIN for your company ITC claims.
                  </span>
                </div>
              </div>
            )}

            {/* Role Specific Fields: FREELANCER */}
            {role === "FREELANCER" && (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    Professional Title *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Senior Next.js Architect or Lead UI/UX Designer"
                    value={professionalTitle}
                    onChange={(e) => setProfessionalTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-900 mb-1">
                      Hourly Rate (₹ INR) *
                    </label>
                    <Input
                      type="number"
                      required
                      placeholder="2000"
                      value={hourlyRateINR}
                      onChange={(e) => setHourlyRateINR(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 mb-1">
                      City in India *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Bengaluru, Pune, Hyderabad"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    Core Skills (Comma separated) *
                  </label>
                  <Input
                    required
                    placeholder="Next.js, TypeScript, PostgreSQL, Tailwind CSS"
                    value={skillsString}
                    onChange={(e) => setSkillsString(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Terms Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-saffron-600 focus:ring-saffron-500 h-4 w-4"
                />
                <span className="text-[11px] text-slate-600 leading-tight">
                  I agree to the{" "}
                  <Link href="/terms" className="text-saffron-700 underline">Terms of Service</Link>,{" "}
                  <Link href="/privacy" className="text-saffron-700 underline">Privacy Policy</Link>, and the{" "}
                  <Link href={role === "CLIENT" ? "/client-agreement" : "/freelancer-agreement"} className="text-saffron-700 underline">
                    {role === "CLIENT" ? "Client Agreement" : "Freelancer Agreement"}
                  </Link>{" "}
                  including Section 194-O TDS and Milestone Escrow regulations.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="saffron"
              size="lg"
              className="w-full justify-center font-semibold mt-4"
              isLoading={isLoading}
            >
              Complete Registration &amp; Enter
            </Button>
          </form>
        </Card>

        {/* Existing account link */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-saffron-700 hover:underline">
            Sign In to your existing account
          </Link>
        </div>
      </div>
    </div>
  );
}
