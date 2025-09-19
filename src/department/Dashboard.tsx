// pages/department/Dashboard.tsx - REAL STATS VERSION
import React from 'react';
import { useDepartmentAuth } from '../contexts/DepartmentAuthContext';
import { useDepartmentIssues } from './useDepartmentIssues';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  MapPin,
  Calendar
} from 'lucide-react';

export const DepartmentDashboard: React.FC = () => {
  const { user } = useDepartmentAuth();
  const { stats, issues, loading } = useDepartmentIssues();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header with Real Data */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.department}</h1>
              <p className="text-blue-100 text-lg">
                Managing {user?.department} • {stats.total} issues need your attention
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.todayResolved}</div>
              <div className="text-blue-200 text-sm">Issues resolved today</div>
            </div>
          </div>
          
          {/* New Assignment Alert - Only if there are actual new assignments */}
          {stats.newAssignments > 0 && (
            <div className="mt-6 bg-white/20 border border-white/30 rounded-xl p-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4 text-yellow-900" />
                </div>
                <div>
                  <div className="font-semibold">🔔 New Assignments!</div>
                  <div className="text-blue-100 text-sm">
                    {stats.newAssignments} new issue{stats.newAssignments > 1 ? 's' : ''} just assigned to your department
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ REAL STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Assigned</div>
            </div>
          </div>
          <div className="text-sm text-green-600">
            +{stats.todayAssigned} assigned today
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending Action</div>
            </div>
          </div>
          <div className="text-sm text-red-600">
            {stats.pending === 0 ? 'All caught up!' : 'Need attention'}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </div>
          <div className="text-sm text-amber-600">
            {stats.inProgress === 0 ? 'Nothing active' : 'Being worked on'}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stats.todayResolved}</div>
              <div className="text-sm text-gray-600">Resolved Today</div>
            </div>
          </div>
          <div className="text-sm text-green-600">
            +{stats.resolved} total resolved
          </div>
        </div>
      </div>

      {/* Recent Issues - Show real recent issues */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Assignments</h2>
          <div className="text-sm text-gray-500">Real-time data</div>
        </div>
        
        {issues.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">No Issues Assigned Yet</h3>
            <p className="text-sm">Issues assigned to {user?.department} will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.slice(0, 5).map((issue) => (
              <div 
                key={issue.id} 
                className={`p-4 rounded-xl border transition-all ${
                  issue.isNewAssignment 
                    ? 'border-blue-300 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {issue.isNewAssignment && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full animate-pulse">
                          🆕 NEW
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        issue.status === 'pending' ? 'bg-red-100 text-red-700' :
                        issue.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {issue.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{issue.location.address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{issue.createdAt?.toDate().toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>by {issue.userDisplayName}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 capitalize">{issue.priority} Priority</div>
                    <div className="text-xs text-gray-500">
                      {issue.assignedBy === 'system' ? 'Auto-assigned' : `Assigned by ${issue.assignedBy}`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real Data Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Department Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Issues</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-semibold text-red-700">{stats.pending}</div>
            <div className="text-xs text-red-600">Pending</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg">
            <div className="text-lg font-semibold text-amber-700">{stats.inProgress}</div>
            <div className="text-xs text-amber-600">In Progress</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-semibold text-green-700">{stats.resolved}</div>
            <div className="text-xs text-green-600">Resolved</div>
          </div>
        </div>
      </div>
    </div>
  );
};
