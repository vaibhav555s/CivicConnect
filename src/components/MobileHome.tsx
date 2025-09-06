import React from 'react';
import { Plus, TrendingUp, MapPin, Camera } from 'lucide-react';

interface MobileHomeProps {
  onNavigate: (tab: string) => void;
}

const MobileHome: React.FC<MobileHomeProps> = ({ onNavigate }) => {
  return (
    <section className="px-4 pt-8 pb-12 bg-gradient-to-b from-subtle to-surface">
      <div className="max-w-lg mx-auto">
        
        {/* Personal Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-accent mb-2">
            Good Evening! ☀️
          </h1>
          <p className="text-text-secondary">Ready to make your city better?</p>
        </div>
        
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-surface border border-borders rounded-2xl p-6 text-center card-hover">
            <div className="text-2xl font-semibold text-accent mb-1">12</div>
            <div className="text-sm text-text-secondary">Your Reports</div>
          </div>
          <div className="bg-surface border border-borders rounded-2xl p-6 text-center card-hover">
            <div className="text-2xl font-semibold text-emerald-600 mb-1">8</div>
            <div className="text-sm text-text-secondary">Resolved</div>
          </div>
        </div>
        
        {/* Primary Action Button */}
        <button 
          onClick={() => onNavigate('report')}
          className="w-full btn-primary py-4 rounded-2xl text-lg mb-8 flex items-center justify-center space-x-2"
        >
          <Camera className="w-5 h-5" />
          <span>Report New Issue</span>
        </button>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onNavigate('reports')}
            className="bg-surface border border-borders rounded-xl p-4 text-center card-hover"
          >
            <div className="text-xl mb-2">📊</div>
            <div className="text-sm font-medium text-text-secondary">My Reports</div>
          </button>
          <button 
            onClick={() => onNavigate('feed')}
            className="bg-surface border border-borders rounded-xl p-4 text-center card-hover"
          >
            <div className="text-xl mb-2">📍</div>
            <div className="text-sm font-medium text-text-secondary">Nearby Issues</div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default MobileHome;