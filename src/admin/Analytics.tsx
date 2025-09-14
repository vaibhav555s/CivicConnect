// pages/admin/Analytics.tsx
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsData {
  issueResolutionTrend: {
    labels: string[];
    data: number[];
  };
  categoryDistribution: {
    labels: string[];
    data: number[];
    colors: string[];
  };
  departmentPerformance: {
    labels: string[];
    resolved: number[];
    pending: number[];
  };
  geographicData: {
    area: string;
    issues: number;
    resolved: number;
    avgTime: string;
  }[];
  satisfactionTrend: {
    labels: string[];
    data: number[];
  };
}

export const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeframe, setTimeframe] = useState('30days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock analytics data - replace with real API call
    const mockData: AnalyticsData = {
      issueResolutionTrend: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: [23, 45, 38, 52]
      },
      categoryDistribution: {
        labels: ['Roads', 'Lighting', 'Water', 'Waste', 'Others'],
        data: [45, 23, 18, 12, 8],
        colors: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#6B7280']
      },
      departmentPerformance: {
        labels: ['Public Works', 'Electrical', 'Water & Sanitation', 'Waste Management'],
        resolved: [89, 76, 65, 43],
        pending: [12, 8, 15, 7]
      },
      geographicData: [
        { area: 'Bandra West', issues: 45, resolved: 38, avgTime: '2.3 days' },
        { area: 'Juhu', issues: 32, resolved: 28, avgTime: '1.8 days' },
        { area: 'Andheri East', issues: 28, resolved: 22, avgTime: '3.1 days' },
        { area: 'Powai', issues: 19, resolved: 17, avgTime: '1.5 days' }
      ],
      satisfactionTrend: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [87, 89, 92, 88, 94, 91]
      }
    };

    setTimeout(() => {
      setAnalyticsData(mockData);
      setLoading(false);
    }, 1000);
  }, [timeframe]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        <span className="ml-4 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (!analyticsData) return null;

  // Chart configurations
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-black">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Insights and performance metrics for civic issue management</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 3 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button className="bg-black text-white px-6 py-2 rounded-xl font-medium hover:opacity-95 transition-opacity">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Issues</p>
              <p className="text-3xl font-bold text-black">1,247</p>
              <p className="text-emerald-600 text-sm">↗ +12% from last month</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Resolution Rate</p>
              <p className="text-3xl font-bold text-emerald-600">87.3%</p>
              <p className="text-emerald-600 text-sm">↗ +5% from last month</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Resolution Time</p>
              <p className="text-3xl font-bold text-amber-600">2.4</p>
              <p className="text-emerald-600 text-sm">↘ -15% faster</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⏱️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Citizen Satisfaction</p>
              <p className="text-3xl font-bold text-blue-600">91.2%</p>
              <p className="text-emerald-600 text-sm">↗ +3% from last month</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">😊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Issue Resolution Trend */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-black">Issue Resolution Trend</h2>
            <span className="text-gray-500 text-sm">Last 4 weeks</span>
          </div>
          <div className="h-64">
            <Line
              data={{
                labels: analyticsData.issueResolutionTrend.labels,
                datasets: [
                  {
                    label: 'Issues Resolved',
                    data: analyticsData.issueResolutionTrend.data,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }}
              options={lineChartOptions}
            />
          </div>
        </div>

        {/* Issue Categories Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-black">Issues by Category</h2>
            <span className="text-gray-500 text-sm">Current month</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={{
                labels: analyticsData.categoryDistribution.labels,
                datasets: [
                  {
                    data: analyticsData.categoryDistribution.data,
                    backgroundColor: analyticsData.categoryDistribution.colors,
                    borderWidth: 2,
                    borderColor: '#FFFFFF',
                  },
                ],
              }}
              options={doughnutOptions}
            />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Performance */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-black">Department Performance</h2>
            <span className="text-gray-500 text-sm">Current month</span>
          </div>
          <div className="h-64">
            <Bar
              data={{
                labels: analyticsData.departmentPerformance.labels,
                datasets: [
                  {
                    label: 'Resolved',
                    data: analyticsData.departmentPerformance.resolved,
                    backgroundColor: '#10B981',
                  },
                  {
                    label: 'Pending',
                    data: analyticsData.departmentPerformance.pending,
                    backgroundColor: '#F59E0B',
                  },
                ],
              }}
              options={barChartOptions}
            />
          </div>
        </div>

        {/* Citizen Satisfaction Trend */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-black">Citizen Satisfaction</h2>
            <span className="text-gray-500 text-sm">Last 6 months</span>
          </div>
          <div className="h-64">
            <Line
              data={{
                labels: analyticsData.satisfactionTrend.labels,
                datasets: [
                  {
                    label: 'Satisfaction %',
                    data: analyticsData.satisfactionTrend.data,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }}
              options={{
                ...lineChartOptions,
                scales: {
                  ...lineChartOptions.scales,
                  y: {
                    ...lineChartOptions.scales.y,
                    min: 80,
                    max: 100,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Geographic Analysis */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-black">Geographic Analysis</h2>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View Full Map
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsData.geographicData.map((area, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-6 hover:border-black transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-black">{area.area}</h3>
                <span className="text-2xl">📍</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Total Issues</span>
                  <span className="font-medium text-black">{area.issues}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Resolved</span>
                  <span className="font-medium text-emerald-600">{area.resolved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Avg Time</span>
                  <span className="font-medium text-blue-600">{area.avgTime}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Resolution Rate</span>
                  <span>{Math.round((area.resolved / area.issues) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${(area.resolved / area.issues) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-black mb-6">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">🎯</span>
              <h3 className="font-semibold text-black">Top Performing Area</h3>
            </div>
            <p className="text-gray-600 text-sm">Powai leads with 89.5% resolution rate and fastest average response time of 1.5 days.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">⚠️</span>
              <h3 className="font-semibold text-black">Needs Attention</h3>
            </div>
            <p className="text-gray-600 text-sm">Road maintenance issues increased by 25% this month. Consider allocating more resources to Public Works.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">📈</span>
              <h3 className="font-semibold text-black">Trending Up</h3>
            </div>
            <p className="text-gray-600 text-sm">Citizen satisfaction improved by 8% since implementing the new mobile reporting system.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
