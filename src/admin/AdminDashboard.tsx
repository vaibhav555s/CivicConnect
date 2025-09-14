// pages/admin/AdminDashboard.tsx
import React from 'react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-semibold text-black">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-2">Active Issues</h3>
          <p className="text-3xl font-bold text-blue-600">127</p>
          <p className="text-sm text-gray-600">+12% from last week</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-2">Resolved Today</h3>
          <p className="text-3xl font-bold text-emerald-600">23</p>
          <p className="text-sm text-gray-600">+8% from yesterday</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-2">Avg Response</h3>
          <p className="text-3xl font-bold text-amber-600">2.4 hrs</p>
          <p className="text-sm text-gray-600">-15% improvement</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-2">Satisfaction</h3>
          <p className="text-3xl font-bold text-emerald-600">94.2%</p>
          <p className="text-sm text-gray-600">+3% this month</p>
        </div>
      </div>
    </div>
  );
};
