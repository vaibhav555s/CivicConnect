// components/admin/IssueDetailModal.tsx
import React, { useState, useEffect } from 'react';

// Define proper types
type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
type IssueStatus = 'pending' | 'assigned' | 'in-progress' | 'resolved' | 'closed';
type IssueCategory = 'roads' | 'lighting' | 'water' | 'waste';

interface Issue {
  id: string;
  category: IssueCategory;
  title: string;
  description: string;
  location: string;
  reportedAt: string;
  status: IssueStatus;
  priority: IssuePriority;
  department?: string;
  assignedTo?: string;
  photos: string[];
  reporterInfo: {
    anonymous: boolean;
    contact?: string;
  };
}

interface IssueDetailModalProps {
  issueId: string;
  onClose: () => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({ issueId, onClose }) => {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data fetch - replace with actual API call
    const mockIssue: Issue = {
      id: issueId,
      category: 'roads',
      title: 'Large pothole on Main Street',
      description: 'Deep pothole causing traffic issues near the intersection with Park Road. Several vehicles have been damaged. The hole is approximately 2 feet wide and 8 inches deep. Water accumulates in the hole during rain, making it even more dangerous for vehicles and pedestrians.',
      location: 'Main Street, Bandra West, Mumbai - 400050',
      reportedAt: '2024-01-15T10:30:00Z',
      status: 'pending',
      priority: 'high',
      photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
      reporterInfo: { anonymous: false, contact: 'citizen@example.com' }
    };
    
    setTimeout(() => {
      setIssue(mockIssue);
      setLoading(false);
    }, 500);
  }, [issueId]);

  const getStatusBadge = (status: IssueStatus) => {
    const statusConfig: Record<IssueStatus, string> = {
      'pending': 'bg-gray-100 text-gray-800',
      'assigned': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-amber-100 text-amber-800',
      'resolved': 'bg-emerald-100 text-emerald-800',
      'closed': 'bg-gray-100 text-gray-600'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[status]}`}>
        {status.replace('-', ' ').toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority: IssuePriority) => {
    const priorityConfig: Record<IssuePriority, string> = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityConfig[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const handleStatusUpdate = (newStatus: IssueStatus) => {
    if (issue) {
      setIssue({ ...issue, status: newStatus });
    }
  };

  const handleDepartmentAssign = (department: string) => {
    if (issue) {
      setIssue({ ...issue, department, status: 'assigned' });
    }
  };

  const handlePriorityChange = (newPriority: IssuePriority) => {
    if (issue) {
      setIssue({ ...issue, priority: newPriority });
    }
  };

  const handleStaffAssign = (staffMember: string) => {
    if (issue) {
      setIssue({ ...issue, assignedTo: staffMember });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (!issue) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              {issue.category === 'roads' && '🛣️'}
              {issue.category === 'lighting' && '💡'}
              {issue.category === 'water' && '💧'}
              {issue.category === 'waste' && '🗑️'}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-black">{issue.title}</h2>
              <p className="text-gray-600">Issue ID: {issue.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Issue Info */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-black mb-2">Status</h3>
                    {getStatusBadge(issue.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-2">Priority</h3>
                    {getPriorityBadge(issue.priority)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-2">Category</h3>
                    <p className="text-gray-600 capitalize">{issue.category}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-2">Reported</h3>
                    <p className="text-gray-600">{new Date(issue.reportedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-black mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed">{issue.description}</p>
              </div>

              {/* Photos */}
              <div>
                <h3 className="text-xl font-semibold text-black mb-4">Photos ({issue.photos.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {issue.photos.map((photo, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                      <span className="text-gray-400">📸 Photo {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-xl font-semibold text-black mb-4">Location</h3>
                <div className="bg-gray-100 rounded-xl p-6 flex items-center hover:bg-gray-200 transition-colors cursor-pointer">
                  <span className="text-2xl mr-4">📍</span>
                  <div>
                    <p className="font-medium text-black">{issue.location}</p>
                    <p className="text-gray-600 text-sm">Click to view on map</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-xl font-semibold text-black mb-4">Activity Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-black">Issue Reported</p>
                      <p className="text-gray-600 text-sm">{new Date(issue.reportedAt).toLocaleString()}</p>
                      <p className="text-gray-500 text-xs mt-1">Reported by {issue.reporterInfo.anonymous ? 'Anonymous User' : issue.reporterInfo.contact}</p>
                    </div>
                  </div>
                  {issue.status === 'pending' && (
                    <div className="flex items-start space-x-4">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-400">Awaiting Assignment</p>
                        <p className="text-gray-400 text-sm">Pending department assignment</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Sidebar */}
            <div className="space-y-6">
              
              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold text-black mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-black text-white py-3 rounded-xl font-medium hover:opacity-95 transition-opacity">
                    Assign Department
                  </button>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:opacity-95 transition-opacity">
                    Update Status
                  </button>
                  <button className="w-full bg-amber-600 text-white py-3 rounded-xl font-medium hover:opacity-95 transition-opacity">
                    Change Priority
                  </button>
                  <button className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                    Send Update to Reporter
                  </button>
                </div>
              </div>

              {/* Assignment Info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold text-black mb-4">Assignment</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select 
                      value={issue.department || ''}
                      onChange={(e) => handleDepartmentAssign(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                    >
                      <option value="">Select Department</option>
                      <option value="Public Works">Public Works</option>
                      <option value="Electrical Department">Electrical Department</option>
                      <option value="Water Department">Water & Sanitation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Staff</label>
                    <select 
                      value={issue.assignedTo || ''}
                      onChange={(e) => handleStaffAssign(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                    >
                      <option value="">Select Staff Member</option>
                      <option value="John Smith">John Smith</option>
                      <option value="Mike Johnson">Mike Johnson</option>
                      <option value="Sarah Wilson">Sarah Wilson</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Reporter Info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold text-black mb-4">Reporter Information</h3>
                {issue.reporterInfo.anonymous ? (
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">👤</span>
                    <span>Anonymous Report</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">📧</span>
                      <span>{issue.reporterInfo.contact}</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Contact Reporter
                    </button>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold text-black mb-4">Internal Notes</h3>
                <textarea 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none resize-none"
                  rows={4}
                  placeholder="Add internal notes..."
                />
                <button className="mt-3 w-full bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
