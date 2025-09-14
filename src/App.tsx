import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";


// User Components
import BottomNavigation from "./components/BottomNavigation";
import MobileHome from "./components/MobileHome";
import CommunityFeed from "./components/CommunityFeed";
import MyReports from "./components/MyReports";
import Profile from "./components/Profile";
import MobileReportSection from "./components/MobileReportSection";
import IssueDetail from "./components/IssueDetail";
import AuthPage from "./components/auth/AuthPage";

// Admin Components
import { AdminRoutes } from "./routes/AdminRoutes";

// Separate the existing mobile app content into UserApp component
const UserApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showIssueDetail, setShowIssueDetail] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setShowIssueDetail(false);
  };

  const handleAuthRequired = () => {
    setShowAuth(true);
  };

  const handleAuthComplete = () => {
    setShowAuth(false);
  };

  const renderContent = () => {
    if (showAuth) {
      return <AuthPage onBack={handleAuthComplete} />;
    }
    if (showIssueDetail) {
      return <IssueDetail onBack={() => setShowIssueDetail(false)} />;
    }
    switch (activeTab) {
      case "home":
        return (
          <MobileHome
            onNavigate={handleTabChange}
            onAuthRequired={handleAuthRequired}
          />
        );
      case "report":
        return (
          <MobileReportSection
            onBack={() => setActiveTab("home")}
            onAuthRequired={handleAuthRequired}
          />
        );
      case "feed":
        return <CommunityFeed />;
      case "reports":
        return (
          <MyReports
            onNavigate={handleTabChange}
            onAuthRequired={handleAuthRequired}
          />
        );
      case "profile":
        return <Profile onAuthRequired={handleAuthRequired} />;
      default:
        return (
          <MobileHome
            onNavigate={handleTabChange}
            onAuthRequired={handleAuthRequired}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Main Content Area */}
      <main className="pb-20 safe-area-pt">{renderContent()}</main>

      {/* Bottom Navigation - hide on report or auth */}
      {!showIssueDetail && activeTab !== "report" && !showAuth && (
        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
};

// Main App component with routing
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* User routes - render UserApp for relevant paths */}
          <Route path="/" element={<UserApp />} />
          <Route path="/home" element={<UserApp />} />
          <Route path="/report" element={<UserApp />} />
          <Route path="/feed" element={<UserApp />} />
          <Route path="/reports" element={<UserApp />} />
          <Route path="/profile" element={<UserApp />} />

          {/* Admin routes */}
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
