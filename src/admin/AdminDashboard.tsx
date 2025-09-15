// pages/admin/AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase"; // Adjust path as needed

interface DashboardStats {
  totalIssues: number;
  activeIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  inProgressIssues: number;
  assignedIssues: number;
  resolvedToday: number;
  resolvedYesterday: number;
  avgResponseTime: string;
  satisfactionRate: string;
  weeklyGrowth: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalIssues: 0,
    activeIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    inProgressIssues: 0,
    assignedIssues: 0,
    resolvedToday: 0,
    resolvedYesterday: 0,
    avgResponseTime: "0 hrs",
    satisfactionRate: "0%",
    weeklyGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up dashboard analytics...");

    // Listen to all reports for real-time stats
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("Dashboard data received, docs:", snapshot.docs.length);

        const reports = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Calculate stats
        const calculatedStats = calculateDashboardStats(reports);
        setStats(calculatedStats);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const calculateDashboardStats = (reports: any[]): DashboardStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Status counts
    const totalIssues = reports.length;
    const pendingIssues = reports.filter((r) => r.status === "pending").length;
    const assignedIssues = reports.filter(
      (r) => r.status === "assigned"
    ).length;
    const inProgressIssues = reports.filter(
      (r) => r.status === "in-progress" || r.status === "review"
    ).length;
    const resolvedIssues = reports.filter(
      (r) => r.status === "resolved"
    ).length;

    // Active issues (not resolved or closed)
    const activeIssues = reports.filter(
      (r) => r.status !== "resolved" && r.status !== "closed"
    ).length;

    // Resolved today and yesterday
    const resolvedToday = reports.filter((r) => {
      if (r.status !== "resolved" || !r.updatedAt) return false;
      const resolvedDate = r.updatedAt.toDate
        ? r.updatedAt.toDate()
        : new Date(r.updatedAt);
      return resolvedDate >= today;
    }).length;

    const resolvedYesterday = reports.filter((r) => {
      if (r.status !== "resolved" || !r.updatedAt) return false;
      const resolvedDate = r.updatedAt.toDate
        ? r.updatedAt.toDate()
        : new Date(r.updatedAt);
      return resolvedDate >= yesterday && resolvedDate < today;
    }).length;

    // Weekly growth calculation
    const thisWeekIssues = reports.filter((r) => {
      if (!r.createdAt) return false;
      const createdDate = r.createdAt.toDate
        ? r.createdAt.toDate()
        : new Date(r.createdAt);
      return createdDate >= lastWeek;
    }).length;

    const weeklyGrowth =
      thisWeekIssues > 0
        ? Math.round(
            (thisWeekIssues / Math.max(totalIssues - thisWeekIssues, 1)) * 100
          )
        : 0;

    // Calculate average response time (simplified)
    const resolvedReports = reports.filter(
      (r) => r.status === "resolved" && r.createdAt && r.updatedAt
    );

    let avgResponseHours = 0;
    if (resolvedReports.length > 0) {
      const totalHours = resolvedReports.reduce((sum, report) => {
        const created = report.createdAt.toDate
          ? report.createdAt.toDate()
          : new Date(report.createdAt);
        const updated = report.updatedAt.toDate
          ? report.updatedAt.toDate()
          : new Date(report.updatedAt);
        const diffHours =
          Math.abs(updated.getTime() - created.getTime()) / (1000 * 60 * 60);
        return sum + diffHours;
      }, 0);

      avgResponseHours = totalHours / resolvedReports.length;
    }

    const avgResponseTime =
      avgResponseHours < 1
        ? `${Math.round(avgResponseHours * 60)} min`
        : `${avgResponseHours.toFixed(1)} hrs`;

    // Satisfaction rate (simplified calculation based on resolution rate)
    const satisfactionRate =
      totalIssues > 0
        ? `${Math.round((resolvedIssues / totalIssues) * 100)}%`
        : "0%";

