import React from 'react';
import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import BottomNavigation from './components/BottomNavigation';
import MobileHome from './components/MobileHome';
import CommunityFeed from './components/CommunityFeed';
import MyReports from './components/MyReports';
import Profile from './components/Profile';
import MobileReportSection from './components/MobileReportSection';
import IssueDetail from './components/IssueDetail';
import AuthPage from './components/auth/AuthPage';

function App() {
  const [activeTab, setActiveTab] = useState('home');
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
      case 'home':
        return <MobileHome onNavigate={handleTabChange} onAuthRequired={handleAuthRequired} />;
      case 'report':
        return <MobileReportSection onBack={() => setActiveTab('home')} onAuthRequired={handleAuthRequired} />;
      case 'feed':
        return <CommunityFeed />;
      case 'reports':
        return <MyReports onNavigate={handleTabChange} onAuthRequired={handleAuthRequired} />;
      case 'profile':
        return <Profile onAuthRequired={handleAuthRequired} />;
      default:
        return <MobileHome onNavigate={handleTabChange} onAuthRequired={handleAuthRequired} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background font-sans">
        {/* Main Content Area */}
        <main className="pb-20 safe-area-pt">
          {renderContent()}
        </main>
        
        {/* Bottom Navigation */}
        {!showIssueDetail && activeTab !== 'report' && !showAuth && (
          <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        )}
      </div>
    </AuthProvider>
  );
}

export default App;