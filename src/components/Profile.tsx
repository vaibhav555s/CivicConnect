import React from 'react';
import { Settings, Bell, HelpCircle, LogOut, User } from 'lucide-react';

const Profile = () => {
  const menuItems = [
    { icon: Settings, label: 'Settings', action: () => {} },
    { icon: Bell, label: 'Notifications', action: () => {} },
    { icon: HelpCircle, label: 'Help & Support', action: () => {} },
    { icon: LogOut, label: 'Sign Out', action: () => {} },
  ];

  return (
    <section className="px-4 pt-6 pb-12">
      <div className="max-w-lg mx-auto">
        
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-subtle rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-text-secondary" />
          </div>
          <h1 className="text-h2 font-semibold text-accent mb-2">Anonymous User</h1>
          <p className="text-text-secondary">Member since January 2024</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-surface border border-borders rounded-2xl p-4 text-center">
            <div className="text-xl font-semibold text-accent mb-1">12</div>
            <div className="text-xs text-text-secondary">Reports</div>
          </div>
          <div className="bg-surface border border-borders rounded-2xl p-4 text-center">
            <div className="text-xl font-semibold text-emerald-600 mb-1">8</div>
            <div className="text-xs text-text-secondary">Resolved</div>
          </div>
          <div className="bg-surface border border-borders rounded-2xl p-4 text-center">
            <div className="text-xl font-semibold text-amber-600 mb-1">4</div>
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
                className="w-full flex items-center justify-between p-4 bg-surface border border-borders rounded-xl hover:border-accent transition-colors duration-200"
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5 text-text-secondary mr-3" />
                  <span className="font-medium text-accent">{item.label}</span>
                </div>
                <span className="text-text-secondary">→</span>
              </button>
            );
          })}
        </div>
        
        {/* App Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-text-secondary mb-2">CivicConnect v1.0.0</p>
          <p className="text-xs text-text-secondary">Making cities better, one report at a time</p>
        </div>
      </div>
    </section>
  );
};

export default Profile;