// pages/department/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useDepartmentAuth } from '../contexts/DepartmentAuthContext';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MapPin,
  Users,
  BarChart3,
  Filter,
  Search,
  Bell
} from 'lucide-react';

interface QuickStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  todayResolved: number;
  weeklyResolved: number;
  avgResolutionTime: string;
}

export const DepartmentDashboard: React.FC = () => {
  const { user } = useDepartmentAuth();
  const [stats, setStats] = useState<QuickStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    todayResolved: 0,
    weeklyResolved: 0,
    avgResolutionTime: '0 days'
  });

  // Mock data for now - we'll connect to Firebase later
  useEffect(() => {
    // Simulate loading department-specific stats
    setStats({
      total: 24,
      pending: 8,
      inProgress: 6,
      resolved: 10,
      todayResolved: 3,
      weeklyResolved: 12,
      avgResolutionTime: '2.3 days'
    });
  }, [user?.department]);

  const statCards = [
    {
      title: 'Total Assigned',
      value: stats.total,
      icon: ClipboardList,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: '+2 this week'
    },
    {
      title: 'Pending Action',
      value: stats.pending,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      trend: 'Needs attention'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: 'Active work'
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      trend: `+${stats.todayResolved} today`
    }
  ];

  const quickActions = [
    {
      title: 'View All Issues',
      description: 'Manage assigned civic issues',
      icon: ClipboardList,
      color: 'bg-blue-600',
      href: '/department/issues'
    },
    {
      title: 'Mark Resolved',
      description: 'Update issue status',
      icon: CheckCircle,
      color: 'bg-green-600',
      href: '/department/issues?filter=pending'
    },
    {
      title: 'Field Updates',
      description: 'Upload progress photos',
      icon: MapPin,
      color: 'bg-purple-600',
      href: '/department/issues?tab=updates'
    },
    {
      title: 'Department Analytics',
      description: 'View performance metrics',
      icon: BarChart3,
      color: 'bg-indigo-600',
      href: '/department/analytics'
    }
  ];

  const recentActivity = [
    {
      id: 'ACT001',
      type: 'resolved',
      title: 'Pothole repair completed on MG Road',
      time: '2 hours ago',
      priority: 'high'
    },
    {
      id: 'ACT002', 
      type: 'in_progress',
      title: 'Street light installation in progress',
      time: '4 hours ago',
      priority: 'medium'
    },
    {
      id: 'ACT003',
      type: 'assigned',
      title: 'New water leak report assigned',
      time: '6 hours ago', 
      priority: 'critical'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.displayName}
            </h1>
            <p className="text-blue-100 text-lg">
              Managing {user?.department} • {stats.pending} issues need your attention
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.weeklyResolved}</div>
            <div className="text-blue-200 text-sm">Issues resolved this week</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">{stat.trend}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Quick Actions</h2>
          <div className="text-sm text-gray-500">Choose an action to get started</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
                onClick={() => {
                  // Navigate to action.href when we add routing
                  console.log('Navigate to:', action.href);
                }}
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </div>
                  <div className="text-sm text-gray-600">{action.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-xl">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mr-4
                  ${activity.type === 'resolved' ? 'bg-green-100' : 
                    activity.type === 'in_progress' ? 'bg-amber-100' : 'bg-blue-100'}
                `}>
                  {activity.type === 'resolved' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : activity.type === 'in_progress' ? (
                    <Clock className="w-5 h-5 text-amber-600" />
                  ) : (
                    <Bell className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{activity.title}</div>
                  <div className="text-sm text-gray-600 flex items-center space-x-2">
                    <span>{activity.time}</span>
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${activity.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        activity.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'}
                    `}>
                      {activity.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Performance</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Resolution Rate</span>
                <span className="text-sm font-bold text-green-600">83%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '83%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Avg Response Time</span>
                <span className="text-sm font-bold text-blue-600">{stats.avgResolutionTime}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '76%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Citizen Satisfaction</span>
                <span className="text-sm font-bold text-purple-600">4.2/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Great Progress!</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              You've resolved 20% more issues this month compared to last month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
