import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface MyReportsProps {
  onNavigate: (tab: string) => void;
}

const MyReports: React.FC<MyReportsProps> = ({ onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All (12)' },
    { id: 'pending', label: 'Pending (4)' },
    { id: 'resolved', label: 'Resolved (8)' },
  ];

  const reports = [
    {
      id: 1,
      title: 'Main St Pothole',
      category: '🛣️',
      location: 'Bandra',
      timeAgo: '2 days ago',
      status: 'Resolved',
      statusColor: 'bg-emerald-100 text-emerald-800',
      progress: 100,
      progressColor: 'bg-emerald-500',
      image: '🕳️'
    },
    {
      id: 2,
      title: 'Park Rd Light',
      category: '💡',
      location: 'Juhu',
      timeAgo: '4 hours ago',
      status: 'Review',
      statusColor: 'bg-amber-100 text-amber-800',
      progress: 60,
      progressColor: 'bg-amber-500',
      image: '💡'
    },
    {
      id: 3,
      title: 'Water Leak',
      category: '💧',
      location: 'Andheri',
      timeAgo: '1 day ago',
      status: 'Assigned',
      statusColor: 'bg-blue-100 text-blue-800',
      progress: 25,
      progressColor: 'bg-blue-500',
      image: '💧'
    },
    {
      id: 4,
      title: 'Waste Collection',
      category: '🗑️',
      location: 'Versova',
      timeAgo: '3 days ago',
      status: 'Resolved',
      statusColor: 'bg-emerald-100 text-emerald-800',
      progress: 100,
      progressColor: 'bg-emerald-500',
      image: '🗑️'
    }
  ];

  return (
    <section className="px-4 pt-6 pb-12">
      <div className="max-w-lg mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-h2 font-semibold text-accent">My Reports</h1>
            <p className="text-sm text-text-secondary">12 reports • 8 resolved</p>
          </div>
          <button 
            onClick={() => onNavigate('report')}
            className="bg-accent text-white p-3 rounded-xl hover:opacity-95 transition-opacity"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Filter Pills */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                activeFilter === filter.id
                  ? 'bg-accent text-white'
                  : 'bg-subtle text-text-secondary hover:bg-borders'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        
        {/* Reports Grid */}
        <div className="grid grid-cols-2 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-surface border border-borders rounded-2xl overflow-hidden card-hover">
              <div className="h-32 bg-subtle flex items-center justify-center">
                <span className="text-3xl">{report.image}</span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{report.category}</span>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${report.statusColor}`}>
                    {report.status === 'Resolved' ? '✅' : report.status === 'Review' ? '⏳' : '📋'} {report.status}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-accent mb-1">{report.title}</h3>
                <div className="text-xs text-text-secondary">📍 {report.location} • {report.timeAgo}</div>
                <div className="mt-3">
                  <div className="h-1 bg-borders rounded-full">
                    <div 
                      className={`h-full ${report.progressColor} rounded-full transition-all duration-300`}
                      style={{ width: `${report.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MyReports;