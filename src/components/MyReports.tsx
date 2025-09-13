import React, { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import ProtectedRoute from "./auth/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

interface MyReportsProps {
  onNavigate: (tab: string) => void;
  onAuthRequired: () => void;
}

type ReportDoc = {
  id: string;
  title: string;
  category: string;
  location?: {
    address?: string;
  };
  status: "pending" | "in-progress" | "resolved" | "review" | string;
  createdAt?: Timestamp;
};

const categoryEmoji: Record<string, string> = {
  roads: "🛣️",
  lighting: "💡",
  waste: "🗑️",
  utilities: "💧",
  parks: "🌳",
  safety: "🛡️",
};

const statusBadge = (status: string) => {
  if (status === "resolved")
    return {
      label: "Resolved",
      badge: "bg-emerald-100 text-emerald-800",
      icon: "✅",
      progress: 100,
      bar: "bg-emerald-500",
    };
  if (status === "review")
    return {
      label: "Review",
      badge: "bg-amber-100 text-amber-800",
      icon: "⏳",
      progress: 60,
      bar: "bg-amber-500",
    };
  if (status === "in-progress")
    return {
      label: "In Progress",
      badge: "bg-blue-100 text-blue-800",
      icon: "🔧",
      progress: 40,
      bar: "bg-blue-500",
    };
  return {
    label: "Pending",
    badge: "bg-gray-100 text-gray-800",
    icon: "📋",
    progress: 20,
    bar: "bg-gray-500",
  };
};

const timeAgo = (date?: Date) => {
  if (!date) return "just now";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  return `${days} days ago`;
};

const MyReports: React.FC<MyReportsProps> = ({
  onNavigate,
  onAuthRequired,
}) => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<
    "all" | "pending" | "resolved" | "review" | "in-progress"
  >("all");
  const [reports, setReports] = useState<ReportDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setReports([]);
      setLoading(false);
      return;
    }

    console.log("Setting up query for user:", user.uid);

    // Simplified query - only filter by userId (no orderBy to avoid index requirement)
    const q = query(collection(db, "reports"), where("userId", "==", user.uid));

    const unsub = onSnapshot(
      q,
      (snap) => {
        console.log("Query snapshot received, docs count:", snap.docs.length);

        const list: ReportDoc[] = snap.docs.map((d) => {
          const data = d.data();
          console.log("Report data:", { id: d.id, ...data });

          return {
            id: d.id,
            title: data.title || "Untitled Report",
            category: data.category || "general",
            location: data.location || {},
            status: data.status || "pending",
            createdAt: data.createdAt,
          };
        });

        // Sort by createdAt in JavaScript (newest first)
        list.sort((a, b) => {
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;

          return b.createdAt.toMillis() - a.createdAt.toMillis();
        });

        console.log("Sorted reports:", list);
        setReports(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Query error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      console.log("Unsubscribing from query");
      unsub();
    };
  }, [user?.uid]);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return reports;
    return reports.filter(
      (r) => (r.status || "pending").toLowerCase() === activeFilter
    );
  }, [reports, activeFilter]);

  const counts = useMemo(() => {
    const total = reports.length;
    const resolved = reports.filter(
      (r) => (r.status || "").toLowerCase() === "resolved"
    ).length;
    const pending = reports.filter(
      (r) => (r.status || "").toLowerCase() === "pending"
    ).length;
    const inProgress = reports.filter(
      (r) => (r.status || "").toLowerCase() === "in-progress"
    ).length;
    const review = reports.filter(
      (r) => (r.status || "").toLowerCase() === "review"
    ).length;

    return { total, resolved, pending, inProgress, review };
  }, [reports]);

  const filters = [
    { id: "all", label: `All (${counts.total})` },
    { id: "pending", label: `Pending (${counts.pending})` },
    { id: "resolved", label: `Resolved (${counts.resolved})` },
  ];

  return (
    <ProtectedRoute
      onAuthRequired={onAuthRequired}
      message="Sign in to view your reports"
    >
      <section className="px-4 pt-6 pb-12">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-h2 font-semibold text-accent">My Reports</h1>
              <p className="text-sm text-text-secondary">
                {counts.total} reports • {counts.resolved} resolved
              </p>
            </div>
            <button
              onClick={() => onNavigate("report")}
              className="bg-accent text-white p-3 rounded-xl hover:opacity-95 transition-opacity"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeFilter === filter.id
                    ? "bg-accent text-white"
                    : "bg-subtle text-text-secondary hover:bg-borders"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center text-red-600 py-8">
              <p>Error loading reports: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-accent hover:underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && !error && (
            <div className="text-center text-text-secondary py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
              <p>Loading reports...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center text-text-secondary py-12">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-lg font-medium mb-2">No reports yet</p>
              <p className="text-sm mb-4">
                {reports.length === 0
                  ? "Create your first report to get started"
                  : `No ${activeFilter} reports found`}
              </p>
              <button
                onClick={() => onNavigate("report")}
                className="bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Report an Issue
              </button>
            </div>
          )}

          {/* Reports Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {filtered.map((report) => {
                const emoji = categoryEmoji[report.category] || "📌";
                const badge = statusBadge(
                  (report.status || "pending").toLowerCase()
                );
                const created = report.createdAt?.toDate
                  ? report.createdAt.toDate()
                  : undefined;
                const loc = report.location?.address || "Unknown area";

                return (
                  <div
                    key={report.id}
                    className="bg-surface border border-borders rounded-2xl overflow-hidden card-hover"
                  >
                    <div className="h-32 bg-subtle flex items-center justify-center">
                      <span className="text-3xl">{emoji}</span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg">{emoji}</span>
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.badge}`}
                        >
                          {badge.icon} {badge.label}
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-accent mb-1">
                        {report.title}
                      </h3>
                      <div className="text-xs text-text-secondary">
                        📍 {loc} • {timeAgo(created)}
                      </div>
                      <div className="mt-3">
                        <div className="h-1 bg-borders rounded-full">
                          <div
                            className={`h-full ${badge.bar} rounded-full transition-all duration-300`}
                            style={{ width: `${badge.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
};

export default MyReports;
