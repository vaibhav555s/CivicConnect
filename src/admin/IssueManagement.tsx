// pages/admin/IssueManagement.tsx
import React, { useState, useEffect } from "react";
import { IssueDetailModal } from "../admin/IssueDetailModal";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase"; // Adjust path as needed

// Define proper types
type IssuePriority = "low" | "medium" | "high" | "critical";
type IssueStatus =
  | "pending"
  | "assigned"
  | "in-progress"
  | "resolved"
  | "closed";
type IssueCategory =
  | "roads"
  | "lighting"
  | "water"
  | "waste"
  | "utilities"
  | "parks"
  | "safety";

interface Issue {
  id: string;
  category: IssueCategory;
  title: string;
  description: string;
  location: string;
  reportedAt: string;
  status: IssueStatus;
  priority: IssuePriority;
  department?: string;
  assignedTo?: string;
  photos: string[];
  reporterInfo: {
    anonymous: boolean;
    contact?: string;
  };
  // Firebase specific fields
  userId: string;
  userEmail?: string;
  userDisplayName?: string;
  createdAt: Timestamp;
  imageUrls?: string[];
}

export const IssueManagement: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    department: "all",
    priority: "all",
  });
  const [showIssueDetail, setShowIssueDetail] = useState<string | null>(null);

  // Fetch real issues from Firebase
  useEffect(() => {
    console.log("Setting up Firebase listener for reports...");

    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("Firebase snapshot received, docs:", snapshot.docs.length);

        const firebaseIssues: Issue[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Processing report:", doc.id, data);

          // Map Firebase report data to Issue format
          return {
            id: doc.id,
            category: mapCategoryToIssueCategory(data.category || "general"),
            title: data.title || "Untitled Issue",
            description: data.description || "No description provided",
            location:
              data.location?.address ||
              data.location?.displayAddress ||
              "Unknown location",
            reportedAt:
              data.createdAt?.toDate()?.toISOString() ||
              new Date().toISOString(),
            status: mapFirebaseStatusToIssueStatus(data.status || "pending"),
            priority: data.priority || "medium",
            department:
              data.assignedDepartment || mapCategoryToDepartment(data.category),
            assignedTo: data.assignedTo || undefined,
            photos: data.imageUrls || [],
            reporterInfo: {
              anonymous:
                !data.userDisplayName || data.userDisplayName === "Anonymous",
              contact: data.userEmail || undefined,
            },
            // Firebase specific
            userId: data.userId,
            userEmail: data.userEmail,
            userDisplayName: data.userDisplayName,
            createdAt: data.createdAt,
            imageUrls: data.imageUrls || [],
          };
        });

        console.log("Processed issues:", firebaseIssues);
        setIssues(firebaseIssues);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching issues:", error);
        setLoading(false);
      }
    );

    return () => {
      console.log("Cleaning up Firebase listener");
      unsubscribe();
    };
  }, []);

  // Helper functions to map Firebase data to admin interface
  const mapCategoryToIssueCategory = (category: string): IssueCategory => {
    const categoryMap: Record<string, IssueCategory> = {
      roads: "roads",
      lighting: "lighting",
      utilities: "water",
      water: "water",
      waste: "waste",
      parks: "parks",
      safety: "safety",
    };
    return categoryMap[category] || "roads";
  };

  const mapFirebaseStatusToIssueStatus = (status: string): IssueStatus => {
    const statusMap: Record<string, IssueStatus> = {
      pending: "pending",
      assigned: "assigned",
      "in-progress": "in-progress",
      review: "in-progress",
      resolved: "resolved",
      closed: "closed",
    };
    return statusMap[status] || "pending";
  };

  const mapCategoryToDepartment = (category: string): string => {
    const departmentMap: Record<string, string> = {
      roads: "Public Works Department",
      lighting: "Electrical Department",
      utilities: "Water Department",
      water: "Water Department",
      waste: "Sanitation Department",
      parks: "Parks Department",
      safety: "Municipal Corporation",
    };
    return departmentMap[category] || "General Department";
  };

  // Filter issues based on search and filters
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      filters.search === "" ||
      issue.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      issue.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      issue.location.toLowerCase().includes(filters.search.toLowerCase()) ||
      issue.id.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus =
      filters.status === "all" || issue.status === filters.status;
    const matchesCategory =
      filters.category === "all" || issue.category === filters.category;
    const matchesPriority =
      filters.priority === "all" || issue.priority === filters.priority;

    // Department filter (simplified)
    const matchesDepartment =
      filters.department === "all" ||
      (issue.department &&
        issue.department
          .toLowerCase()
          .includes(filters.department.toLowerCase()));

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory &&
      matchesPriority &&
      matchesDepartment
    );
  });

  // Calculate stats from real data
  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === "pending").length,
    inProgress: issues.filter(
      (i) => i.status === "in-progress" || i.status === "assigned"
    ).length,
    resolved: issues.filter((i) => i.status === "resolved").length,
  };

  const getStatusBadge = (status: IssueStatus) => {
    const statusConfig: Record<IssueStatus, string> = {
      pending: "bg-gray-100 text-gray-800",
      assigned: "bg-blue-100 text-blue-800",
      "in-progress": "bg-amber-100 text-amber-800",
      resolved: "bg-emerald-100 text-emerald-800",
      closed: "bg-gray-100 text-gray-600",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[status]}`}
      >
        {status.replace("-", " ").toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority: IssuePriority) => {
    const priorityConfig: Record<IssuePriority, string> = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${priorityConfig[priority]}`}
      >
        {priority.toUpperCase()}
      </span>
    );
  };

  const getCategoryEmoji = (category: IssueCategory) => {
    const categoryEmojis: Record<IssueCategory, string> = {
      roads: "🛣️",
      lighting: "💡",
      water: "💧",
      waste: "🗑️",
      utilities: "💧",
      parks: "🌳",
      safety: "🛡️",
    };
    return categoryEmojis[category] || "📌";
  };

  const handleIssueUpdate = (issueId: string, updates: Partial<Issue>) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, ...updates } : issue
      )
    );
  };

  const handleBulkAction = (action: string, issueIds: string[]) => {
    console.log("Bulk action:", action, "for issues:", issueIds);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        <span className="ml-4 text-gray-600">Loading issues...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-black">
            Issue Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and track all reported civic issues
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            Export Data
          </button>
          <button className="bg-black text-white px-6 py-2 rounded-xl font-medium hover:opacity-95 transition-opacity">
            Bulk Actions
          </button>
        </div>
      </div>

      {/* Quick Stats - Now using real data */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-black">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Issues</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-amber-600">
            {stats.pending}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {stats.inProgress}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-emerald-600">
            {stats.resolved}
          </div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-600">2.4 hrs</div>
          <div className="text-sm text-gray-600">Avg Response</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search issues..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="px-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
          >
            <option value="all">All Categories</option>
            <option value="roads">Roads</option>
            <option value="lighting">Lighting</option>
            <option value="water">Water</option>
            <option value="waste">Waste</option>
            <option value="parks">Parks</option>
            <option value="safety">Safety</option>
          </select>

          {/* Department Filter */}
          <select
            value={filters.department}
            onChange={(e) =>
              setFilters({ ...filters, department: e.target.value })
            }
            className="px-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
          >
            <option value="all">All Departments</option>
            <option value="public-works">Public Works</option>
            <option value="electrical">Electrical</option>
            <option value="water">Water & Sanitation</option>
            <option value="parks">Parks</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters({ ...filters, priority: e.target.value })
            }
            className="px-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Issues Table - Now showing real data */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Issue Details
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Priority
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Department
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Reported
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    {issues.length === 0
                      ? "No issues reported yet"
                      : "No issues match your filters"}
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getCategoryEmoji(issue.category)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-black">
                            {issue.title}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                            {issue.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <span className="mr-1">📍</span>
                              {issue.location}
                            </span>
                            <span className="flex items-center">
                              <span className="mr-1">📸</span>
                              {issue.photos.length} photos
                            </span>
                            <span className="flex items-center">
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {issue.id}
                              </span>
                            </span>
                            {issue.userDisplayName && (
                              <span className="flex items-center">
                                <span className="mr-1">👤</span>
                                {issue.userDisplayName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(issue.status)}</td>
                    <td className="p-4">{getPriorityBadge(issue.priority)}</td>
                    <td className="p-4">
                      <div className="text-sm">
                        {issue.department ? (
                          <div>
                            <div className="font-medium text-black">
                              {issue.department}
                            </div>
                            {issue.assignedTo && (
                              <div className="text-gray-600 flex items-center mt-1">
                                <span className="mr-1">👤</span>
                                {issue.assignedTo}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="mr-1">🕐</span>
                          {new Date(issue.reportedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(issue.reportedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowIssueDetail(issue.id)}
                          className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                        >
                          View
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <span>⋮</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing 1 to {filteredIssues.length} of {stats.total} results
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Previous
          </button>
          <button className="px-3 py-2 bg-black text-white rounded-lg text-sm">
            1
          </button>
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            2
          </button>
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            3
          </button>
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Next
          </button>
        </div>
      </div>

      {/* Issue Detail Modal */}
      {showIssueDetail && (
        <IssueDetailModal
          issueId={showIssueDetail}
          onClose={() => setShowIssueDetail(null)}
        />
      )}
    </div>
  );
};
