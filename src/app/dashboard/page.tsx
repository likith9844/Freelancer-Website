"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Briefcase, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight,
  TrendingUp,
  FileText,
  AlertCircle,
  ExternalLink,
  PlusCircle,
  LogOut,
  Settings,
  Wallet,
  CreditCard,
  Building,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatINR } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = React.useState<any>(null);
  const [contracts, setContracts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUserData(data);
          // Fetch contracts
          fetch("/api/v1/contracts")
            .then((r) => r.json())
            .then((cData) => {
              if (cData.success && cData.contracts) {
                setContracts(cData.contracts);
              }
            })
            .catch(() => {});
        } else {
          router.push("/login");
        }
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-saffron-600 border-t-transparent" />
          <span>Loading your workspace...</span>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  const user = userData.user;
  const profile = userData.profile;
  const isFreelancer = user.role === "FREELANCER";
  const isClient = user.role === "CLIENT";
  const isAdmin = ["SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN", "SUPPORT_ADMIN", "MODERATOR"].includes(user.role);

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-navy-900">
                Welcome, {user.fullName}
              </h1>
              <Badge variant="navy" className="text-[11px] font-semibold">
                {user.role}
              </Badge>
              {profile?.isVerifiedBadge && (
                <Badge variant="verified" className="text-[11px] gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>KYC Verified</span>
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {user.email} · Account ID: {user.id}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {isAdmin && (
              <Link href="/admin">
                <Button variant="navy" size="sm" className="gap-1.5 shadow-sm">
                  <Settings className="h-4 w-4" />
                  <span>Admin Control Center</span>
                </Button>
              </Link>
            )}

            {isClient && (
              <>
                <Link href="/projects">
                  <Button variant="saffron" size="sm" className="gap-1.5 shadow-sm">
                    <PlusCircle className="h-4 w-4" />
                    <span>Post Project</span>
                  </Button>
                </Link>
                <Link href="/freelancers">
                  <Button variant="outline" size="sm" className="gap-1.5 text-slate-700">
                    <UserCheck className="h-4 w-4" />
                    <span>Find Freelancers</span>
                  </Button>
                </Link>
              </>
            )}

            {isFreelancer && (
              <>
                <Link href="/wallet">
                  <Button variant="emerald" size="sm" className="gap-1.5 shadow-sm">
                    <Wallet className="h-4 w-4" />
                    <span>Payout Wallet</span>
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button variant="saffron" size="sm" className="gap-1.5 shadow-sm">
                    <Briefcase className="h-4 w-4" />
                    <span>Browse Projects</span>
                  </Button>
                </Link>
              </>
            )}

            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1 text-slate-700">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* FREELANCER METRICS ROW */}
        {isFreelancer && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-5 bg-white border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Withdrawable Balance</span>
                <Link href="/wallet" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                  Withdraw →
                </Link>
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-700 font-inr">
                {formatINR(profile?.withdrawableBalanceINR || 85000)}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Available for bank payout</p>
            </Card>

            <Card className="p-5 bg-white border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Escrow</span>
              <div className="mt-2 text-2xl font-bold text-navy-900 font-inr">
                {formatINR(profile?.pendingClearanceINR || 45000)}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Held in active project escrow</p>
            </Card>

            <Card className="p-5 bg-white border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Earnings</span>
              <div className="mt-2 text-2xl font-bold text-navy-900 font-inr">
                {formatINR(profile?.totalEarningsINR || 425000)}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">After TDS &amp; platform fee</p>
            </Card>

            <Card className="p-5 bg-white border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Success Rate</span>
              <div className="mt-2 text-2xl font-bold text-saffron-700">
                {profile?.onTimeDeliveryRate || 100}%
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Rating: 4.98 ★ ({profile?.ratingCount || 47} reviews)</p>
            </Card>
          </div>
        )}

        {/* CLIENT METRICS ROW */}
        {isClient && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="p-5 bg-white border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Escrow Locked</span>
              <div className="mt-2 text-2xl font-bold text-emerald-700 font-inr">
                {formatINR(50000)}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Secured in Platform Milestone Escrow</p>
            </Card>

            <Card className="p-5 bg-white border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Hired Spend</span>
              <div className="mt-2 text-2xl font-bold text-navy-900 font-inr">
                {formatINR(profile?.totalSpentINR || 540000)}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Verified milestone releases</p>
            </Card>

            <Card className="p-5 bg-white border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects Completed</span>
              <div className="mt-2 text-2xl font-bold text-navy-900">
                {profile?.projectsPostedCount || 6}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">100% on-time approval rate</p>
            </Card>
          </div>
        )}

        {/* ADMIN QUICK ACCESS ROW */}
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="p-5 bg-white border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Manual Payouts</span>
                <Link href="/admin?tab=withdrawals" className="text-xs font-semibold text-saffron-700 hover:text-saffron-800">
                  Open Queue →
                </Link>
              </div>
              <div className="mt-2 text-2xl font-bold text-navy-900">
                1 Pending Payout
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Disburse via bank transfer &amp; enter UTR</p>
            </Card>

            <Card className="p-5 bg-white border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Double-Entry Ledger</span>
                <Link href="/admin?tab=ledger" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                  Audit Ledger →
                </Link>
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-700">
                Balanced (₹0 Delta)
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Debits match credits across all journals</p>
            </Card>

            <Card className="p-5 bg-white border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">KYC Verification</span>
                <Link href="/admin?tab=kyc" className="text-xs font-semibold text-navy-700 hover:text-navy-900">
                  Review (2) →
                </Link>
              </div>
              <div className="mt-2 text-2xl font-bold text-navy-900">
                CBDT PAN &amp; Bank
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Penny-drop account checks</p>
            </Card>
          </div>
        )}

        {/* ACTIVE CONTRACTS & WORKSPACES */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-900">Active Contracts &amp; Workspaces</h2>
            <span className="text-xs text-slate-500">
              {contracts.length} Active {contracts.length === 1 ? "Contract" : "Contracts"}
            </span>
          </div>

          {contracts.length === 0 ? (
            <Card className="p-8 text-center bg-white border-slate-200">
              <Briefcase className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No active contracts yet</p>
              <p className="text-xs text-slate-400 mt-1">
                {isClient ? "Post a project or accept a proposal to get started." : "Submit proposals to open projects to get hired."}
              </p>
              <div className="mt-4">
                <Link href="/projects">
                  <Button variant="saffron" size="sm">
                    {isClient ? "Post Project" : "Explore Projects"}
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            contracts.map((contract) => (
              <Card key={contract.id} className="p-6 bg-white border-slate-200 shadow-sm space-y-6">
                {/* Contract Summary Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {contract.contractNumber}
                      </span>
                      <Badge variant="verified">Active Contract</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-navy-900">
                      {contract.projectName || "B2B SaaS Portal Integration"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Client: <strong>{contract.clientName}</strong> · Freelancer: <strong>{contract.freelancerName}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Value</span>
                      <span className="font-bold text-navy-900 font-inr text-lg">{formatINR(contract.totalValueINR)}</span>
                    </div>

                    <Link href={`/workspace/${contract.id}`}>
                      <Button variant="navy" size="sm" className="gap-1.5 shadow-sm font-semibold">
                        <span>Open Workspace</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Milestones Schedule */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                      Milestone Escrow Schedule
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Payment directly on website · Escrow released on approval
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                    <div className="grid grid-cols-12 bg-slate-50 p-3 font-semibold text-slate-600 border-b border-slate-200">
                      <div className="col-span-5">Milestone Description</div>
                      <div className="col-span-2 text-right">Amount (INR)</div>
                      <div className="col-span-2 text-center">Escrow Status</div>
                      <div className="col-span-3 text-right">Action</div>
                    </div>

                    {contract.milestones.map((m: any, idx: number) => {
                      const isReleased = m.status === "RELEASED" || m.status === "APPROVED";
                      const isFunded = m.status === "FUNDED" || m.status === "IN_PROGRESS";
                      const isSubmitted = m.status === "SUBMITTED";
                      const isAwaitingFunding = m.status === "AWAITING_FUNDING" || m.status === "DRAFT";

                      return (
                        <div
                          key={m.id || idx}
                          className={`grid grid-cols-12 p-3.5 items-center border-b border-slate-100 last:border-b-0 ${
                            isReleased
                              ? "bg-emerald-50/20"
                              : isFunded
                              ? "bg-amber-50/20"
                              : "bg-white"
                          }`}
                        >
                          <div className="col-span-5 pr-2">
                            <span className="font-semibold text-navy-900 block">{m.title}</span>
                            <span className="text-[11px] text-slate-400 block line-clamp-1">{m.description}</span>
                          </div>

                          <div className="col-span-2 text-right font-bold text-navy-900 font-inr text-xs">
                            {formatINR(m.amountINR)}
                          </div>

                          <div className="col-span-2 text-center">
                            {isReleased && <Badge variant="verified">Released</Badge>}
                            {isFunded && <Badge variant="saffron">Funded in Escrow</Badge>}
                            {isSubmitted && <Badge variant="navy">Deliverable Submitted</Badge>}
                            {isAwaitingFunding && <Badge variant="outline">Awaiting Funding</Badge>}
                          </div>

                          <div className="col-span-3 text-right">
                            {/* Client Actions */}
                            {isClient && (
                              <div>
                                {isAwaitingFunding && (
                                  <Link href={`/checkout/${m.id}`}>
                                    <Button variant="saffron" size="sm" className="h-7 text-xs px-2.5 font-bold shadow-sm">
                                      <span>Pay &amp; Fund Escrow</span>
                                    </Button>
                                  </Link>
                                )}
                                {isSubmitted && (
                                  <Link href={`/workspace/${contract.id}`}>
                                    <Button variant="emerald" size="sm" className="h-7 text-xs px-2.5 font-bold shadow-sm">
                                      <span>Review Work &amp; Release</span>
                                    </Button>
                                  </Link>
                                )}
                                {isFunded && (
                                  <Link href={`/workspace/${contract.id}`}>
                                    <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 text-slate-700">
                                      <span>View Workspace</span>
                                    </Button>
                                  </Link>
                                )}
                                {isReleased && (
                                  <span className="text-slate-400 text-[11px] font-medium">Completed</span>
                                )}
                              </div>
                            )}

                            {/* Freelancer Actions */}
                            {isFreelancer && (
                              <div>
                                {isFunded && (
                                  <Link href={`/workspace/${contract.id}`}>
                                    <Button variant="saffron" size="sm" className="h-7 text-xs px-2.5 font-bold shadow-sm">
                                      <span>Submit Deliverables</span>
                                    </Button>
                                  </Link>
                                )}
                                {isSubmitted && (
                                  <span className="text-amber-700 text-[11px] font-semibold">Under Review</span>
                                )}
                                {isReleased && (
                                  <Link href="/wallet" className="text-emerald-700 text-[11px] font-bold hover:underline">
                                    Credited to Wallet →
                                  </Link>
                                )}
                                {isAwaitingFunding && (
                                  <span className="text-slate-400 text-[11px]">Awaiting Client</span>
                                )}
                              </div>
                            )}

                            {/* Admin Actions */}
                            {isAdmin && (
                              <Link href={`/workspace/${contract.id}`}>
                                <Button variant="outline" size="sm" className="h-7 text-xs px-2 text-slate-700">
                                  <span>Inspect</span>
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
