// pages/department/Analytics.tsx
import React from 'react';
import { useDepartmentAuth } from '../contexts/DepartmentAuthContext';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Calendar,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

export const DepartmentAnalytics: React.FC = () => {
  const { user } = useDepartmentAuth();

  // Mock analytics data - will be replaced with real Firebase data later
  const analyticsData = {
    thisMonth: {
      resolved: 45,
      pending: 12,
      inProgress: 8,
      avgResolutionTime: 2.3,
      satisfactionScore: 4.2,
      responseTime: 1.8
    },
    lastMonth: {
      resolved: 38,
      pending: 15,
      inProgress: 6,
      avgResolutionTime: 2.8,
      satisfactionScore: 3.9,
      responseTime: 2.1
    },
    weeklyTrends: [
      { week: 'Week 1', resolved: 12, pending: 3 },
      { week: 'Week 2', resolved: 8, pending: 5 },
      { week: 'Week 3', resolved: 15, pending: 2 },
      { week: 'Week 4', resolved: 10, pending: 2 }
    ],
    categoryBreakdown: [
      { category: 'Emergency', count: 8, percentage: 18 },
      { category: 'Maintenance', count: 25, percentage: 56 },
      { category: 'Installation', count: 7, percentage: 16 },
      { category: 'Inspection', count: 5, percentage: 10 }
    ]
  };

  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change > 0 };
  };

  const performanceMetrics = [
    {
      title: 'Issues Resolved',
      current: analyticsData.thisMonth.resolved,
      previous: analyticsData.lastMonth.resolved,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      unit: 'issues'
    },
    {
      title: 'Avg Resolution Time',
      current: analyticsData.thisMonth.avgResolutionTime,
      previous: analyticsData.lastMonth.avgResolutionTime,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      unit: 'days',
      lowerIsBetter: true
    },
    {
      title: 'Satisfaction Score',
      current: analyticsData.thisMonth.satisfactionScore,
      previous: analyticsData.lastMonth.satisfactionScore,
      icon: Award,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      unit: '/5.0'
    },
    {
      title: 'Response Time',
      current: analyticsData.thisMonth.responseTime,
      previous: analyticsData.lastMonth.responseTime,
      icon: Target,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      unit: 'hours',
      lowerIsBetter: true
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Department Analytics</h1>
            <p className="text-blue-100 text-lg">
              Performance insights for {user?.department}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">95%</div>
            <div className="text-blue-200 text-sm">Overall Performance</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => {
          const change = calculateChange(metric.current, metric.previous);
          const isImprovement = metric.lowerIsBetter ? !change.isPositive : change.isPositive;
          const Icon = metric.icon;

          return (
            <div key={index} className={`bg-white rounded-2xl border ${metric.border} p-6 hover:shadow-lg transition-shadow`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${metric.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.current}{metric.unit}
                  </div>
                  <div className="text-sm text-gray-600">{metric.title}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-1 ${
                  isImprovement ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isImprovement ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {change.value.toFixed(1)}%
                  </span>
                </div>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Trends Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Weekly Performance</h3>
              <p className="text-gray-600 text-sm">Issues resolved vs pending</p>
            </div>
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="space-y-4">
            {analyticsData.weeklyTrends.map((week, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{week.week}</span>
                  <span className="text-sm text-gray-600">{week.resolved} resolved</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="flex h-full">
                    <div 
                      className="bg-green-500 transition-all duration-500"
                      style={{ width: `${(week.resolved / (week.resolved + week.pending)) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-red-400 transition-all duration-500"
                      style={{ width: `${(week.pending / (week.resolved + week.pending)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Issue Categories</h3>
              <p className="text-gray-600 text-sm">Distribution this month</p>
            </div>
            <PieChart className="w-6 h-6 text-purple-600" />
          </div>
          
          <div className="space-y-4">
            {analyticsData.categoryBreakdown.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{category.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{category.count}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${category.percentage}%`,
                        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index]
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-8">{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Performance Summary</h3>
          <Activity className="w-6 h-6 text-green-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="text-2xl font-bold text-green-700 mb-2">Excellent</div>
            <div className="text-sm text-green-600 mb-3">Resolution Rate</div>
            <div className="text-3xl font-bold text-green-800">94%</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="text-2xl font-bold text-blue-700 mb-2">Good</div>
            <div className="text-sm text-blue-600 mb-3">Response Time</div>
            <div className="text-3xl font-bold text-blue-800">1.8h</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="text-2xl font-bold text-purple-700 mb-2">Great</div>
            <div className="text-sm text-purple-600 mb-3">Citizen Rating</div>
            <div className="text-3xl font-bold text-purple-800">4.2/5</div>
          </div>
        </div>
      </div>

      {/* Goals & Targets */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Monthly Goals</h3>
          <Target className="w-6 h-6 text-orange-600" />
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Resolve 50 Issues</span>
              <span className="text-sm text-blue-600 font-medium">45/50 (90%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-500 h-3 rounded-full transition-all duration-500" style={{ width: '90%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Maintain 4.0+ Rating</span>
              <span className="text-sm text-green-600 font-medium">4.2/5.0 ✓</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full transition-all duration-500" style={{ width: '84%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Reduce Response Time to 2h</span>
              <span className="text-sm text-green-600 font-medium">1.8h ✓</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full transition-all duration-500" style={{ width: '95%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
