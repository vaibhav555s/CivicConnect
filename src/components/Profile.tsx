import React from "react";
import {
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

interface ProfileProps {
  onAuthRequired: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onAuthRequired }) => {
  // Expect AuthContext to provide these
  const { user, userProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    { icon: Settings, label: "Settings", action: () => {} },
    { icon: Bell, label: "Notifications", action: () => {} },
    { icon: HelpCircle, label: "Help & Support", action: () => {} },
    { icon: LogOut, label: "Sign Out", action: handleLogout },
  ];

  // Safely compute display name and email
  const displayName =
    userProfile?.displayName ||
    userProfile?.fullName ||
    user?.displayName ||
    "User";

  const primaryContact =
    userProfile?.email || user?.email || userProfile?.phoneNumber || "";

  // Safely format createdAt if present (string ISO or Firestore Timestamp)
  const createdAtDate = (() => {
    const ca = (userProfile as any)?.createdAt;
    if (!ca) return null;
    if (typeof ca === "string") return new Date(ca);
    if (ca?.toDate) return ca.toDate();
    if (ca?.seconds) return new Date(ca.seconds * 1000);
    return null;
  })();

  return (
    <ProtectedRoute
      onAuthRequired={onAuthRequired}
      message="Sign in to view your profile"
    >
      <section className="px-4 pt-6 pb-12">
        <div className="max-w-lg mx-auto">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-subtle rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-text-secondary" />
            </div>
            <h1 className="text-h2 font-semibold text-accent mb-2">
              {displayName}
            </h1>
            <p className="text-text-secondary">{primaryContact}</p>
            <p className="text-text-secondary text-sm">
              Member since{" "}
              {createdAtDate
                ? createdAtDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "Recently"}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-surface border border-borders rounded-2xl p-4 text-center">
              <div className="text-xl font-semibold text-accent mb-1">
                {userProfile?.stats?.reportsSubmitted ?? 0}
              </div>
              <div className="text-xs text-text-secondary">Reports</div>
            </div>
            <div className="bg-surface border border-borders rounded-2xl p-4 text-center">
              <div className="text-xl font-semibold text-emerald-600 mb-1">
                {userProfile?.stats?.reportsResolved ?? 0}
              </div>
              <div className="text-xs text-text-secondary">Resolved</div>
            </div>
            <div className="bg-surface border border-borders rounded-2xl p-4 text-center">
              <div className="text-xl font-semibold text-amber-600 mb-1">
                {(userProfile?.stats?.reportsSubmitted ?? 0) -
                  (userProfile?.stats?.reportsResolved ?? 0)}
              </div>
              <div className="text-xs text-text-secondary">Pending</div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between p-4 bg-surface border border-borders rounded-xl hover:border-accent transition-colors duration-200 ${
                    item.label === "Sign Out"
                      ? "hover:bg-red-50 hover:border-red-200"
                      : ""
                  }`}
                >
                  <div className="flex items-center">
                    <Icon
                      className={`w-5 h-5 mr-3 ${
                        item.label === "Sign Out"
                          ? "text-red-600"
                          : "text-text-secondary"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        item.label === "Sign Out"
                          ? "text-red-600"
                          : "text-accent"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span className="text-text-secondary">→</span>
                </button>
              );
            })}
          </div>

          {/* App Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-text-secondary mb-2">
              CivicConnect v1.0.0
            </p>
            <p className="text-xs text-text-secondary">
              Making cities better, one report at a time
            </p>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
};

export default Profile;
