// components/admin/IssueDetailModal.tsx
import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
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

interface IssueDetailModalProps {
  issueId: string;
  onClose: () => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issueId,
  onClose,
}) => {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");

  // Helper functions to map Firebase data
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

  // Fetch issue from Firebase
  useEffect(() => {
    const fetchIssue = async () => {
      try {
        console.log("Fetching issue:", issueId);
        const issueDoc = await getDoc(doc(db, "reports", issueId));

        if (issueDoc.exists()) {
          const data = issueDoc.data();
          console.log("Issue data:", data);

          // Map Firebase data to Issue format
          const mappedIssue: Issue = {
            id: issueDoc.id,
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

          setIssue(mappedIssue);
          setNotes(data.adminNotes || "");
        } else {
          console.error("Issue not found:", issueId);
        }
      } catch (error) {
        console.error("Error fetching issue:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [issueId]);

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
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityConfig[priority]}`}
      >
        {priority.toUpperCase()}
      </span>
    );
  };

  const updateIssueInFirebase = async (updates: any) => {
    if (!issue) return;

    setUpdating(true);
    try {
      await updateDoc(doc(db, "reports", issue.id), {
        ...updates,
        updatedAt: new Date(),
      });

      // Update local state
      setIssue((prev) => (prev ? { ...prev, ...updates } : null));
      console.log("Issue updated successfully");
    } catch (error) {
      console.error("Error updating issue:", error);
      alert("Failed to update issue. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus: IssueStatus) => {
    if (!issue) return;

    setUpdating(true);
    try {
      const statusMap: Record<IssueStatus, string> = {
        pending: "pending",
        assigned: "assigned",
        "in-progress": "in-progress",
        resolved: "resolved",
        closed: "closed",
      };

      // Update Firebase
      await updateDoc(doc(db, "reports", issue.id), {
        status: statusMap[newStatus],
        updatedAt: new Date(),
      });

      // Update local state immediately for better UX
      setIssue((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
            }
          : null
      );

      console.log(`Status updated to: ${newStatus}`);

      // Optional: Show success message
      alert(`Status updated to ${newStatus.replace("-", " ")}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: IssuePriority) => {
    if (!issue) return;

    setUpdating(true);
    try {
      // Update Firebase
      await updateDoc(doc(db, "reports", issue.id), {
        priority: newPriority,
        updatedAt: new Date(),
      });

      // Update local state immediately
      setIssue((prev) =>
        prev
          ? {
              ...prev,
              priority: newPriority,
            }
          : null
      );

      console.log(`Priority updated to: ${newPriority}`);
      alert(`Priority updated to ${newPriority}`);
    } catch (error) {
      console.error("Error updating priority:", error);
      alert("Failed to update priority. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDepartmentAssign = async (department: string) => {
    await updateIssueInFirebase({
      assignedDepartment: department,
      status: "assigned",
    });
  };

  // const handlePriorityChange = async (newPriority: IssuePriority) => {
  //   await updateIssueInFirebase({
  //     priority: newPriority,
  //   });
  // };

  const handleStaffAssign = async (staffMember: string) => {
    await updateIssueInFirebase({
      assignedTo: staffMember,
      status: "assigned",
    });
  };

  const handleSaveNotes = async () => {
    await updateIssueInFirebase({
      adminNotes: notes,
    });
    alert("Notes saved successfully!");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">
            Loading issue details...
          </p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <p className="text-gray-600 mb-4">Issue not found</p>
          <button
            onClick={onClose}
            className="bg-black text-white px-4 py-2 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              {getCategoryEmoji(issue.category)}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-black">
                {issue.title}
              </h2>
              <p className="text-gray-600">Issue ID: {issue.id}</p>
              {issue.userDisplayName && (
                <p className="text-sm text-gray-500">
                  Reported by: {issue.userDisplayName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Issue Info */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-black mb-2">Status</h3>
                    {getStatusBadge(issue.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-2">Priority</h3>
                    {getPriorityBadge(issue.priority)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-2">Category</h3>
                    <p className="text-gray-600 capitalize">{issue.category}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-2">Reported</h3>
                    <p className="text-gray-600">
                      {new Date(issue.reportedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-black mb-4">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {issue.description}
                </p>
              </div>

              {/* Photos */}
              {issue.imageUrls && issue.imageUrls.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">
                    Photos ({issue.imageUrls.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {issue.imageUrls.map((photoUrl, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img
                          src={photoUrl}
                          alt={`Issue photo ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.style.display = "none";
                            const fallback =
                              e.currentTarget.parentElement?.querySelector(
                                ".fallback-icon"
                              );
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                        <div className="fallback-icon w-full h-full hidden items-center justify-center">
                          <span className="text-gray-400 text-2xl">📸</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              <div>
                <h3 className="text-xl font-semibold text-black mb-4">
                  Location
                </h3>
                <div className="bg-gray-100 rounded-xl p-6 flex items-center hover:bg-gray-200 transition-colors cursor-pointer">
                  <span className="text-2xl mr-4">📍</span>
                  <div>
                    <p className="font-medium text-black">{issue.location}</p>
                    <p className="text-gray-600 text-sm">
                      Click to view on map
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-xl font-semibold text-black mb-4">
                  Activity Timeline
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-black">Issue Reported</p>
                      <p className="text-gray-600 text-sm">
                        {new Date(issue.reportedAt).toLocaleString()}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Reported by{" "}
                        {issue.reporterInfo.anonymous
                          ? "Anonymous User"
                          : issue.reporterInfo.contact}
                      </p>
                    </div>
                  </div>
                  {issue.status === "pending" && (
                    <div className="flex items-start space-x-4">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-400">
                          Awaiting Assignment
                        </p>
                        <p className="text-gray-400 text-sm">
                          Pending department assignment
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions - Enhanced */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold text-black mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Status:{" "}
                      {issue.status.replace("-", " ").toUpperCase()}
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleStatusUpdate(e.target.value as IssueStatus);
                          e.target.value = ""; // Reset selection
                        }
                      }}
                      className={`w-full py-3 px-4 rounded-xl font-medium text-white ${
                        updating
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-black hover:bg-gray-800"
                      }`}
                      value=""
                      disabled={updating}
                    >
                      <option value="">
                        {updating ? "Updating..." : "Update Status"}
                      </option>
                      {issue.status !== "pending" && (
                        <option value="pending">Mark as Pending</option>
                      )}
                      {issue.status !== "assigned" && (
                        <option value="assigned">Mark as Assigned</option>
                      )}
                      {issue.status !== "in-progress" && (
                        <option value="in-progress">Mark In Progress</option>
                      )}
                      {issue.status !== "resolved" && (
                        <option value="resolved">Mark as Resolved</option>
                      )}
                      {issue.status !== "closed" && (
                        <option value="closed">Close Issue</option>
                      )}
                    </select>
                  </div>

                  {/* Priority Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Priority: {issue.priority.toUpperCase()}
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handlePriorityChange(e.target.value as IssuePriority);
                          e.target.value = ""; // Reset selection
                        }
                      }}
                      className={`w-full py-3 px-4 rounded-xl font-medium text-white ${
                        updating
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-amber-600 hover:bg-amber-700"
                      }`}
                      value=""
                      disabled={updating}
                    >
                      <option value="">
                        {updating ? "Updating..." : "Change Priority"}
                      </option>
                      {issue.priority !== "low" && (
                        <option value="low">Low Priority</option>
                      )}
                      {issue.priority !== "medium" && (
                        <option value="medium">Medium Priority</option>
                      )}
                      {issue.priority !== "high" && (
                        <option value="high">High Priority</option>
                      )}
                      {issue.priority !== "critical" && (
                        <option value="critical">Critical Priority</option>
                      )}
                    </select>
                  </div>

                  <button
                    disabled={!issue.reporterInfo.contact || updating}
                    className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Send Update to Reporter
                  </button>
                </div>
              </div>

              {/* Assignment Info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold text-black mb-4">Assignment</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={issue.department || ""}
                      onChange={(e) => handleDepartmentAssign(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                      disabled={updating}
                    >
                      <option value="">Select Department</option>
                      <option value="Public Works Department">
                        Public Works
                      </option>
                      <option value="Electrical Department">
                        Electrical Department
                      </option>
                      <option value="Water Department">
                        Water & Sanitation
                      </option>
                      <option value="Parks Department">Parks Department</option>
                      <option value="Municipal Corporation">
                        Municipal Corporation
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign to Staff
                    </label>
                    <select
                      value={issue.assignedTo || ""}
                      onChange={(e) => handleStaffAssign(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                      disabled={updating}
                    >
                      <option value="">Select Staff Member</option>
                      <option value="John Smith">John Smith</option>
                      <option value="Mike Johnson">Mike Johnson</option>
                      <option value="Sarah Wilson">Sarah Wilson</option>
                      <option value="David Brown">David Brown</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Reporter Info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold text-black mb-4">
                  Reporter Information
                </h3>
                {issue.reporterInfo.anonymous ? (
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">👤</span>
                    <span>Anonymous Report</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">👤</span>
                      <span>{issue.userDisplayName || "Unknown User"}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">📧</span>
                      <span className="text-sm">
                        {issue.reporterInfo.contact}
                      </span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Contact Reporter
                    </button>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold text-black mb-4">
                  Internal Notes
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none resize-none"
                  rows={4}
                  placeholder="Add internal notes..."
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={updating}
                  className="mt-3 w-full bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Note"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ADD THIS IMAGE MODAL CODE HERE */}
    {selectedImageIndex !== null && issue?.imageUrls && (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
        <div className="relative max-w-4xl max-h-full">
          {/* Close button */}
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute -top-12 right-0 text-white hover:text-gray-300 text-xl z-10"
          >
            ✕ Close
          </button>
          
          {/* Navigation buttons */}
          {issue.imageUrls.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : issue.imageUrls!.length - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 text-3xl z-10"
              >
                ‹
              </button>
              <button
                onClick={() => setSelectedImageIndex(selectedImageIndex < issue.imageUrls!.length - 1 ? selectedImageIndex + 1 : 0)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 text-3xl z-10"
              >
                ›
              </button>
            </>
          )}
          
          {/* Main image */}
          <img
            src={issue.imageUrls[selectedImageIndex]}
            alt={`Issue photo ${selectedImageIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          
          {/* Image counter */}
          {issue.imageUrls.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} of {issue.imageUrls.length}
            </div>
          )}
        </div>
      </div>
    )}
    </div>
  );
};
