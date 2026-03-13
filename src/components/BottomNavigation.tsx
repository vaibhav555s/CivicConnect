import React from 'react';
import { Home, Camera, Globe, BarChart3, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'report', icon: Camera, label: 'Report' },
    { id: 'feed', icon: Globe, label: 'Feed' },
    { id: 'reports', icon: BarChart3, label: 'Mine' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm glass-panel rounded-2xl z-50">
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-indigo-600'
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-indigo-50 rounded-xl -z-10 transition-all duration-200"></div>
              )}
              <Icon className={`w-5 h-5 mb-0.5 transition-all duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[9px] font-bold tracking-widest uppercase ${isActive ? 'opacity-100' : 'opacity-50'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;