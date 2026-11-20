"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2,
  Users,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("client@kaveri.tech");
  const [password, setPassword] = React.useState("Password@123");
  const [totpCode, setTotpCode] = React.useState("");
  const [requires2FA, setRequires2FA] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, totpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Authentication failed. Please check credentials.");
        setIsLoading(false);
        return;
      }

      if (data.requires2FA) {
        setRequires2FA(true);
        setSuccessMessage("Admin credentials verified. Please enter your 6-digit TOTP code.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage(`Welcome back, ${data.user.fullName}! Redirecting...`);
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth-changed"));
        }
        const target = ["SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN", "SUPPORT_ADMIN", "MODERATOR"].includes(data.user.role)
          ? "/admin"
          : "/dashboard";
        window.location.href = target;
      }, 500);
    } catch (err: any) {
      setErrorMessage("Network error communicating with authentication service.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRoleSelect = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("Password@123");
    setTotpCode("123456"); // Demo 2FA code
    setRequires2FA(false);
    setErrorMessage("");
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
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-navy-900">
          Sign In to Your Marketplace Account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Secured by RFC 6238 2FA &amp; Encrypted Session Guards
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <Card className="p-8 bg-white border-slate-200 shadow-sm">
          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={requires2FA}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-navy-900">
                  Password
                </label>
                <Link href="/help" className="text-[11px] text-saffron-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={requires2FA}
                />
              </div>
            </div>

            {/* 2FA Field for Administrative Roles */}
            {requires2FA && (
              <div className="rounded-lg border border-saffron-200 bg-saffron-50/60 p-4 space-y-2">
                <div className="flex items-center gap-2 text-saffron-900 font-bold text-xs">
                  <KeyRound className="h-4 w-4 text-saffron-600" />
                  <span>Administrative Two-Factor Code Required</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Enter the 6-digit code from Google Authenticator or use demo code <strong className="text-navy-900">123456</strong>.
                </p>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  className="tracking-widest text-center font-mono font-bold text-base"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            <Button
              type="submit"
              variant="saffron"
              size="lg"
              className="w-full justify-center font-semibold mt-2"
              isLoading={isLoading}
            >
              {requires2FA ? "Verify 2FA & Enter Portal" : "Sign In to Account"}
            </Button>
          </form>

          {/* Quick Demo Role Switcher */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Instant 1-Click Role Switcher (Evaluation Demo):
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickRoleSelect("superadmin@karyasetu.in")}
                className="rounded-lg border border-slate-200 p-2 text-left hover:border-navy-900 hover:bg-slate-50 transition-colors"
              >
                <div className="font-bold text-navy-900">Super Admin</div>
                <div className="text-[10px] text-slate-500">Root Governance</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect("finance@karyasetu.in")}
                className="rounded-lg border border-slate-200 p-2 text-left hover:border-emerald-600 hover:bg-emerald-50/50 transition-colors"
              >
                <div className="font-bold text-emerald-800">Finance Admin</div>
                <div className="text-[10px] text-slate-500">Ledger & Payouts</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect("client@kaveri.tech")}
                className="rounded-lg border border-slate-200 p-2 text-left hover:border-saffron-600 hover:bg-saffron-50/50 transition-colors"
              >
                <div className="font-bold text-navy-900">Client</div>
                <div className="text-[10px] text-slate-500">Kaveri Tech</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect("aditya@freelancer.in")}
                className="rounded-lg border border-slate-200 p-2 text-left hover:border-saffron-600 hover:bg-saffron-50/50 transition-colors"
              >
                <div className="font-bold text-navy-900">Freelancer</div>
                <div className="text-[10px] text-slate-500">Aditya (Verified)</div>
              </button>
            </div>
          </div>
        </Card>

        {/* Register Link */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="font-semibold text-saffron-700 hover:underline">
            Register as a Client or Freelancer
          </Link>
        </div>
      </div>
    </div>
  );
}
