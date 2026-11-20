"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Trash2,
  Check,
  DollarSign,
  Package,
  FileText,
  Filter,
} from "lucide-react";

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "MILESTONE_FUNDED" | "DELIVERABLE_SUBMITTED" | "PAYMENT_RELEASED" | "DISPUTE_RAISED" | "SYSTEM";
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "ESCROW" | "DISPUTE">("ALL");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/v1/notifications", { method: "POST" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setMessage("All notifications marked as read.");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkSingleRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/v1/notifications/${id}`, { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/v1/notifications/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "UNREAD") return !item.isRead;
    if (filter === "ESCROW")
      return item.type === "MILESTONE_FUNDED" || item.type === "PAYMENT_RELEASED";
    if (filter === "DISPUTE") return item.type === "DISPUTE_RAISED";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getTypeBadge = (type: NotificationItem["type"]) => {
    switch (type) {
      case "MILESTONE_FUNDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Escrow Funded
          </span>
        );
      case "PAYMENT_RELEASED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <DollarSign className="w-3.5 h-3.5 text-green-600" />
            Payment Released
          </span>
        );
      case "DELIVERABLE_SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            Deliverables Submitted
          </span>
        );
      case "DISPUTE_RAISED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Arbitration / Dispute
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            Platform Alert
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-saffron-100 text-saffron-700 rounded-xl">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-navy-950">
                    Notifications &amp; Activity Alerts
                  </h1>
                  <p className="text-sm text-slate-500">
                    RBI Nodal escrow updates, milestone progress, and Indian regulatory alerts.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-navy-900 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <Check className="w-4 h-4 text-emerald-600" />
                  Mark All as Read ({unreadCount})
                </button>
              )}
            </div>
          </div>

          {message && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {/* Filters */}
          <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>
            {(
              [
                { label: `All (${notifications.length})`, value: "ALL" },
                { label: `Unread (${unreadCount})`, value: "UNREAD" },
                { label: "Escrow & Payments", value: "ESCROW" },
                { label: "Disputes", value: "DISPUTE" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === tab.value
                    ? "bg-navy-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-200">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-saffron-500" />
              <p>Loading your notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-200">
              <Bell className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <h3 className="font-semibold text-slate-700">No notifications found</h3>
              <p className="text-sm text-slate-500 mt-1">
                {filter === "UNREAD"
                  ? "You have caught up with all alerts!"
                  : "All quiet. You will receive real-time alerts when milestone events occur."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`group relative bg-white rounded-xl p-5 border transition-all ${
                  notif.isRead
                    ? "border-slate-200 hover:border-slate-300"
                    : "border-saffron-300 bg-saffron-50/20 shadow-sm"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getTypeBadge(notif.type)}
                      {!notif.isRead && (
                        <span className="inline-block w-2 h-2 rounded-full bg-saffron-500" />
                      )}
                      <span className="text-xs text-slate-400">
                        {new Date(notif.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    <h3 className="font-semibold text-navy-950 text-base">
                      {notif.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {notif.linkUrl && (
                      <Link
                        href={notif.linkUrl}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-navy-900 text-white hover:bg-navy-800 transition-colors"
                      >
                        <span>View</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {!notif.isRead && (
                      <button
                        onClick={(e) => handleMarkSingleRead(notif.id, e)}
                        title="Mark as Read"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDeleteNotification(notif.id, e)}
                      title="Delete notification"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
