// pages/admin/AdminLogin.tsx
import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AdminLogin: React.FC = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { loginEmail, isAuthenticated, isLoading } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await loginEmail?.(credentials.email, credentials.password);
    if (!success) {
      setError('Invalid credentials. Try admin@civicconnect.com / admin123');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-black mb-2">CivicConnect Admin</h1>
          <p className="text-gray-600">Sign in to access the admin dashboard</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
                placeholder="admin@civicconnect.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
                placeholder="admin123"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded-xl font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-gray-600 hover:text-black font-medium transition-colors"
          >
            ← Back to CivicConnect
          </Link>
        </div>
      </div>
    </div>
  );
};
