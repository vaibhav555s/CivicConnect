import React from 'react';
import { ArrowLeft, Share, ThumbsUp, MessageCircle, MapPin } from 'lucide-react';

interface IssueDetailProps {
  onBack: () => void;
}

const IssueDetail: React.FC<IssueDetailProps> = ({ onBack }) => {
  const timelineSteps = [
    {
      id: 1,
      title: 'Report Submitted',
      description: 'Today at 2:30 PM',
      status: 'completed',
      icon: '✓'
    },
    {
      id: 2,
      title: 'Under Review',
      description: 'Assigned to Public Works Dept',
      status: 'current',
      icon: '⏳'
    },
    {
      id: 3,
      title: 'In Progress',
      description: 'Repair work will begin',
      status: 'pending',
      icon: '○'
    },
    {
      id: 4,
      title: 'Resolved',
      description: 'Issue marked as completed',
      status: 'pending',
      icon: '○'
    }
  ];

  return (
    <section className="min-h-screen bg-surface">
      <div className="max-w-lg mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-borders">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-subtle rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h1 className="text-lg font-semibold text-accent">Issue Details</h1>
          <button className="p-2 hover:bg-subtle rounded-lg transition-colors">
            <Share className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        
        {/* Hero Image */}
        <div className="h-64 bg-subtle flex items-center justify-center">
          <span className="text-6xl">🕳️</span>
        </div>
        
        {/* Content */}
        <div className="p-6">
          
          {/* Title & Meta */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-accent mb-2">Pothole on Main Street</h2>
              <div className="flex items-center text-sm text-text-secondary mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>Near Coffee Shop Junction</span>
              </div>
              <div className="text-sm text-text-secondary">⏰ Reported 2 hours ago</div>
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
              ⏳ In Review
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <p className="text-accent leading-relaxed">Large pothole causing traffic issues near the main intersection. Multiple vehicles are swerving to avoid it which creates safety hazard for pedestrians and other vehicles.</p>
          </div>
          
          {/* Progress Timeline */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-accent mb-4">Progress Timeline</h3>
            <div className="space-y-4">
              {timelineSteps.map((step) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                    step.status === 'completed' 
                      ? 'bg-emerald-500 text-white' 
                      : step.status === 'current'
                      ? 'bg-amber-500 text-white'
                      : 'bg-borders text-text-secondary'
                  }`}>
                    <span className="text-sm">{step.icon}</span>
                  </div>
                  <div>
                    <div className={`font-medium ${
                      step.status === 'pending' ? 'text-text-secondary' : 'text-accent'
                    }`}>
                      {step.title}
                    </div>
                    <div className={`text-sm ${
                      step.status === 'pending' ? 'text-text-secondary' : 'text-text-secondary'
                    }`}>
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Community Engagement */}
          <div className="border-t border-borders pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-accent">Community</h3>
              <div className="text-sm text-text-secondary">24 people affected</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-subtle rounded-xl hover:bg-borders transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">Upvote (24)</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-subtle rounded-xl hover:bg-borders transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Comment (8)</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-subtle rounded-xl hover:bg-borders transition-colors">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Directions</span>
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default IssueDetail;