// pages/admin/StaffManagement.tsx
import React, { useState } from 'react';

type StaffStatus = 'active' | 'inactive' | 'on-leave';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: StaffStatus;
  assignedIssues: number;
  resolvedIssues: number;
  joinDate: string;
  lastActive: string;
  avatar?: string;
}

export const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@civic.gov',
      phone: '+91 98765 43210',
      role: 'Department Head',
      department: 'Public Works',
      status: 'active',
      assignedIssues: 12,
      resolvedIssues: 89,
      joinDate: '2022-03-15',
      lastActive: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Emily Davis',
      email: 'emily.davis@civic.gov',
      phone: '+91 98765 43211',
      role: 'Department Head',
      department: 'Electrical',
      status: 'active',
      assignedIssues: 8,
      resolvedIssues: 76,
      joinDate: '2021-11-20',
      lastActive: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@civic.gov',
      phone: '+91 98765 43212',
      role: 'Field Inspector',
      department: 'Public Works',
      status: 'on-leave',
      assignedIssues: 5,
      resolvedIssues: 34,
      joinDate: '2023-01-10',
      lastActive: '2024-01-10T16:45:00Z'
    }
  ]);

  const [filters, setFilters] = useState({
    search: '',
    department: 'all',
    role: 'all',
    status: 'all'
  });

  const getStatusBadge = (status: StaffStatus) => {
    const statusConfig: Record<StaffStatus, string> = {
      'active': 'bg-emerald-100 text-emerald-800',
      'inactive': 'bg-red-100 text-red-800',
      'on-leave': 'bg-amber-100 text-amber-800'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[status]}`}>
        {status.replace('-', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-black">Staff Management</h1>
          <p className="text-gray-600 mt-2">Manage team members and their assignments</p>
        </div>
        <button className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:opacity-95 transition-opacity flex items-center">
          <span className="mr-2">➕</span>
          Add Staff Member
        </button>
      </div>

      {/* Staff Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">👥</span>
            <div>
              <div className="text-2xl font-bold text-black">{staff.length}</div>
              <div className="text-sm text-gray-600">Total Staff</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-emerald-600">✅</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">
                {staff.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-amber-600">⏸️</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">
                {staff.filter(s => s.status === 'on-leave').length}
              </div>
              <div className="text-sm text-gray-600">On Leave</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-600">📋</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {staff.reduce((sum, s) => sum + s.assignedIssues, 0)}
              </div>
              <div className="text-sm text-gray-600">Assigned Issues</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search staff..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
            />
          </div>

          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
          >
            <option value="all">All Departments</option>
            <option value="public-works">Public Works</option>
            <option value="electrical">Electrical</option>
            <option value="water-sanitation">Water & Sanitation</option>
          </select>

          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
          >
            <option value="all">All Roles</option>
            <option value="department-head">Department Head</option>
            <option value="field-inspector">Field Inspector</option>
            <option value="technician">Technician</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on-leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div key={member.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-black transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-lg font-medium text-gray-700">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-black">{member.name}</h3>
                  <p className="text-gray-600 text-sm">{member.role}</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <span>⋮</span>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">📧</span>
                {member.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">📞</span>
                {member.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">🏢</span>
                {member.department}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{member.assignedIssues}</div>
                <div className="text-xs text-gray-600">Assigned</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-emerald-600">{member.resolvedIssues}</div>
                <div className="text-xs text-gray-600">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-600">
                  {Math.round((member.resolvedIssues / (member.resolvedIssues + member.assignedIssues)) * 100)}%
                </div>
                <div className="text-xs text-gray-600">Success Rate</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {getStatusBadge(member.status)}
              <button className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
