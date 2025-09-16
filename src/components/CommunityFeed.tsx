import React, { useState, useEffect } from "react";
import { Search, ThumbsUp, MessageCircle, MapPin, Heart } from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../lib/firebase"; // Adjust path as needed
import { useAuth } from "../contexts/AuthContext"; // Assuming you have auth context

const CommunityFeed = () => {
  const { user } = useAuth(); // Get current user for upvoting
  const [activeFilter, setActiveFilter] = useState("all");
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { id: "all", label: "📋 All", icon: "📋" },
    { id: "pending", label: "⏳ Pending", icon: "⏳" },
    { id: "resolved", label: "✅ Resolved", icon: "✅" },
    { id: "trending", label: "🔥 Trending", icon: "🔥" },
  ];

  // Fetch reports from Firebase with real-time updates
  useEffect(() => {
    console.log("Setting up community feed listener for filter:", activeFilter);

    let q;

    if (activeFilter === "all") {
      q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    } else if (activeFilter === "pending") {
      q = query(
        collection(db, "reports"),
        where("status", "in", ["pending", "assigned", "in-progress"]),
        orderBy("createdAt", "desc")
      );
    } else if (activeFilter === "resolved") {
      q = query(
        collection(db, "reports"),
        where("status", "==", "resolved"),
        orderBy("createdAt", "desc")
      );
    } else if (activeFilter === "trending") {
      q = query(
        collection(db, "reports"),
        orderBy("upvoteCount", "desc"),
        orderBy("createdAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("Community feed data received:", snapshot.docs.length);

        const items = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Ensure upvote fields exist with defaults
            upvoteCount: data.upvoteCount || 0,
            upvotedBy: data.upvotedBy || [],
            // Format time ago
            timeAgo: getTimeAgo(data.createdAt?.toDate() || new Date()),
            // Get location from address
            location: extractLocation(
              data.location?.displayAddress ||
                data.location?.address ||
                "Unknown Location"
            ),
            // Determine status display
            statusDisplay: getStatusDisplay(data.status || "pending"),
            // Get category info
            categoryInfo: getCategoryInfo(data.category || "other"),
            // Check if current user has upvoted
            hasUpvoted: user
              ? (data.upvotedBy || []).includes(user.uid)
              : false,
          };
        });

        setFeedItems(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching community feed:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [activeFilter, user?.uid]);

  // Handle upvote functionality
  const handleUpvote = async (reportId, hasUpvoted) => {
    if (!user) {
      alert("Please log in to upvote");
      return;
    }

    try {
      const reportRef = doc(db, "reports", reportId);

      if (hasUpvoted) {
        // Remove upvote
        await updateDoc(reportRef, {
          upvoteCount: increment(-1),
          upvotedBy: arrayRemove(user.uid),
          updatedAt: new Date(),
        });
      } else {
        // Add upvote
        await updateDoc(reportRef, {
          upvoteCount: increment(1),
          upvotedBy: arrayUnion(user.uid),
          updatedAt: new Date(),
        });
      }

      console.log("Upvote updated successfully");
    } catch (error) {
      console.error("Error updating upvote:", error);
      alert("Failed to update upvote. Please try again.");
    }
  };

  // Helper functions
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffHours = Math.abs(now - date) / (1000 * 60 * 60);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${Math.floor(diffHours)}h`;
    if (diffHours < 24 * 7) return `${Math.floor(diffHours / 24)}d`;
    return `${Math.floor(diffHours / (24 * 7))}w`;
  };

  const extractLocation = (address) => {
    if (!address || address === "Unknown Location") return "Unknown";
    const parts = address.split(",");
    return parts[0]?.trim() || "Unknown";
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: { label: "Pending", color: "text-amber-600", emoji: "⏳" },
      assigned: { label: "Assigned", color: "text-blue-600", emoji: "📋" },
      "in-progress": {
        label: "In Progress",
        color: "text-purple-600",
        emoji: "🔄",
      },
      resolved: { label: "Resolved", color: "text-emerald-600", emoji: "✅" },
      closed: { label: "Closed", color: "text-gray-600", emoji: "🔒" },
    };
    return statusMap[status] || statusMap["pending"];
  };

  const getCategoryInfo = (category) => {
    const categoryMap = {
      roads: {
        icon: "🛣️",
        label: "Roads",
        color: "bg-amber-100 text-amber-800",
      },
      lighting: {
        icon: "💡",
        label: "Lighting",
        color: "bg-yellow-100 text-yellow-800",
      },
      water: { icon: "💧", label: "Water", color: "bg-blue-100 text-blue-800" },
      utilities: {
        icon: "⚡",
        label: "Utilities",
        color: "bg-blue-100 text-blue-800",
      },
      waste: {
        icon: "🗑️",
        label: "Waste",
        color: "bg-green-100 text-green-800",
      },
      parks: {
        icon: "🌳",
        label: "Parks",
        color: "bg-emerald-100 text-emerald-800",
      },
      safety: { icon: "🚨", label: "Safety", color: "bg-red-100 text-red-800" },
      other: { icon: "📝", label: "Other", color: "bg-gray-100 text-gray-800" },
    };
    return categoryMap[category] || categoryMap["other"];
  };

  const getDefaultEmoji = (category) => {
    const emojiMap = {
      roads: "🕳️",
      lighting: "💡",
      water: "💧",
      utilities: "⚡",
      waste: "🗑️",
      parks: "🌳",
      safety: "🚨",
      other: "📝",
    };
    return emojiMap[category] || "📸";
  };

  if (loading) {
    return (
      <section className="px-4 pt-6 pb-12">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            <span className="ml-4 text-text-secondary">
              Loading community feed...
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 pt-6 pb-12">
      <div className="max-w-lg mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-h2 font-semibold text-accent">Community Feed</h1>
          <button className="p-2 hover:bg-subtle rounded-lg transition-colors">
            <Search className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                activeFilter === filter.id
                  ? "bg-accent text-white"
                  : "bg-subtle text-text-secondary hover:bg-borders"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Feed Items */}
        {feedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-accent mb-2">
              No Reports Yet
            </h3>
            <p className="text-text-secondary">
              {activeFilter === "pending"
                ? "No pending issues in your area"
                : activeFilter === "resolved"
                ? "No resolved issues to show"
                : "Be the first to report a civic issue!"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedItems.map((item) => (
              <div
                key={item.id}
                className="bg-surface border border-borders rounded-2xl overflow-hidden card-hover"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-subtle rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm">👤</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-accent">
                        {item.userDisplayName || "Anonymous Citizen"}
                      </div>
                      <div className="text-xs text-text-secondary">
                        📍 {item.location} • {item.timeAgo}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.categoryInfo.color}`}
                  >
                    {item.categoryInfo.icon} {item.categoryInfo.label}
                  </div>
                </div>

                {/* Issue Image */}
                <div className="px-4 pb-3">
                  <div className="w-full h-48 bg-subtle rounded-xl flex items-center justify-center overflow-hidden">
                    {item.imageUrls && item.imageUrls.length > 0 ? (
                      <img
                        src={item.imageUrls[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        display:
                          item.imageUrls && item.imageUrls.length > 0
                            ? "none"
                            : "flex",
                      }}
                    >
                      <span className="text-4xl">
                        {getDefaultEmoji(item.category)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-4 pb-4">
                  <p className="text-sm text-accent mb-3 font-medium">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-text-secondary mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Upvote Button */}
                      <button
                        onClick={() => handleUpvote(item.id, item.hasUpvoted)}
                        className={`flex items-center space-x-1 hover:bg-subtle rounded-lg px-2 py-1 transition-colors ${
                          item.hasUpvoted
                            ? "text-red-500"
                            : "text-text-secondary"
                        }`}
                        disabled={!user}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            item.hasUpvoted ? "fill-current" : ""
                          }`}
                        />
                        <span className="text-xs font-medium">
                          {item.upvoteCount}
                        </span>
                      </button>

                      {/* Comments placeholder */}
                      <button className="flex items-center space-x-1 hover:bg-subtle rounded-lg px-2 py-1 transition-colors">
                        <MessageCircle className="w-4 h-4 text-text-secondary" />
                        <span className="text-xs font-medium text-text-secondary">
                          {Math.floor(Math.random() * 10) + 1}
                        </span>
                      </button>

                      {/* Location button */}
                      <button className="flex items-center space-x-1 hover:bg-subtle rounded-lg px-2 py-1 transition-colors">
                        <MapPin className="w-4 h-4 text-text-secondary" />
                        <span className="text-xs font-medium text-text-secondary">
                          View
                        </span>
                      </button>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`text-xs font-medium ${item.statusDisplay.color} flex items-center space-x-1`}
                    >
                      <span>{item.statusDisplay.emoji}</span>
                      <span>{item.statusDisplay.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button (optional) */}
        {feedItems.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-subtle text-text-secondary rounded-xl hover:bg-borders transition-colors">
              Load More Issues
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CommunityFeed;
