"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Briefcase, 
  Menu, 
  X, 
  Bell, 
  Wallet,
  LogOut,
  User,
  LayoutDashboard,
  ShieldCheck,
  PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [unreadCount, setUnreadCount] = React.useState<number>(0);
  const pathname = usePathname();
  const router = useRouter();

  // Load authenticated user and unread notifications on mount & path changes
  const checkAuth = React.useCallback(async () => {
    try {
      const res = await fetch("/api/v1/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          // Fetch notifications count
          fetch("/api/v1/notifications")
            .then((r) => r.json())
            .then((n) => {
              if (n.success) setUnreadCount(n.unreadCount || 0);
            })
            .catch(() => {});
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  }, []);

  React.useEffect(() => {
    checkAuth();

    if (typeof window !== "undefined") {
      const handleAuthChanged = () => checkAuth();
      window.addEventListener("auth-changed", handleAuthChanged);
      window.addEventListener("focus", handleAuthChanged);
      return () => {
        window.removeEventListener("auth-changed", handleAuthChanged);
        window.removeEventListener("focus", handleAuthChanged);
      };
    }
  }, [pathname, checkAuth]);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      setCurrentUser(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
        window.location.href = "/login";
      } else {
        router.push("/login");
      }
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  const navLinks = [
    { name: "Find Freelancers", href: "/freelancers" },
    { name: "Browse Projects", href: "/projects" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Pricing", href: "/pricing" },
  ];

  const isAdmin = currentUser && [
    "SUPER_ADMIN",
    "ADMIN",
    "FINANCE_ADMIN",
    "SUPPORT_ADMIN",
    "MODERATOR",
  ].includes(currentUser.role);

  const isClient = currentUser?.role === "CLIENT";
  const isFreelancer = currentUser?.role === "FREELANCER";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Left Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-white shadow-sm">
              <span className="text-lg font-bold font-display text-saffron-400">K</span>
              <span className="text-lg font-bold font-display text-emerald-400">S</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-navy-900">
                Karya<span className="text-saffron-600">Setu</span>
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 -mt-1">
                Freelancing For India
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                    isActive
                      ? "text-saffron-700 bg-saffron-50"
                      : "text-slate-600 hover:text-navy-950 hover:bg-slate-100"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Area: Dynamic Auth State */}
        <div className="hidden md:flex items-center space-x-3">
          {currentUser ? (
            /* Logged In View */
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Link
                href="/notifications"
                className="p-2 text-slate-600 hover:text-navy-950 hover:bg-slate-100 rounded-lg transition-colors relative"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-saffron-500 ring-2 ring-white animate-pulse" />
                )}
              </Link>

              {/* Freelancer Wallet */}
              {isFreelancer && (
                <Link
                  href="/wallet"
                  className="p-2 text-slate-600 hover:text-navy-950 hover:bg-slate-100 rounded-lg transition-colors"
                  title="My Wallet & Payouts"
                >
                  <Wallet className="h-4 w-4 text-emerald-600" />
                </Link>
              )}

              {/* Primary Role Action */}
              {isClient && (
                <Link href="/projects/new">
                  <Button variant="saffron" size="sm" className="gap-1.5 shadow-sm text-xs py-1.5 h-8">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Post Project</span>
                  </Button>
                </Link>
              )}

              {/* User Dashboard / Admin Pill */}
              <Link
                href={isAdmin ? "/admin" : "/dashboard"}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-navy-950 transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-[10px] font-bold text-white uppercase">
                  {currentUser.fullName ? currentUser.fullName.charAt(0) : "U"}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold leading-tight text-navy-950">
                    {currentUser.fullName || currentUser.email.split("@")[0]}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 leading-tight">
                    {currentUser.role.replace("_", " ")}
                  </span>
                </div>
              </Link>

              {/* Sign Out */}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* Logged Out View */
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs text-slate-700 hover:text-navy-950">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="navy" size="sm" className="text-xs shadow-sm">
                  Join Free
                </Button>
              </Link>
              <div className="h-4 w-px bg-slate-200 mx-1" />
              <Link href="/projects/new">
                <Button variant="saffron" size="sm" className="text-xs gap-1.5 shadow-sm">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Post a Project</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          {currentUser && (
            <Link
              href="/notifications"
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-saffron-500" />
              )}
            </Link>
          )}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {currentUser ? (
            <div className="p-3 bg-slate-50 rounded-xl mb-3 border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-navy-950 text-sm">
                    {currentUser.fullName}
                  </div>
                  <div className="text-xs text-slate-500">{currentUser.email}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-navy-900 text-white">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : null}

          <div className="space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-800 rounded-md hover:bg-slate-50"
            >
              Dashboard
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-navy-900 font-bold rounded-md hover:bg-slate-50"
              >
                Admin Control Center
              </Link>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-800 rounded-md hover:bg-slate-50"
              >
                {link.name}
              </Link>
            ))}
            {isFreelancer && (
              <Link
                href="/wallet"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-emerald-800 rounded-md hover:bg-emerald-50"
              >
                My Wallet &amp; Payouts
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {!currentUser ? (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center text-xs">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="navy" className="w-full justify-center text-xs">
                    Join Free
                  </Button>
                </Link>
              </>
            ) : null}
            <Link href="/projects/new" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="saffron" className="w-full justify-center gap-2 text-xs">
                <PlusCircle className="h-4 w-4" />
                <span>Post a Project</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
