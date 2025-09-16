// pages/department/Issues.tsx
import React, { useState } from 'react';
import { useDepartmentIssues } from './useDepartmentIssues';
import { PhotoUpload } from '../department/PhotoUpload';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  MessageCircle,
  Filter,
  Search,
  FileText,
  Camera,
  ArrowRight,
  ChevronDown,
  Loader
} from 'lucide-react';

export const DepartmentIssues: React.FC = () => {
  const { issues, loading, updateIssueStatus, addComment, stats } = useDepartmentIssues();
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');
  const [search, setSearch] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const filteredIssues = issues.filter(issue => {
    const matchesFilter = filter === 'all' || issue.status === filter;
    const matchesSearch = issue.title.toLowerCase().includes(search.toLowerCase()) ||
                         issue.description.toLowerCase().includes(search.toLowerCase()) ||
                         issue.location.address.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStatusUpdate = async (issueId: string, newStatus: 'pending' | 'in-progress' | 'resolved') => {
    setUpdating(issueId);
    try {
      await updateIssueStatus(issueId, newStatus, comment);
      setComment('');
      setSelectedIssue(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-red-600 bg-red-50 border-red-200';
      case 'in-progress': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-700 bg-red-100';
      case 'high': return 'text-orange-700 bg-orange-100';
      case 'medium': return 'text-blue-700 bg-blue-100';
      case 'low': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading your assigned issues...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Issues</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved Today</p>
              <p className="text-2xl font-bold text-green-600">{stats.todayResolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Issues</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h3>
            <p className="text-gray-600">
              {filter === 'all' ? 'No issues assigned to your department yet.' : `No ${filter} issues found.`}
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div key={issue.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(issue.priority)}`}>
                        {issue.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{issue.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Reported by {issue.userDisplayName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{issue.location.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{issue.createdAt?.toDate().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                    className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                      selectedIssue === issue.id ? 'rotate-180' : ''
                    }`} />
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-2 mt-4">
                  {issue.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(issue.id, 'in-progress')}
                      disabled={updating === issue.id}
                      className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {updating === issue.id ? <Loader className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                      <span>Start Work</span>
                    </button>
                  )}
                  
                  {issue.status === 'in-progress' && (
                    <button
                      onClick={() => handleStatusUpdate(issue.id, 'resolved')}
                      disabled={updating === issue.id}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {updating === issue.id ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      <span>Mark Resolved</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 flex items-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedIssue === issue.id && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="space-y-6">
                    {/* Existing Photos Display */}
                    {(issue.beforeAfterImages?.before?.length || issue.beforeAfterImages?.after?.length) && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Issue Photos</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Before Photos */}
                          {issue.beforeAfterImages?.before?.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                Before Photos ({issue.beforeAfterImages.before.length})
                              </h5>
                              <div className="grid grid-cols-2 gap-2">
                                {issue.beforeAfterImages.before.map((url, index) => (
                                  <img
                                    key={index}
                                    src={url}
                                    alt={`Before ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                                    onClick={() => window.open(url, '_blank')}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* After Photos */}
                          {issue.beforeAfterImages?.after?.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                After Photos ({issue.beforeAfterImages.after.length})
                              </h5>
                              <div className="grid grid-cols-2 gap-2">
                                {issue.beforeAfterImages.after.map((url, index) => (
                                  <img
                                    key={index}
                                    src={url}
                                    alt={`After ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                                    onClick={() => window.open(url, '_blank')}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Photo Upload Section */}
                    {issue.status !== 'resolved' && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Add Photos</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Before Photos Upload */}
                          {issue.status === 'pending' && (
                            <PhotoUpload
                              issueId={issue.id}
                              type="before"
                              maxFiles={3}
                              onUploadComplete={(urls) => {
                                console.log('Before photos uploaded:', urls);
                              }}
                            />
                          )}

                          {/* Progress Photos Upload */}
                          {issue.status === 'in-progress' && (
                            <PhotoUpload
                              issueId={issue.id}
                              type="progress"
                              maxFiles={5}
                              onUploadComplete={(urls) => {
                                console.log('Progress photos uploaded:', urls);
                              }}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* After Photos Upload (for resolved issues) */}
                    {issue.status === 'resolved' && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Resolution Photos</h4>
                        <PhotoUpload
                          issueId={issue.id}
                          type="after"
                          maxFiles={3}
                          onUploadComplete={(urls) => {
                            console.log('After photos uploaded:', urls);
                          }}
                        />
                      </div>
                    )}

                    {/* Comments Section */}
                    {issue.departmentComments && issue.departmentComments.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Department Updates</h4>
                        <div className="space-y-2">
                          {issue.departmentComments.map((comment) => (
                            <div key={comment.id} className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm text-gray-900">{comment.author}</span>
                                <span className="text-xs text-gray-500">
                                  {comment.timestamp?.toDate?.().toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Comment */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Add Update</h4>
                      <div className="space-y-3">
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add a comment or update about this issue..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                          rows={3}
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => addComment(issue.id, comment).then(() => setComment(''))}
                            disabled={!comment.trim()}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            Add Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
