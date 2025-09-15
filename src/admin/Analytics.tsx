// pages/admin/Analytics.tsx
import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase"; // Adjust path as needed

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsData {
  issueResolutionTrend: {
    labels: string[];
    data: number[];
  };
  categoryDistribution: {
    labels: string[];
    data: number[];
    colors: string[];
  };
  departmentPerformance: {
    labels: string[];
    resolved: number[];
    pending: number[];
  };
  geographicData: {
    area: string;
    issues: number;
    resolved: number;
    avgTime: string;
  }[];
  satisfactionTrend: {
    labels: string[];
    data: number[];
  };
}

interface ReportData {
  id: string;
  title: string;
  category: string;
  status: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  location?: {
    address?: string;
    displayAddress?: string;
  };
  assignedDepartment?: string;
  userId: string;
}

export const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [timeframe, setTimeframe] = useState("30days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [keyMetrics, setKeyMetrics] = useState({
    totalIssues: 0,
    resolutionRate: 0,
    avgResolutionTime: 0,
    satisfactionRate: 0,
    monthlyGrowth: 0,
    weeklyGrowth: 0,
  });

  // Fetch reports from Firebase
  useEffect(() => {
    console.log("Setting up analytics data listener...");

    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("Analytics data received, docs:", snapshot.docs.length);

        const reportsData: ReportData[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ReportData, "id">),
        }));

        setReports(reportsData);
        setError(null);
      },
      (error) => {
        console.error("Error fetching analytics data:", error);
        setError("Failed to load analytics data");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Process analytics data when reports or timeframe changes
  useEffect(() => {
    if (reports.length === 0) {
      setLoading(false);
      return;
    }

    console.log("Processing analytics data for timeframe:", timeframe);

    try {
      const processedData = processAnalyticsData(reports, timeframe);
      setAnalyticsData(processedData.analytics);
      setKeyMetrics(processedData.metrics);
    } catch (error) {
      console.error("Error processing analytics data:", error);
      setError("Failed to process analytics data");
    } finally {
      setLoading(false);
    }
  }, [reports, timeframe]);

  const processAnalyticsData = (reports: ReportData[], timeframe: string) => {
    const now = new Date();
    const startDate = getStartDate(now, timeframe);

    // Filter reports by timeframe
    const filteredReports = reports.filter((report) => {
      if (!report.createdAt) return false;
      const reportDate = report.createdAt.toDate();
      return reportDate >= startDate && reportDate <= now;
    });

    // Calculate key metrics
    const totalIssues = reports.length;
    const resolvedIssues = reports.filter(
      (r) => r.status === "resolved"
    ).length;
    const resolutionRate =
      totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;

    // Calculate average resolution time
    const resolvedWithTime = reports.filter(
      (r) => r.status === "resolved" && r.createdAt && r.updatedAt
    );

    let avgResolutionTime = 0;
    if (resolvedWithTime.length > 0) {
      const totalHours = resolvedWithTime.reduce((sum, report) => {
        const created = report.createdAt.toDate();
        const updated = report.updatedAt!.toDate();
        const hours =
          Math.abs(updated.getTime() - created.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      avgResolutionTime = totalHours / resolvedWithTime.length;
    }

    // Growth calculations
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const thisMonthIssues = reports.filter(
      (r) => r.createdAt && r.createdAt.toDate() >= lastMonth
    ).length;

    const thisWeekIssues = reports.filter(
      (r) => r.createdAt && r.createdAt.toDate() >= lastWeek
    ).length;

    const monthlyGrowth =
      totalIssues > thisMonthIssues
        ? (thisMonthIssues / Math.max(totalIssues - thisMonthIssues, 1)) * 100
        : 0;

    const weeklyGrowth =
      totalIssues > thisWeekIssues
        ? (thisWeekIssues / Math.max(totalIssues - thisWeekIssues, 1)) * 100
        : 0;

    // 1. Issue Resolution Trend
    const trendData = calculateResolutionTrend(filteredReports, timeframe);

    // 2. Category Distribution
    const categoryData = calculateCategoryDistribution(filteredReports);

    // 3. Department Performance
    const departmentData = calculateDepartmentPerformance(filteredReports);

    // 4. Geographic Analysis
    const geographicData = calculateGeographicData(filteredReports);

    // 5. Satisfaction Trend (simplified based on resolution rate over time)
    const satisfactionData = calculateSatisfactionTrend(reports, timeframe);

    return {
      analytics: {
        issueResolutionTrend: trendData,
        categoryDistribution: categoryData,
        departmentPerformance: departmentData,
        geographicData: geographicData,
        satisfactionTrend: satisfactionData,
      },
      metrics: {
        totalIssues,
        resolutionRate: Math.round(resolutionRate * 10) / 10,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        satisfactionRate: Math.round(resolutionRate), // Simplified satisfaction based on resolution
        monthlyGrowth: Math.round(monthlyGrowth),
        weeklyGrowth: Math.round(weeklyGrowth),
      },
    };
  };

  const getStartDate = (now: Date, timeframe: string) => {
    const date = new Date(now);
    switch (timeframe) {
      case "7days":
        date.setDate(date.getDate() - 7);
        break;
      case "30days":
        date.setDate(date.getDate() - 30);
        break;
      case "90days":
        date.setDate(date.getDate() - 90);
        break;
      case "1year":
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setDate(date.getDate() - 30);
    }
    return date;
  };

  const calculateResolutionTrend = (
    reports: ReportData[],
    timeframe: string
  ) => {
    const resolvedReports = reports.filter(
      (r) => r.status === "resolved" && r.updatedAt
    );

    if (timeframe === "7days") {
      const labels = [
        "Day 1",
        "Day 2",
        "Day 3",
        "Day 4",
        "Day 5",
        "Day 6",
        "Day 7",
      ];
      const data = new Array(7).fill(0);

      resolvedReports.forEach((report) => {
        const daysDiff = Math.floor(
          (Date.now() - report.updatedAt!.toDate().getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysDiff >= 0 && daysDiff < 7) {
          data[6 - daysDiff]++;
        }
      });

      return { labels, data };
    } else {
      const labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
      const data = new Array(4).fill(0);

      resolvedReports.forEach((report) => {
        const weeksDiff = Math.floor(
          (Date.now() - report.updatedAt!.toDate().getTime()) /
            (1000 * 60 * 60 * 24 * 7)
        );
        if (weeksDiff >= 0 && weeksDiff < 4) {
          data[3 - weeksDiff]++;
        }
      });

      return { labels, data };
    }
  };

  const calculateCategoryDistribution = (reports: ReportData[]) => {
    const categoryCounts: Record<string, number> = {};

    reports.forEach((report) => {
      const category = report.category || "other";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const categoryColors: Record<string, string> = {
      roads: "#3B82F6",
      lighting: "#F59E0B",
      water: "#10B981",
      utilities: "#06B6D4",
      waste: "#EF4444",
      parks: "#84CC16",
      safety: "#8B5CF6",
      other: "#6B7280",
    };

    const labels = Object.keys(categoryCounts);
    const data = Object.values(categoryCounts);
    const colors = labels.map((label) => categoryColors[label] || "#6B7280");

    return { labels, data, colors };
  };

  const calculateDepartmentPerformance = (reports: ReportData[]) => {
    const deptStats: Record<string, { resolved: number; pending: number }> = {};

    reports.forEach((report) => {
      const dept =
        report.assignedDepartment || mapCategoryToDepartment(report.category);

      if (!deptStats[dept]) {
        deptStats[dept] = { resolved: 0, pending: 0 };
      }

      if (report.status === "resolved") {
        deptStats[dept].resolved++;
      } else if (
        ["pending", "assigned", "in-progress"].includes(report.status)
      ) {
        deptStats[dept].pending++;
      }
    });

    const labels = Object.keys(deptStats);
    const resolved = labels.map((label) => deptStats[label].resolved);
    const pending = labels.map((label) => deptStats[label].pending);

    return { labels, resolved, pending };
  };

  const calculateGeographicData = (reports: ReportData[]) => {
    const areaStats: Record<
      string,
      { issues: number; resolved: number; totalTime: number; count: number }
    > = {};

    reports.forEach((report) => {
      const area = extractAreaFromAddress(
        report.location?.address || report.location?.displayAddress || "Unknown"
      );

      if (!areaStats[area]) {
        areaStats[area] = { issues: 0, resolved: 0, totalTime: 0, count: 0 };
      }

      areaStats[area].issues++;

      if (report.status === "resolved") {
        areaStats[area].resolved++;

        if (report.createdAt && report.updatedAt) {
          const resolutionTime =
            report.updatedAt.toDate().getTime() -
            report.createdAt.toDate().getTime();
          const days = resolutionTime / (1000 * 60 * 60 * 24);
          areaStats[area].totalTime += days;
          areaStats[area].count++;
        }
      }
    });

    return Object.entries(areaStats)
      .map(([area, stats]) => ({
        area,
        issues: stats.issues,
        resolved: stats.resolved,
        avgTime:
          stats.count > 0
            ? `${Math.round((stats.totalTime / stats.count) * 10) / 10} days`
            : "N/A",
      }))
      .sort((a, b) => b.issues - a.issues)
      .slice(0, 4); // Top 4 areas
  };

  const calculateSatisfactionTrend = (
    reports: ReportData[],
    timeframe: string
  ) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const data = new Array(6).fill(0);

    // Calculate satisfaction based on resolution rate per month
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - (5 - i));
      monthStart.setDate(1);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthReports = reports.filter((r) => {
        if (!r.createdAt) return false;
        const date = r.createdAt.toDate();
        return date >= monthStart && date < monthEnd;
      });

      const resolved = monthReports.filter(
        (r) => r.status === "resolved"
      ).length;
      const total = monthReports.length;

      data[i] = total > 0 ? Math.round((resolved / total) * 100) : 0;
    }

    return { labels: months, data };
  };

  const mapCategoryToDepartment = (category: string): string => {
    const deptMap: Record<string, string> = {
      roads: "Public Works",
      lighting: "Electrical",
      water: "Water & Sanitation",
      utilities: "Water & Sanitation",
      waste: "Waste Management",
      parks: "Parks Department",
      safety: "Municipal Corporation",
    };
    return deptMap[category] || "General";
  };

  const extractAreaFromAddress = (address: string): string => {
    // Simple area extraction - you can make this more sophisticated
    const parts = address.split(",");
    if (parts.length > 1) {
      return parts[1].trim();
    }
    return parts[0] || "Unknown Area";
  };

  // Chart configurations (same as before)
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#F3F4F6" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#F3F4F6" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        <span className="ml-4 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-4 py-2 rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-black">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time insights and performance metrics for civic issue
            management
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 3 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button className="bg-black text-white px-6 py-2 rounded-xl font-medium hover:opacity-95 transition-opacity">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Cards - Now Dynamic */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Issues</p>
              <p className="text-3xl font-bold text-black">
                {keyMetrics.totalIssues.toLocaleString()}
              </p>
              <p className="text-emerald-600 text-sm">
                {keyMetrics.monthlyGrowth >= 0 ? "↗" : "↘"}{" "}
                {Math.abs(keyMetrics.monthlyGrowth)}% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Resolution Rate</p>
              <p className="text-3xl font-bold text-emerald-600">
                {keyMetrics.resolutionRate}%
              </p>
              <p className="text-emerald-600 text-sm">↗ Tracking improvement</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Resolution Time</p>
              <p className="text-3xl font-bold text-amber-600">
                {keyMetrics.avgResolutionTime < 1
                  ? `${Math.round(keyMetrics.avgResolutionTime * 24)}h`
                  : `${keyMetrics.avgResolutionTime}d`}
              </p>
              <p className="text-emerald-600 text-sm">↘ Getting faster</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⏱️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Citizen Satisfaction</p>
              <p className="text-3xl font-bold text-blue-600">
                {keyMetrics.satisfactionRate}%
              </p>
              <p className="text-emerald-600 text-sm">
                ↗ Based on resolution rate
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">😊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 - Now Dynamic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Issue Resolution Trend */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-black">
              Issue Resolution Trend
            </h2>
            <span className="text-gray-500 text-sm">
              Last {timeframe.replace("days", " days").replace("1year", "year")}
            </span>
          </div>
          <div className="h-64">
            <Line
              data={{
                labels: analyticsData.issueResolutionTrend.labels,
                datasets: [
                  {
                    label: "Issues Resolved",
                    data: analyticsData.issueResolutionTrend.data,
                    borderColor: "#10B981",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }}
              options={lineChartOptions}
            />
          </div>
        </div>

        {/* Issue Categories Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-black">
              Issues by Category
            </h2>
            <span className="text-gray-500 text-sm">
              {timeframe.replace("days", " days").replace("1year", "year")}
            </span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={{
                labels: analyticsData.categoryDistribution.labels,
                datasets: [
                  {
                    data: analyticsData.categoryDistribution.data,
                    backgroundColor: analyticsData.categoryDistribution.colors,
                    borderWidth: 2,
                    borderColor: "#FFFFFF",
                  },
                ],
              }}
              options={doughnutOptions}
            />
          </div>
        </div>
      </div>

      {/* Charts Row 2 - Now Dynamic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Performance */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-black">
              Department Performance
            </h2>
            <span className="text-gray-500 text-sm">
              {timeframe.replace("days", " days").replace("1year", "year")}
            </span>
          </div>
          <div className="h-64">
            <Bar
              data={{
                labels: analyticsData.departmentPerformance.labels,
                datasets: [
                  {
                    label: "Resolved",
                    data: analyticsData.departmentPerformance.resolved,
                    backgroundColor: "#10B981",
                  },
                  {
                    label: "Pending",
                    data: analyticsData.departmentPerformance.pending,
                    backgroundColor: "#F59E0B",
                  },
                ],
              }}
              options={barChartOptions}
            />
          </div>
        </div>

        {/* Citizen Satisfaction Trend */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-black">
              Citizen Satisfaction
            </h2>
            <span className="text-gray-500 text-sm">Last 6 months</span>
          </div>
          <div className="h-64">
            <Line
              data={{
                labels: analyticsData.satisfactionTrend.labels,
                datasets: [
                  {
                    label: "Satisfaction %",
                    data: analyticsData.satisfactionTrend.data,
                    borderColor: "#3B82F6",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }}
              options={{
                ...lineChartOptions,
                scales: {
                  ...lineChartOptions.scales,
                  y: {
                    ...lineChartOptions.scales.y,
                    min: 0,
                    max: 100,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Geographic Analysis - Now Dynamic */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-black">
            Geographic Analysis
          </h2>
          <span className="text-gray-500 text-sm">Top performing areas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsData.geographicData.map((area, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl p-6 hover:border-black transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-black">{area.area}</h3>
                <span className="text-2xl">📍</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Total Issues</span>
                  <span className="font-medium text-black">{area.issues}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Resolved</span>
                  <span className="font-medium text-emerald-600">
                    {area.resolved}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Avg Time</span>
                  <span className="font-medium text-blue-600">
                    {area.avgTime}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Resolution Rate</span>
                  <span>
                    {area.issues > 0
                      ? Math.round((area.resolved / area.issues) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{
                      width: `${
                        area.issues > 0
                          ? (area.resolved / area.issues) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-black mb-6">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">🎯</span>
              <h3 className="font-semibold text-black">Top Performing Area</h3>
            </div>
            <p className="text-gray-600 text-sm">
              {analyticsData.geographicData[0]?.area || "No data"} leads with{" "}
              {analyticsData.geographicData[0]?.issues > 0
                ? Math.round(
                    (analyticsData.geographicData[0].resolved /
                      analyticsData.geographicData[0].issues) *
                      100
                  )
                : 0}
              % resolution rate.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">📈</span>
              <h3 className="font-semibold text-black">Growth Trend</h3>
            </div>
            <p className="text-gray-600 text-sm">
              {keyMetrics.weeklyGrowth > 0
                ? `Issues increased by ${keyMetrics.weeklyGrowth}% this week. Monitor resource allocation.`
                : `Stable issue reporting trends. Good system performance.`}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">⚡</span>
              <h3 className="font-semibold text-black">
                Resolution Efficiency
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              Average resolution time of{" "}
              {keyMetrics.avgResolutionTime.toFixed(1)} days with{" "}
              {keyMetrics.resolutionRate.toFixed(1)}% success rate shows{" "}
              {keyMetrics.resolutionRate > 80
                ? "excellent"
                : keyMetrics.resolutionRate > 60
                ? "good"
                : "improving"}{" "}
              performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
