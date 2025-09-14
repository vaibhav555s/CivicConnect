// components/admin/AdminLayout.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  icon: string;
  label: string;
  path: string;
  count?: number;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const navItems: NavItem[] = [
    { icon: "📊", label: "Dashboard", path: "/admin" },
    { icon: "📝", label: "Issue Management", path: "/admin/issues", count: 23 },
    { icon: "🏢", label: "Departments", path: "/admin/departments" },
    { icon: "👥", label: "Staff Management", path: "/admin/staff" },
    { icon: "📈", label: "Analytics", path: "/admin/analytics" },
    { icon: "💬", label: "Communications", path: "/admin/communications", count: 5 },
    { icon: "⚙️", label: "Settings", path: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50">
        <div className="p-6">
          {/* Logo */}
          <Link to="/admin" className="flex items-center mb-8">
            <h1 className="text-xl font-semibold text-black">CivicConnect</h1>
            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
              Admin
            </span>
          </Link>
          
          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors duration-200
                    ${isActive 
                      ? 'bg-black text-white' 
                      : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.count && (
                    <span className={`
                      text-xs px-2 py-1 rounded-full font-medium
                      ${isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* User Profile */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-gray-700">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'A'}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-black text-sm">{user?.name || 'Admin'}</div>
                <div className="text-gray-600 text-xs">{user?.role || 'Administrator'}</div>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full bg-white text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">🏠</span>
              <span className="text-gray-400">/</span>
              <span className="text-black font-medium">
                {navItems.find(item => item.path === location.pathname)?.label || 'Admin'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <span>🔔</span>
              </button>
              <Link 
                to="/" 
                className="text-gray-600 hover:text-black text-sm font-medium transition-colors"
              >
                View Site
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
