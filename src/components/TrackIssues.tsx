import React from 'react';

const TrackIssues = () => {
  const issues = [
    {
      id: '#CV-2024-001',
      category: '🛣️',
      title: 'Pothole on Main Street',
      description: 'Large pothole causing traffic issues near the intersection',
      location: 'Main Street, Bandra',
      reportedTime: '2 hours ago',
      status: 'In Review',
      statusColor: 'bg-amber-100 text-amber-800',
      progress: 60,
      progressColor: 'bg-amber-500',
    },
    {
      id: '#CV-2024-002',
      category: '💡',
      title: 'Broken Street Light',
      description: 'Street light not working on Park Road causing safety concerns',
      location: 'Park Road, Juhu',
      reportedTime: 'Resolved yesterday',
      status: '✅ Resolved',
      statusColor: 'bg-emerald-100 text-emerald-800',
      progress: 100,
      progressColor: 'bg-emerald-500',
    },
    {
      id: '#CV-2024-003',
      category: '💧',
      title: 'Water Leak',
      description: 'Continuous water leak from municipal pipe affecting residents',
      location: 'Link Road, Andheri',
      reportedTime: '1 day ago',
      status: 'Assigned',
      statusColor: 'bg-blue-100 text-blue-800',
      progress: 25,
      progressColor: 'bg-blue-500',
    },
  ];

  return (
    <section id="track" className="py-16 md:py-32 bg-subtle px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <h2 className="text-h1 md:text-5xl font-semibold text-accent mb-8 md:mb-16">
          Track Your Issues
        </h2>
        
        {/* Issues List */}
        <div className="space-y-4">
          {issues.map((issue) => (
            <div key={issue.id} className="bg-surface card-hover rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                
                <div className="flex-1 mb-4 md:mb-0">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-4">{issue.category}</span>
                    <h3 className="text-xl font-semibold text-accent">{issue.title}</h3>
                  </div>
                  <p className="text-text-secondary mb-3">{issue.description}</p>
                  <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-500">
                    <span>📍 {issue.location}</span>
                    <span className="hidden md:inline mx-3">•</span>
                    <span>{issue.reportedTime}</span>
                  </div>
                </div>
                
                <div className="text-left md:text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${issue.statusColor}`}>
                    {issue.status}
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {issue.id}
                  </div>
                </div>
                
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Progress</span>
                  <span>{issue.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className={`h-full ${issue.progressColor} rounded-full transition-all duration-300`}
                    style={{ width: `${issue.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrackIssues;