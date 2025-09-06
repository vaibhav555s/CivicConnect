import React from 'react';
import { useState } from 'react';
import BottomNavigation from './components/BottomNavigation';
import MobileHome from './components/MobileHome';
import CommunityFeed from './components/CommunityFeed';
import MyReports from './components/MyReports';
import Profile from './components/Profile';
import MobileReportSection from './components/MobileReportSection';
import IssueDetail from './components/IssueDetail';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showIssueDetail, setShowIssueDetail] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setShowIssueDetail(false);
  };

  const renderContent = () => {
    if (showIssueDetail) {
      return <IssueDetail onBack={() => setShowIssueDetail(false)} />;
    }

    switch (activeTab) {
      case 'home':
        return <MobileHome onNavigate={handleTabChange} />;
      case 'report':
        return <MobileReportSection onBack={() => setActiveTab('home')} />;
      case 'feed':
        return <CommunityFeed />;
      case 'reports':
        return <MyReports onNavigate={handleTabChange} />;
      case 'profile':
        return <Profile />;
      default:
        return <MobileHome onNavigate={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Main Content Area */}
      <main className="pb-20 safe-area-pt">
        {renderContent()}
      </main>
      
      {/* Bottom Navigation */}
      {!showIssueDetail && activeTab !== 'report' && (
        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
}

export default App;