// pages/admin/DepartmentManagement.tsx
import React, { useState } from 'react';

interface Department {
  id: string;
  name: string;
  description: string;
  head: {
    name: string;
    email: string;
    phone: string;
  };
  staff: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    status: 'active' | 'inactive';
  }>;
  stats: {
    activeIssues: number;
    resolvedIssues: number;
    avgResolutionTime: string;
    performance: number;
  };
}

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([
    {
      id: '1',
      name: 'Public Works',
      description: 'Responsible for road maintenance, infrastructure repairs, and public construction projects.',
      head: {
        name: 'John Smith',
        email: 'john.smith@civic.gov',
        phone: '+91 98765 43210'
      },
      staff: [
        { id: '1', name: 'Mike Johnson', role: 'Field Inspector', email: 'mike@civic.gov', status: 'active' },
        { id: '2', name: 'Sarah Wilson', role: 'Project Manager', email: 'sarah@civic.gov', status: 'active' }
      ],
      stats: {
        activeIssues: 45,
        resolvedIssues: 120,
        avgResolutionTime: '3.2 days',
        performance: 92
      }
    },
    {
      id: '2',
      name: 'Electrical Department',
      description: 'Handles street lighting, electrical infrastructure, and power-related civic issues.',
      head: {
        name: 'Emily Davis',
        email: 'emily.davis@civic.gov',
        phone: '+91 98765 43211'
      },
      staff: [
        { id: '3', name: 'Robert Chen', role: 'Electrical Engineer', email: 'robert@civic.gov', status: 'active' },
        { id: '4', name: 'Lisa Kumar', role: 'Technician', email: 'lisa@civic.gov', status: 'active' }
      ],
      stats: {
        activeIssues: 23,
        resolvedIssues: 89,
        avgResolutionTime: '1.8 days',
        performance: 96
      }
    }
  ]);

  const getPerformanceColor = (performance: number) => {
    if (performance >= 95) return 'text-emerald-600';
    if (performance >= 85) return 'text-blue-600';
    if (performance >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-black">Department Management</h1>
          <p className="text-gray-600 mt-2">Manage departments, staff, and performance metrics</p>
        </div>
        <button className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:opacity-95 transition-opacity flex items-center">
          <span className="mr-2">➕</span>
          Add Department
        </button>
      </div>

      {/* Department Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-black transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">🏢</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black">{dept.name}</h3>
                  <p className="text-gray-600 text-sm">{dept.staff.length} staff members</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <span>✏️</span>
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-6 line-clamp-2">{dept.description}</p>

            {/* Department Head */}
            <div className="border-t border-gray-100 pt-4 mb-6">
              <h4 className="font-medium text-black mb-2">Department Head</h4>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-gray-700">
                    {dept.head.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-black">{dept.head.name}</div>
                  <div className="text-gray-600 text-sm">{dept.head.email}</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-2xl font-bold text-blue-600">{dept.stats.activeIssues}</div>
                <div className="text-xs text-gray-600">Active Issues</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{dept.stats.resolvedIssues}</div>
                <div className="text-xs text-gray-600">Resolved</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-black">{dept.stats.avgResolutionTime}</div>
                <div className="text-xs text-gray-600">Avg Resolution</div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getPerformanceColor(dept.stats.performance)}`}>
                  {dept.stats.performance}%
                </div>
                <div className="text-xs text-gray-600">Performance</div>
              </div>
            </div>

            <button className="w-full mt-4 bg-gray-50 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Department Performance Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-black mb-6">Department Performance Overview</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <span className="text-6xl">📊</span>
            <p className="mt-4">Performance chart placeholder</p>
            <p className="text-sm">Integrate Chart.js or similar for data visualization</p>
          </div>
        </div>
      </div>
    </div>
  );
};