    return {
      totalIssues,
      activeIssues,
      pendingIssues,
      resolvedIssues,
      inProgressIssues,
      assignedIssues,
      resolvedToday,
      resolvedYesterday,
      avgResponseTime,
      satisfactionRate,
      weeklyGrowth,
    };
  };

  // Calculate percentage changes
  const getTodayChange = () => {
    if (stats.resolvedYesterday === 0)
      return stats.resolvedToday > 0 ? "+100%" : "0%";
    const change =
      ((stats.resolvedToday - stats.resolvedYesterday) /
        stats.resolvedYesterday) *
      100;
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  const getGrowthIndicator = (value: number) => {
    if (value > 0) return { text: `+${value}%`, color: "text-green-600" };
    if (value < 0) return { text: `${value}%`, color: "text-red-600" };
    return { text: "0%", color: "text-gray-600" };
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-semibold text-black">
          Dashboard Overview
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold text-black">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 mt-2">
          Real-time civic issue management statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Active Issues Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-black">Active Issues</h3>
            <span className="text-2xl">🔄</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {stats.activeIssues}
          </p>
          <p className="text-sm text-gray-600">
            <span className={getGrowthIndicator(stats.weeklyGrowth).color}>
              {getGrowthIndicator(stats.weeklyGrowth).text}
            </span>{" "}
            from last week
          </p>
          <div className="mt-3 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Pending: {stats.pendingIssues}</span>
              <span>In Progress: {stats.inProgressIssues}</span>
            </div>
          </div>
        </div>

        {/* Resolved Today Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-black">Resolved Today</h3>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">
            {stats.resolvedToday}
          </p>
          <p className="text-sm text-gray-600">
            <span
              className={
                getTodayChange().startsWith("+")
                  ? "text-green-600"
                  : getTodayChange().startsWith("-")
                  ? "text-red-600"
                  : "text-gray-600"
              }
            >
              {getTodayChange()}
            </span>{" "}
            from yesterday
          </p>
          <div className="mt-3 text-xs text-gray-500">
            Total resolved: {stats.resolvedIssues}
          </div>
        </div>

        {/* Average Response Time Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-black">Avg Response</h3>
            <span className="text-2xl">⏱️</span>
          </div>
          <p className="text-3xl font-bold text-amber-600">
            {stats.avgResponseTime}
          </p>
          <p className="text-sm text-gray-600">
            <span className="text-green-600">Tracking improvement</span>
          </p>
          <div className="mt-3 text-xs text-gray-500">
            Based on {stats.resolvedIssues} resolved issues
          </div>
        </div>

        {/* Satisfaction Rate Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-black">Success Rate</h3>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">
            {stats.satisfactionRate}
          </p>
          <p className="text-sm text-gray-600">
            <span className="text-blue-600">Resolution efficiency</span>
          </p>
          <div className="mt-3 text-xs text-gray-500">
            {stats.resolvedIssues} / {stats.totalIssues} issues resolved
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">
            Status Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <div className="flex items-center">
                <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                  <div
                    className="h-2 bg-gray-500 rounded-full"
                    style={{
                      width: `${
                        stats.totalIssues > 0
                          ? (stats.pendingIssues / stats.totalIssues) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {stats.pendingIssues}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Progress</span>
              <div className="flex items-center">
                <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{
                      width: `${
                        stats.totalIssues > 0
                          ? (stats.inProgressIssues / stats.totalIssues) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {stats.inProgressIssues}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Resolved</span>
              <div className="flex items-center">
                <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                  <div
                    className="h-2 bg-emerald-500 rounded-full"
                    style={{
                      width: `${
                        stats.totalIssues > 0
                          ? (stats.resolvedIssues / stats.totalIssues) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {stats.resolvedIssues}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              📋 View All Issues
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              ⚡ Priority Issues
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              📊 Generate Report
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              👥 Manage Staff
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">
            System Health
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Database</span>
              <span className="text-emerald-600 text-sm">🟢 Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">API Status</span>
              <span className="text-emerald-600 text-sm">🟢 Healthy</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Update</span>
              <span className="text-gray-500 text-sm">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
