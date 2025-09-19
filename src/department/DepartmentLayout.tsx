// components/department/DepartmentLayout.tsx - FIXED QUICK STATS
import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useDepartmentAuth } from '../contexts/DepartmentAuthContext';
import { useDepartmentIssues } from './useDepartmentIssues'; // ✅ Import the hook
import {
  Building2,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

export const DepartmentLayout: React.FC = () => {
  const { user, logout } = useDepartmentAuth();
  const { stats, loading } = useDepartmentIssues(); // ✅ Get real stats
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/department/login" replace />;
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/department/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/department/dashboard'
    },
    {
      name: 'Assigned Issues',
      href: '/department/issues',
      icon: ClipboardList,
      current: location.pathname.startsWith('/department/issues')
    },
    {
      name: 'Analytics',
      href: '/department/analytics',
      icon: BarChart3,
      current: location.pathname === '/department/analytics'
    },
    {
      name: 'Settings',
      href: '/department/settings',
      icon: Settings,
      current: location.pathname === '/department/settings'
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 flex z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:inset-0 flex flex-col
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">CivicConnect</h1>
              <p className="text-xs text-gray-500">{user.department}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* ✅ REAL QUICK STATS - Using actual data */}
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Quick Stats
          </h3>
          {loading ? (
            <div className="space-y-2">
              <div className="animate-pulse flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-6"></div>
              </div>
              <div className="animate-pulse flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-4"></div>
              </div>
              <div className="animate-pulse flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-28"></div>
                <div className="h-4 bg-gray-200 rounded w-4"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-gray-600">In Progress</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.inProgress}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">Resolved Today</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.todayResolved}</span>
              </div>
              
              {/* ✅ ADDITIONAL REAL STATS */}
              <div className="pt-2 border-t border-gray-100 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Total Assigned</span>
                  <span className="text-xs font-medium text-blue-600">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">New Today</span>
                  <span className="text-xs font-medium text-green-600">{stats.todayAssigned}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 px-6 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-colors
                    ${item.current
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className={`
                    mr-3 w-5 h-5 flex-shrink-0
                    ${item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                  `} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout - Fixed at bottom */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 md:ml-0">
              <h1 className="text-2xl font-semibold text-gray-900 capitalize">
                {location.pathname.split('/').pop() || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* ✅ REAL-TIME NOTIFICATION BADGE */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Bell className="w-6 h-6" />
                {stats.newAssignments > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {stats.newAssignments}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page content - SCROLLABLE */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
