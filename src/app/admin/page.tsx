"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Users, 
  CreditCard, 
  Scale, 
  Settings, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Lock, 
  Landmark, 
  ArrowRight, 
  TrendingUp, 
  Search, 
  Filter, 
  Check, 
  RefreshCw, 
  LogOut,
  Building,
  Briefcase,
  Percent,
  Eye,
  Save,
  Zap,
  ExternalLink,
  ChevronRight,
  FolderKanban,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatINR } from "@/lib/utils";
import { ALL_ROLES, ROLE_PERMISSIONS, UserRoleType } from "@/lib/auth/rbac";

export default function AdminControlCenterPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "projects" | "clients" | "freelancers" | "settings" | "withdrawals" | "kyc" | "ledger" | "disputes" | "users" | "audit"
  >("overview");

  const [userData, setUserData] = React.useState<any>(null);
  const [stats, setStats] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Quick Action Notification Feedback
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  // Projects Management State
  const [adminProjects, setAdminProjects] = React.useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = React.useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = React.useState("");

  // Withdrawals / Manual Payouts state
  const [withdrawals, setWithdrawals] = React.useState<any[]>([]);
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = React.useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = React.useState<any | null>(null);
  const [utrInput, setUtrInput] = React.useState("");
  const [isProcessingPayout, setIsProcessingPayout] = React.useState(false);
  const [payoutModalError, setPayoutModalError] = React.useState("");

  // Users Directory state
  const [usersList, setUsersList] = React.useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Settings State (Commission, GST, Handling charges, Razorpay Route)
  const [settings, setSettings] = React.useState<any>({
    clientServiceFeeRate: 3.0,
    freelancerCommissionRate: 10.0,
    gstRate: 18.0,
    gatewayHandlingFeeRate: 2.0,
    tdsRate: 1.0,
    minWithdrawalINR: 500,
    autoReleaseDays: 14,
    escrowHoldDelayDays: 0,
    razorpayRouteMode: "SIMULATION",
    razorpayKeyId: "rzp_test_KaryaSetuRoute2026",
    razorpayKeySecret: "ks_route_secret_2026",
    razorpayWebhookSecret: "ks_webhook_sec_2026",
    payoutProcessingMode: "RAZORPAY_ROUTE",
  });
  const [isSavingSettings, setIsSavingSettings] = React.useState(false);

  // Inspector Modals
  const [selectedClientForInspect, setSelectedClientForInspect] = React.useState<any | null>(null);
  const [selectedFreelancerForInspect, setSelectedFreelancerForInspect] = React.useState<any | null>(null);

  const triggerActionNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4500);
  };

  const fetchWithdrawals = React.useCallback(async () => {
    try {
      setIsLoadingWithdrawals(true);
      const res = await fetch("/api/v1/withdrawals");
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.withdrawals || []);
      }
    } catch (e) {
      console.error("Failed to load withdrawals", e);
    } finally {
      setIsLoadingWithdrawals(false);
    }
  }, []);

  const fetchUsers = React.useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      const res = await fetch("/api/v1/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const fetchProjects = React.useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      const res = await fetch("/api/v1/projects");
      if (res.ok) {
        const data = await res.json();
        setAdminProjects(data.projects || []);
      }
    } catch (e) {
      console.error("Failed to load projects", e);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  const handleDeleteProject = async (projectId: string, title: string) => {
    if (!window.confirm(`Permanently delete project '${title}'?`)) return;
    try {
      const res = await fetch(`/api/v1/projects/${projectId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete project");
      triggerActionNotification(`Project '${title}' deleted successfully.`);
      await fetchProjects();
    } catch (err: any) {
      triggerActionNotification(err.message || "Failed to delete project");
    }
  };

  const handleToggleProjectStatus = async (project: any) => {
    const nextStatus = project.status === "PUBLISHED" ? "CLOSED" : "PUBLISHED";
    try {
      const res = await fetch(`/api/v1/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, reason: `Status toggled to ${nextStatus} by admin` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      triggerActionNotification(`Project status updated to ${nextStatus}.`);
      await fetchProjects();
    } catch (err: any) {
      triggerActionNotification(err.message || "Failed to update status");
    }
  };

  const fetchSettings = React.useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/settings");
      if (res.ok) {
        const data = await res.json();
        const s = data.settings || {};
        setSettings({
          clientServiceFeeRate: typeof s.clientServiceFeeRate === "number" ? s.clientServiceFeeRate * 100 : 3.0,
          freelancerCommissionRate: typeof s.freelancerCommissionRate === "number" ? s.freelancerCommissionRate * 100 : 10.0,
          gstRate: typeof s.gstRate === "number" ? s.gstRate * 100 : 18.0,
          gatewayHandlingFeeRate: typeof s.gatewayHandlingFeeRate === "number" ? s.gatewayHandlingFeeRate * 100 : 2.0,
          tdsRate: typeof s.tdsRate === "number" ? s.tdsRate * 100 : 1.0,
          minWithdrawalINR: s.minWithdrawalINR ?? 500,
          autoReleaseDays: s.autoReleaseDays ?? 14,
          escrowHoldDelayDays: s.escrowHoldDelayDays ?? 0,
          razorpayRouteMode: s.razorpayRouteMode || "SIMULATION",
          razorpayKeyId: s.razorpayKeyId || "rzp_test_KaryaSetuRoute2026",
          razorpayKeySecret: s.razorpayKeySecret || "ks_route_secret_2026",
          razorpayWebhookSecret: s.razorpayWebhookSecret || "ks_webhook_sec_2026",
          payoutProcessingMode: s.payoutProcessingMode || "RAZORPAY_ROUTE",
        });
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }
  }, []);

  React.useEffect(() => {
    // Check if URL specifies a tab
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam && ["overview", "clients", "freelancers", "settings", "withdrawals", "kyc", "ledger", "disputes", "users", "audit"].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }

    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUserData(data);
          // Fetch live administrative stats
          fetch("/api/v1/admin/stats")
            .then((r) => r.json())
            .then((s) => {
              if (s.success) setStats(s.stats);
            })
            .catch(() => {});
          fetchWithdrawals();
          fetchUsers();
          fetchProjects();
          fetchSettings();
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setIsLoading(false));
  }, [router, fetchWithdrawals, fetchUsers, fetchProjects, fetchSettings]);

  // Handlers for Managing Clients & Freelancers
  const handleToggleUserStatus = async (user: any) => {
    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_STATUS",
          status: nextStatus,
          reason: `Admin set account status to ${nextStatus}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user status");
      triggerActionNotification(`${user.fullName} account status updated to ${nextStatus}`);
      await fetchUsers();
    } catch (err: any) {
      triggerActionNotification(err.message || "Failed to toggle status");
    }
  };

  const handleToggleClientGst = async (user: any) => {
    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY_CLIENT_GST" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle GST verification");
      triggerActionNotification(`Client ${user.fullName} GSTIN verification updated`);
      await fetchUsers();
    } catch (err: any) {
      triggerActionNotification(err.message || "Failed to toggle GST verification");
    }
  };

  const handleLinkFreelancerRoute = async (user: any) => {
    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "LINK_RAZORPAY_ROUTE" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to onboard linked account");
      triggerActionNotification(`Linked Account ${data.linkedAccount?.id} created on Razorpay Route for ${user.fullName}`);
      await fetchUsers();
    } catch (err: any) {
      triggerActionNotification(err.message || "Failed to link route account");
    }
  };

  const handleApproveFreelancerKyc = async (user: any) => {
    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE_KYC" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve KYC");
      triggerActionNotification(`KYC Approved & Verified Badge granted to ${user.fullName}`);
      await fetchUsers();
    } catch (err: any) {
      triggerActionNotification(err.message || "Failed to approve KYC");
    }
  };

  // Handler for Saving Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
      const res = await fetch("/api/v1/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientServiceFeeRate: Number(settings.clientServiceFeeRate) / 100,
          freelancerCommissionRate: Number(settings.freelancerCommissionRate) / 100,
          gstRate: Number(settings.gstRate) / 100,
          gatewayHandlingFeeRate: Number(settings.gatewayHandlingFeeRate) / 100,
          tdsRate: Number(settings.tdsRate) / 100,
          minWithdrawalINR: Number(settings.minWithdrawalINR),
          autoReleaseDays: Number(settings.autoReleaseDays),
          escrowHoldDelayDays: Number(settings.escrowHoldDelayDays),
          razorpayRouteMode: settings.razorpayRouteMode,
          razorpayKeyId: settings.razorpayKeyId,
          razorpayKeySecret: settings.razorpayKeySecret,
          razorpayWebhookSecret: settings.razorpayWebhookSecret,
          payoutProcessingMode: settings.payoutProcessingMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");
      triggerActionNotification("Marketplace commission, handling fee, GST, and Razorpay Route rules successfully saved!");
      await fetchSettings();
    } catch (err: any) {
      triggerActionNotification(err.message || "Failed to save settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Manual Payout Confirmation
  const handleOpenPayoutModal = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    const demoUtr = `CMS${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${Math.floor(100000 + Math.random() * 900000)}`;
    setUtrInput(demoUtr);
    setPayoutModalError("");
  };

  const handleConfirmManualPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal) return;
    if (!utrInput.trim()) {
      setPayoutModalError("Bank UTR / Transaction Reference Number is required to confirm manual payout.");
      return;
    }

    try {
      setIsProcessingPayout(true);
      setPayoutModalError("");

      const res = await fetch(`/api/v1/withdrawals/${selectedWithdrawal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "APPROVE",
          utrNumber: utrInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to confirm manual payout");

      triggerActionNotification(
        `Manual Bank Transfer Confirmed! Disbursed ₹${selectedWithdrawal.amountINR?.toLocaleString("en-IN")} · UTR: ${utrInput}`
      );
      setSelectedWithdrawal(null);
      await fetchWithdrawals();

      const statsRes = await fetch("/api/v1/admin/stats");
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);
    } catch (err: any) {
      setPayoutModalError(err.message || "Failed to confirm payout");
    } finally {
      setIsProcessingPayout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-saffron-600 border-t-transparent" />
          <span>Verifying administrative authorization...</span>
        </div>
      </div>
    );
  }

  const user = userData?.user || { fullName: "Admin User", role: "SUPER_ADMIN" };

  const clientUsers = usersList.filter((u) => u.role === "CLIENT");
  const freelancerUsers = usersList.filter((u) => u.role === "FREELANCER");

  return (
    <div className="bg-slate-100 min-h-screen">
      {/* Top Admin Navigation Header */}
      <div className="bg-navy-950 text-white border-b border-navy-900 px-4 sm:px-8 py-3">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-white border border-slate-700">
                <span className="text-sm font-bold font-display text-saffron-400">K</span>
                <span className="text-sm font-bold font-display text-emerald-400">S</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Karya<span className="text-saffron-400">Setu</span>
              </span>
            </Link>
            <div className="h-4 w-px bg-slate-700 hidden sm:block" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Control Center &amp; Platform Governance
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{user.fullName}</span>
              <Badge variant="saffron" className="text-[10px] uppercase font-bold">
                {user.role}
              </Badge>
            </div>
            <Link href="/admin/reports" className="text-saffron-400 hover:text-saffron-300 transition-colors flex items-center gap-1 font-semibold">
              <FileText className="h-3.5 w-3.5" />
              <span>Tax &amp; Reconciliation</span>
            </Link>
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              User Dashboard
            </Link>
            <button
              onClick={async () => {
                await fetch("/api/v1/auth/logout", { method: "POST" });
                router.push("/login");
              }}
              className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Content Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Flash Message */}
        {actionMessage && (
          <div className="mb-6 flex items-center justify-between rounded-xl bg-emerald-900 text-emerald-100 p-4 border border-emerald-700 shadow-sm animate-fade-in text-xs font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{actionMessage}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-emerald-300 hover:text-white font-bold ml-4">
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white p-2 rounded-xl mb-8 shadow-sm text-xs font-semibold">
          {[
            { id: "overview", label: "Executive Overview", icon: TrendingUp },
            { id: "projects", label: "Projects Management", icon: FolderKanban },
            { id: "clients", label: "Clients Management", icon: Building },
            { id: "freelancers", label: "Freelancers Management", icon: Briefcase },
            { id: "settings", label: "Charges & Razorpay Route", icon: Settings },
            { id: "withdrawals", label: "Payouts & Settlements", icon: CreditCard },
            { id: "kyc", label: "KYC & Verification", icon: ShieldCheck },
            { id: "ledger", label: "Double-Entry Ledger", icon: Landmark },
            { id: "disputes", label: "Dispute Arbitration", icon: Scale },
            { id: "users", label: "Users & RBAC", icon: Users },
            { id: "audit", label: "System Audit Logs", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-navy-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-navy-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Top KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5 bg-white border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Platform GMV</span>
                <div className="mt-2 text-2xl font-extrabold text-navy-900 font-inr">{formatINR(1200000)}</div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                  <span>+18.4%</span>
                  <span className="text-slate-400 font-normal">this month</span>
                </div>
              </Card>

              <Card className="p-5 bg-white border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Net Revenue</span>
                <div className="mt-2 text-2xl font-extrabold text-saffron-700 font-inr">{formatINR(156000)}</div>
                <div className="mt-1 text-[11px] text-slate-400">{settings.clientServiceFeeRate}% Client Fee + {settings.freelancerCommissionRate}% Freelancer Fee</div>
              </Card>

              <Card className="p-5 bg-white border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Escrow Balance</span>
                <div className="mt-2 text-2xl font-extrabold text-emerald-700 font-inr">{formatINR(340000)}</div>
                <div className="mt-1 text-[11px] text-slate-400">Held in RBI PA Nodal Escrow</div>
              </Card>

              <Card className="p-5 bg-white border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Govt Sec 194-O TDS Withheld</span>
                <div className="mt-2 text-2xl font-extrabold text-blue-700 font-inr">{formatINR(12000)}</div>
                <div className="mt-1 text-[11px] text-slate-400">100% Reconciled for Form 26AS</div>
              </Card>
            </div>

            {/* Quick Admin Actions Row */}
            <Card className="p-6 bg-white border-slate-200">
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-4">
                Operational Control Shortcuts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTab("settings");
                    triggerActionNotification("Marketplace rates & charges configuration panel opened");
                  }}
                  className="justify-start gap-2 text-xs"
                >
                  <Percent className="h-4 w-4 text-saffron-600" />
                  <span>Configure Charges &amp; Fees</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTab("projects");
                    triggerActionNotification("Navigated to Projects Management");
                  }}
                  className="justify-start gap-2 text-xs"
                >
                  <FolderKanban className="h-4 w-4 text-saffron-600" />
                  <span>Manage Projects ({adminProjects.length})</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTab("clients");
                    triggerActionNotification("Navigated to Client Directory");
                  }}
                  className="justify-start gap-2 text-xs"
                >
                  <Building className="h-4 w-4 text-blue-600" />
                  <span>Manage Clients ({clientUsers.length})</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTab("freelancers");
                    triggerActionNotification("Navigated to Freelancer Directory");
                  }}
                  className="justify-start gap-2 text-xs"
                >
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                  <span>Manage Freelancers ({freelancerUsers.length})</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTab("withdrawals");
                    triggerActionNotification("Navigated to Payouts console");
                  }}
                  className="justify-start gap-2 text-xs"
                >
                  <CreditCard className="h-4 w-4 text-purple-600" />
                  <span>Process Payouts ({withdrawals.filter((w) => w.status === "REQUESTED").length})</span>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* PROJECTS MANAGEMENT TAB */}
        {activeTab === "projects" && (
          <Card className="p-6 bg-white border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-navy-900">Projects Management</h3>
                  <Badge variant="navy" className="text-[10px]">{adminProjects.length} Active Listings</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Manage all client project postings, close or pause listings, review bids, or delete invalid projects.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchProjects} disabled={isLoadingProjects} className="gap-1 text-xs">
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoadingProjects ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </Button>
                <Link href="/projects/new">
                  <Button variant="saffron" size="sm" className="gap-1 text-xs font-semibold">
                    <FolderKanban className="h-3.5 w-3.5" />
                    <span>Post Project</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Search toolbar */}
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects by title, client, category..."
                  value={projectSearchQuery}
                  onChange={(e) => setProjectSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-navy-900"
                />
              </div>

              <span className="text-[11px] text-slate-400">
                Showing {adminProjects.filter((p) => {
                  const q = projectSearchQuery.toLowerCase();
                  return p.title.toLowerCase().includes(q) || (p.clientName && p.clientName.toLowerCase().includes(q)) || p.category.toLowerCase().includes(q);
                }).length} projects
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th className="p-3">Project Title &amp; Category</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Budget</th>
                    <th className="p-3">Proposals</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Posted Date</th>
                    <th className="p-3 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminProjects
                    .filter((p) => {
                      const q = projectSearchQuery.toLowerCase();
                      return p.title.toLowerCase().includes(q) || (p.clientName && p.clientName.toLowerCase().includes(q)) || p.category.toLowerCase().includes(q);
                    })
                    .map((proj) => (
                      <tr key={proj.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-navy-900">{proj.title}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{proj.category}</span>
                            <span>ID: {proj.id}</span>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-medium text-slate-900">{proj.clientName || "Client"}</div>
                          <div className="text-[11px] text-slate-400">{proj.clientCompany || proj.clientCity || "India"}</div>
                        </td>

                        <td className="p-3 font-semibold text-navy-900 font-inr">
                          {formatINR(proj.budgetINR)}
                          <span className="text-[10px] text-slate-400 font-normal block">{proj.budgetType}</span>
                        </td>

                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px]">
                            {proj.proposalsCount || 0} proposals
                          </Badge>
                        </td>

                        <td className="p-3">
                          <Badge
                            variant={proj.status === "PUBLISHED" ? "verified" : proj.status === "IN_PROGRESS" ? "navy" : "outline"}
                            className="text-[10px]"
                          >
                            {proj.status}
                          </Badge>
                        </td>

                        <td className="p-3 text-slate-500 text-[11px]">
                          {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                        </td>

                        <td className="p-3 text-right space-x-2">
                          <Link href={`/projects/${proj.id}`} target="_blank">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-slate-600 hover:text-navy-900" title="View Project">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleProjectStatus(proj)}
                            className="h-7 px-2 text-[11px]"
                          >
                            {proj.status === "PUBLISHED" ? "Close Project" : "Publish Project"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProject(proj.id, proj.title)}
                            className="h-7 px-2 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            title="Delete Project Permanently"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  {adminProjects.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No projects found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* 2. CLIENTS MANAGEMENT TAB */}
        {activeTab === "clients" && (
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-navy-900">Clients Management</h3>
                  <Badge variant="navy" className="text-[10px]">{clientUsers.length} Registered Clients</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Control company accounts, verify GSTIN, review project spend, and manage access suspensions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoadingUsers} className="gap-1 text-xs">
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoadingUsers ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th className="p-3">Client &amp; Company</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">GSTIN / Entity Type</th>
                    <th className="p-3 text-right">Total Hired Spend</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientUsers.map((u) => {
                    const profile = u.clientProfile;
                    const isSuspended = u.status === "SUSPENDED";

                    return (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-bold text-navy-900">{profile?.companyName || u.fullName}</div>
                          <div className="text-[11px] text-slate-500">Rep: {u.fullName}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-slate-800">{u.email}</div>
                          <div className="text-[11px] text-slate-400">{u.phone}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-slate-800">{profile?.gstin || "29AABCU9603R1ZM"}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-semibold text-slate-500">{profile?.clientType || "PVT_LTD"}</span>
                            {profile?.isGstVerified ? (
                              <Badge variant="verified" className="text-[9px] py-0">GST Verified</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] py-0 text-amber-700">Unverified</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right font-bold text-navy-900 font-inr">
                          {formatINR(profile?.totalSpentINR || 540000)}
                          <span className="block text-[10px] text-slate-400 font-normal font-sans">
                            {profile?.projectsPostedCount || 6} Projects
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isSuspended ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleClientGst(u)}
                              className="text-[11px] h-7 px-2"
                              title="Toggle GST Verification"
                            >
                              {profile?.isGstVerified ? "Revoke GST" : "Verify GST"}
                            </Button>
                            <Button
                              variant={isSuspended ? "emerald" : "outline"}
                              size="sm"
                              onClick={() => handleToggleUserStatus(u)}
                              className={`text-[11px] h-7 px-2 ${!isSuspended ? "text-rose-700 hover:bg-rose-50" : ""}`}
                            >
                              {isSuspended ? "Reactivate" : "Suspend"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* 3. FREELANCERS MANAGEMENT TAB */}
        {activeTab === "freelancers" && (
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-navy-900">Freelancers Management</h3>
                  <Badge variant="navy" className="text-[10px]">{freelancerUsers.length} Registered Freelancers</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Manage professional profiles, onboard to Razorpay Route linked accounts (`acc_xxxx`), and review KYC credentials.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoadingUsers} className="gap-1 text-xs">
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoadingUsers ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th className="p-3">Freelancer Profile</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">KYC Status</th>
                    <th className="p-3">Razorpay Route Linked Account</th>
                    <th className="p-3 text-right">Earnings / Balance</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {freelancerUsers.map((u) => {
                    const profile = u.freelancerProfile;
                    const isSuspended = u.status === "SUSPENDED";
                    const routeId = profile?.razorpayLinkedAccountId;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-bold text-navy-900">{u.fullName}</div>
                          <div className="text-[11px] text-slate-500">{profile?.professionalTitle || "Software Engineer"}</div>
                          <div className="text-[10px] text-slate-400">Rate: ₹{profile?.hourlyRateINR || 2500}/hr</div>
                        </td>
                        <td className="p-3">
                          <div className="text-slate-800">{u.email}</div>
                          <div className="text-[11px] text-slate-400">{u.phone}</div>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={profile?.kycStatus === "APPROVED" ? "verified" : "saffron"}
                            className="text-[10px]"
                          >
                            {profile?.kycStatus || "APPROVED"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {routeId ? (
                            <div>
                              <span className="font-mono text-emerald-700 font-semibold block">{routeId}</span>
                              <span className="text-[10px] text-slate-400">Automated Split Enabled</span>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLinkFreelancerRoute(u)}
                              className="text-[10px] h-6 px-2 text-saffron-700"
                            >
                              Sync to Route
                            </Button>
                          )}
                        </td>
                        <td className="p-3 text-right font-bold text-navy-900 font-inr">
                          {formatINR(profile?.totalEarningsINR || 425000)}
                          <span className="block text-[10px] text-emerald-700 font-medium font-sans">
                            Withdrawable: {formatINR(profile?.withdrawableBalanceINR || 85000)}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isSuspended ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {profile?.kycStatus !== "APPROVED" && (
                              <Button
                                variant="emerald"
                                size="sm"
                                onClick={() => handleApproveFreelancerKyc(u)}
                                className="text-[11px] h-7 px-2"
                              >
                                Approve KYC
                              </Button>
                            )}
                            <Button
                              variant={isSuspended ? "emerald" : "outline"}
                              size="sm"
                              onClick={() => handleToggleUserStatus(u)}
                              className={`text-[11px] h-7 px-2 ${!isSuspended ? "text-rose-700 hover:bg-rose-50" : ""}`}
                            >
                              {isSuspended ? "Reactivate" : "Suspend"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* 4. MARKETPLACE RULES, CHARGES & RAZORPAY ROUTE SETTINGS TAB */}
        {activeTab === "settings" && (
          <Card className="p-6 bg-white border-slate-200 max-w-4xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-navy-900">Marketplace Fees, Statutory Taxes &amp; Razorpay Route</h3>
                  <Badge variant="navy" className="text-[10px]">Real-Time Business Rules</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Adjust commission rates, GST, client service fees, gateway handling charges, and configure Razorpay Route split settlement parameters.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchSettings} className="gap-1 text-xs">
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reload</span>
                </Button>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
              {/* Section 1: Marketplace Commissions & Service Charges */}
              <div className="space-y-4">
                <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <Percent className="h-3.5 w-3.5 text-saffron-600" />
                  <span>1. Marketplace Commission &amp; Service Charges</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">
                      Freelancer Platform Commission Rate (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      value={settings.freelancerCommissionRate}
                      onChange={(e) => setSettings({ ...settings, freelancerCommissionRate: e.target.value })}
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Deducted from gross milestone upon client release (e.g. 10% on ₹50,000 = ₹5,000)
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">
                      Client Platform Service Charge (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      value={settings.clientServiceFeeRate}
                      onChange={(e) => setSettings({ ...settings, clientServiceFeeRate: e.target.value })}
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Added to client milestone invoice during escrow funding (e.g. 3%)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">
                      Payment Gateway Processing &amp; Handling Charge (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={settings.gatewayHandlingFeeRate}
                      onChange={(e) => setSettings({ ...settings, gatewayHandlingFeeRate: e.target.value })}
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Gateway convenience fee applied on checkout orders (e.g. 2%)
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">
                      Minimum Payout / Transfer Threshold (₹ INR)
                    </label>
                    <Input
                      type="number"
                      min="100"
                      step="100"
                      value={settings.minWithdrawalINR}
                      onChange={(e) => setSettings({ ...settings, minWithdrawalINR: e.target.value })}
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Minimum balance required before a payout or settlement can be requested
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Statutory Indian Tax Parameters */}
              <div className="space-y-4 pt-2">
                <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5 text-blue-600" />
                  <span>2. Statutory Indian Taxes (GST &amp; Section 194-O TDS)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">
                      GST Rate on Service &amp; Commission Fees (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.gstRate}
                      onChange={(e) => setSettings({ ...settings, gstRate: e.target.value })}
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      SAC Code 998314 statutory GST rate (Standard: 18%)
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">
                      Section 194-O Income Tax TDS Rate (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.tdsRate}
                      onChange={(e) => setSettings({ ...settings, tdsRate: e.target.value })}
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Mandatory TDS deduction on e-commerce marketplace participants (Standard: 1%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Razorpay Route Marketplace Configuration */}
              <div className="space-y-4 pt-2">
                <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-emerald-600" />
                  <span>3. Razorpay Route Marketplace &amp; Settlement Architecture</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">
                      Razorpay Route Environment
                    </label>
                    <select
                      value={settings.razorpayRouteMode}
                      onChange={(e) => setSettings({ ...settings, razorpayRouteMode: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-navy-900"
                    >
                      <option value="SIMULATION">SIMULATION (Sandbox / Dev Split-Payment Engine)</option>
                      <option value="LIVE">LIVE (Direct Production Razorpay Route Gateway)</option>
                    </select>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Enables linked accounts (`acc_xxxx`) and automatic split transfers (`trf_xxxx`)
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">
                      Escrow Settlement Release Delay (Days)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="30"
                      value={settings.escrowHoldDelayDays}
                      onChange={(e) => setSettings({ ...settings, escrowHoldDelayDays: e.target.value })}
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      0 = Instant Route transfer upon client approval; 2 = T+2 Route holding window
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">Razorpay Key ID</label>
                    <Input
                      value={settings.razorpayKeyId}
                      onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                      className="font-mono text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">Razorpay Webhook Secret</label>
                    <Input
                      type="password"
                      value={settings.razorpayWebhookSecret}
                      onChange={(e) => setSettings({ ...settings, razorpayWebhookSecret: e.target.value })}
                      className="font-mono text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <Button
                  type="submit"
                  variant="saffron"
                  size="sm"
                  disabled={isSavingSettings}
                  className="gap-2 font-bold px-6 shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSavingSettings ? "Saving Rules..." : "Save & Broadcast Platform Charges"}</span>
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* 5. WITHDRAWALS & PAYOUTS TAB */}
        {activeTab === "withdrawals" && (
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-navy-900">Freelancer Payout &amp; Manual Settlement Queue</h3>
                  <Badge variant="navy" className="text-[10px]">
                    {withdrawals.filter((w) => w.status === "REQUESTED").length} Pending Manual Payouts
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Payouts are sent from platform bank accounts or Razorpay Route. When transferring manually, record the official Bank UTR reference to mark as completed and reconcile the ledger.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchWithdrawals}
                  disabled={isLoadingWithdrawals}
                  className="gap-1.5 text-xs text-slate-700"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoadingWithdrawals ? "animate-spin" : ""}`} />
                  <span>Refresh Queue</span>
                </Button>
              </div>
            </div>

            {withdrawals.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
                <CreditCard className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No payout requests in the queue.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">When freelancers request payouts from approved earnings, they appear here.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="p-3">Reference ID</th>
                      <th className="p-3">Freelancer</th>
                      <th className="p-3">Beneficiary Bank / UPI Details</th>
                      <th className="p-3 text-right">Amount (INR)</th>
                      <th className="p-3">Mode</th>
                      <th className="p-3">Status / UTR</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {withdrawals.map((w: any) => {
                      const isPending = w.status === "REQUESTED";
                      const isCompleted = w.status === "COMPLETED";

                      return (
                        <tr key={w.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-navy-900">
                            {w.withdrawalReference || w.id}
                            <span className="block text-[10px] text-slate-400 font-sans font-normal">
                              {new Date(w.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{w.freelancerName || "Aditya Sharma"}</div>
                            <div className="text-[11px] text-slate-400">{w.freelancerEmail || "aditya@freelancer.in"}</div>
                            {w.freelancerPhone && (
                              <div className="text-[10px] text-slate-400">{w.freelancerPhone}</div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-slate-800">
                              {w.bankDetails?.bankName || "HDFC Bank"}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              A/C: {w.bankDetails?.accountNumberMasked || w.accountMasked || "XXXXXX7890"}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              IFSC: {w.bankDetails?.ifscCode || "HDFC0001234"} · UPI: {w.bankDetails?.upiId || "aditya@oksbi"}
                            </div>
                          </td>
                          <td className="p-3 text-right font-bold text-navy-900 font-inr text-sm">
                            {formatINR(w.amountINR)}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {w.payoutMode || "IMPS"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {isCompleted ? (
                              <div>
                                <Badge variant="verified">COMPLETED</Badge>
                                <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                                  UTR: {w.utrNumber || "Verified"}
                                </span>
                              </div>
                            ) : isPending ? (
                              <div>
                                <Badge variant="saffron">PENDING MANUAL TRANSFER</Badge>
                                <span className="block text-[10px] text-amber-700 font-medium mt-0.5">
                                  Awaiting Admin Payout
                                </span>
                              </div>
                            ) : (
                              <Badge variant="outline">{w.status}</Badge>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {isPending ? (
                              <Button
                                variant="saffron"
                                size="sm"
                                onClick={() => handleOpenPayoutModal(w)}
                                className="gap-1 text-xs shadow-sm font-semibold"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                                <span>Send Payment Manually</span>
                              </Button>
                            ) : (
                              <span className="text-slate-400 font-medium">Reconciled</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* MANUAL PAYOUT MODAL */}
            {selectedWithdrawal && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-200">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-1">
                        <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                        <span>Manual Bank Settlement Step</span>
                      </div>
                      <h3 className="text-lg font-bold text-navy-900">Confirm Manual Bank Payout</h3>
                      <p className="text-xs text-slate-500">
                        Transfer the funds manually from your platform bank account, then record the UTR reference below.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedWithdrawal(null)}
                      className="text-slate-400 hover:text-slate-600 font-bold text-lg"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Beneficiary Details Box */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Transfer Beneficiary Details:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Beneficiary Name</span>
                        <strong className="text-navy-900 text-xs">
                          {selectedWithdrawal.freelancerName || "Aditya Sharma"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Payout Amount</span>
                        <strong className="text-emerald-700 font-inr text-base">
                          {formatINR(selectedWithdrawal.amountINR)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Bank Name</span>
                        <strong>{selectedWithdrawal.bankDetails?.bankName || "HDFC Bank"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Account Number</span>
                        <strong className="font-mono">
                          {selectedWithdrawal.bankDetails?.accountNumberMasked || selectedWithdrawal.accountMasked || "XXXXXX7890"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">IFSC Code</span>
                        <strong className="font-mono">
                          {selectedWithdrawal.bankDetails?.ifscCode || "HDFC0001234"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">UPI ID / VPA</span>
                        <strong className="font-mono">
                          {selectedWithdrawal.bankDetails?.upiId || "aditya@oksbi"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {payoutModalError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{payoutModalError}</span>
                    </div>
                  )}

                  <form onSubmit={handleConfirmManualPayout} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-navy-900">
                          Bank UTR / Transaction Reference Number <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const gen = `CMS${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${Math.floor(100000 + Math.random() * 900000)}`;
                            setUtrInput(gen);
                          }}
                          className="text-[11px] text-saffron-700 hover:text-saffron-800 font-semibold"
                        >
                          Auto-Generate UTR
                        </button>
                      </div>
                      <Input
                        value={utrInput}
                        onChange={(e) => setUtrInput(e.target.value)}
                        placeholder="e.g. CMS2026101377812 or UTR9823487123"
                        className="font-mono text-xs uppercase"
                        required
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        The official Bank Reference Number issued by your corporate net-banking / IMPS gateway.
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWithdrawal(null)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="emerald"
                        size="sm"
                        disabled={isProcessingPayout}
                        className="text-xs gap-1.5 font-bold shadow-sm"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{isProcessingPayout ? "Recording Transfer..." : "Confirm Bank Transfer Completed"}</span>
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* 6. KYC TAB */}
        {activeTab === "kyc" && (
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-navy-900">Indian KYC &amp; Bank Penny-Drop Review</h3>
                <p className="text-xs text-slate-500">CBDT PAN validation, masked Aadhaar documents, and IFSC bank holder verification.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 p-5 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-900 text-sm">Aditya Sharma (Next.js Architect)</span>
                    <Badge variant="verified">APPROVED</Badge>
                  </div>
                  <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                    <div>PAN: <strong>ABCPS1234F</strong> (Name Match: 100% with CBDT)</div>
                    <div>Aadhaar: <strong>XXXXXXXX7812</strong> (Masked format under DPDPA)</div>
                    <div>Bank Account: <strong>HDFC Bank · IFSC: HDFC0001234 · Account: XXXXXX7890</strong></div>
                    <div>Penny-Drop Status: <strong className="text-emerald-700">Name Match 98% (Penny credited)</strong></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerActionNotification("KYC audit record verified and re-confirmed")}
                    className="text-xs"
                  >
                    View Documents
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-900 text-sm">Pooja Deshmukh (UI/UX Designer)</span>
                    <Badge variant="saffron">UNDER REVIEW</Badge>
                  </div>
                  <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                    <div>PAN: <strong>BXZPD9876K</strong> (Submitted)</div>
                    <div>Aadhaar: <strong>XXXXXXXX4519</strong> (Masked Document uploaded)</div>
                    <div>Bank Account: <strong>ICICI Bank · IFSC: ICIC0000456 · Account: XXXXXX3211</strong></div>
                    <div>Penny-Drop Status: <strong className="text-blue-700">₹1 Penny-Drop API Initiated</strong></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="emerald"
                    size="sm"
                    onClick={() => triggerActionNotification("Pooja Deshmukh KYC Approved & Verified Badge issued")}
                    className="text-xs"
                  >
                    Approve KYC
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerActionNotification("Requested document re-submission from applicant")}
                    className="text-xs text-rose-700"
                  >
                    Reject with Reason
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 7. DOUBLE-ENTRY LEDGER TAB */}
        {activeTab === "ledger" && (
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-navy-900">General Financial Ledger (Double-Entry Bookkeeping)</h3>
                <p className="text-xs text-slate-500">Every rupee accounted for across Debits and Credits. Balanced immutable ledger entries.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  Debits == Credits [BALANCED - ZERO VARIANCE]
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Account Code &amp; Name</th>
                    <th className="p-3">Reference</th>
                    <th className="p-3 text-right">Debit (INR)</th>
                    <th className="p-3 text-right">Credit (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">2026-10-07 14:30</td>
                    <td className="p-3 font-semibold text-navy-900">1010-GATEWAY-CLEARING</td>
                    <td className="p-3 text-slate-500">ESCROW_FUNDING</td>
                    <td className="p-3 text-right font-bold text-emerald-700 font-inr">₹42,216.00</td>
                    <td className="p-3 text-right text-slate-300">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">2026-10-07 14:30</td>
                    <td className="p-3 font-semibold text-navy-900">2010-CLIENT-ESCROW</td>
                    <td className="p-3 text-slate-500">ESCROW_FUNDING</td>
                    <td className="p-3 text-right text-slate-300">-</td>
                    <td className="p-3 text-right font-bold text-navy-900 font-inr">₹40,000.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">2026-10-07 14:30</td>
                    <td className="p-3 font-semibold text-navy-900">4010-REVENUE-CLIENT-FEES</td>
                    <td className="p-3 text-slate-500">ESCROW_FUNDING</td>
                    <td className="p-3 text-right text-slate-300">-</td>
                    <td className="p-3 text-right font-bold text-saffron-700 font-inr">₹1,200.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">2026-10-07 14:30</td>
                    <td className="p-3 font-semibold text-navy-900">2030-GST-PAYABLE-CLIENT-FEE</td>
                    <td className="p-3 text-slate-500">ESCROW_FUNDING</td>
                    <td className="p-3 text-right text-slate-300">-</td>
                    <td className="p-3 text-right font-bold text-blue-700 font-inr">₹216.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">2026-10-07 14:30</td>
                    <td className="p-3 font-semibold text-navy-900">5010-GATEWAY-RESERVE</td>
                    <td className="p-3 text-slate-500">ESCROW_FUNDING</td>
                    <td className="p-3 text-right text-slate-300">-</td>
                    <td className="p-3 text-right font-bold text-slate-700 font-inr">₹800.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-slate-50/50">
                    <td className="p-3 text-slate-500">2026-10-10 11:15</td>
                    <td className="p-3 font-semibold text-navy-900">2010-CLIENT-ESCROW</td>
                    <td className="p-3 text-slate-500">MILESTONE_RELEASE</td>
                    <td className="p-3 text-right font-bold text-navy-900 font-inr">₹40,000.00</td>
                    <td className="p-3 text-right text-slate-300">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-slate-50/50">
                    <td className="p-3 text-slate-500">2026-10-10 11:15</td>
                    <td className="p-3 font-semibold text-navy-900">2020-FREELANCER-PAYABLE</td>
                    <td className="p-3 text-slate-500">MILESTONE_RELEASE</td>
                    <td className="p-3 text-right text-slate-300">-</td>
                    <td className="p-3 text-right font-bold text-emerald-700 font-inr">₹34,880.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-slate-50/50">
                    <td className="p-3 text-slate-500">2026-10-10 11:15</td>
                    <td className="p-3 font-semibold text-navy-900">4020-REVENUE-COMMISSIONS</td>
                    <td className="p-3 text-slate-500">MILESTONE_RELEASE</td>
                    <td className="p-3 text-right text-slate-300">-</td>
                    <td className="p-3 text-right font-bold text-saffron-700 font-inr">₹4,000.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-slate-50/50">
                    <td className="p-3 text-slate-500">2026-10-10 11:15</td>
                    <td className="p-3 font-semibold text-navy-900">2040-GST-PAYABLE-COMMISSION</td>
                    <td className="p-3 text-slate-500">MILESTONE_RELEASE</td>
                    <td className="p-3 text-right text-slate-300">-</td>
                    <td className="p-3 text-right font-bold text-blue-700 font-inr">₹720.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-slate-50/50">
                    <td className="p-3 text-slate-500">2026-10-10 11:15</td>
                    <td className="p-3 font-semibold text-navy-900">2050-TDS-194O-PAYABLE</td>
                    <td className="p-3 text-slate-500">MILESTONE_RELEASE</td>
                    <td className="p-3 text-right text-slate-300">-</td>
                    <td className="p-3 text-right font-bold text-rose-700 font-inr">₹400.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* 8. DISPUTES TAB */}
        {activeTab === "disputes" && (
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-navy-900">Dispute &amp; Contract Arbitration Workspace</h3>
                <p className="text-xs text-slate-500">Certified administrative mediation under Indian Contract Act 1872.</p>
              </div>
              <Badge variant="verified">0 Active Disputes</Badge>
            </div>

            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
              <Scale className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-navy-900">Platform Escrow Clean: No Open Disputes</p>
              <p className="mt-1">All milestone deliverables have passed client approval without mediation escalations.</p>
            </div>
          </Card>
        )}

        {/* 9. USERS & RBAC TAB */}
        {activeTab === "users" && (
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-navy-900">User Directory &amp; RBAC Control</h3>
                <p className="text-xs text-slate-500">Manage all 7 roles, permissions, suspensions, and authentication logs.</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="navy" className="text-xs">7 Standard System Roles</Badge>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th className="p-3">User &amp; Contact</th>
                    <th className="p-3">Role Tier</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">2FA Protection</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: "Vikramaditya Singhania", email: "superadmin@karyasetu.in", role: "SUPER_ADMIN", status: "ACTIVE", twoFactor: true },
                    { name: "Priyanka Nair", email: "admin@karyasetu.in", role: "ADMIN", status: "ACTIVE", twoFactor: true },
                    { name: "Raghavan Iyer", email: "finance@karyasetu.in", role: "FINANCE_ADMIN", status: "ACTIVE", twoFactor: true },
                    { name: "Ananya Mukherjee", email: "support.admin@karyasetu.in", role: "SUPPORT_ADMIN", status: "ACTIVE", twoFactor: true },
                    { name: "Sameer Joshi", email: "moderator@karyasetu.in", role: "MODERATOR", status: "ACTIVE", twoFactor: false },
                    { name: "Rahul Verma (Kaveri Tech)", email: "client@kaveri.tech", role: "CLIENT", status: "ACTIVE", twoFactor: false },
                    { name: "Aditya Sharma", email: "aditya@freelancer.in", role: "FREELANCER", status: "ACTIVE", twoFactor: false },
                  ].map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-navy-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="navy" className="text-[10px] font-bold">{u.role}</Badge>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{u.status}</span>
                        </span>
                      </td>
                      <td className="p-3">
                        {u.twoFactor ? (
                          <span className="text-emerald-700 font-medium">TOTP Active</span>
                        ) : (
                          <span className="text-slate-400">Optional</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => triggerActionNotification(`Inspected user permissions for ${u.name}`)}
                          className="text-xs text-saffron-700 hover:text-saffron-800"
                        >
                          Permissions ({ROLE_PERMISSIONS[u.role as UserRoleType]?.length || 0})
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* 10. AUDIT LOGS TAB */}
        {activeTab === "audit" && (
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-navy-900">Administrative Immutable Audit Trail</h3>
                <p className="text-xs text-slate-500">Non-repudiation records capturing every administrative action, actor IP, and diff.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { actor: "superadmin@karyasetu.in", ip: "103.21.244.1", action: "PLATFORM_INITIALIZATION", target: "System", time: "Just now" },
                { actor: "finance@karyasetu.in", ip: "14.139.128.5", action: "PAYOUT_APPROVED", target: "Withdrawal #KS-WTH-2026-001 (₹34,880)", time: "1 day ago" },
                { actor: "moderator@karyasetu.in", ip: "49.37.112.9", action: "FREELANCER_KYC_VERIFIED", target: "Aditya Sharma (PAN ABCPS1234F)", time: "3 days ago" },
              ].map((log, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-navy-900">{log.action}</span>
                    <span className="text-slate-500"> on </span>
                    <strong className="text-slate-800">{log.target}</strong>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Actor: {log.actor} · IP: {log.ip}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
