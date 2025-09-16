// pages/department/Login.tsx
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useDepartmentAuth } from '../contexts/DepartmentAuthContext';
import { 
  Building2, 
  Mail, 
  Lock, 
  LogIn, 
  Eye, 
  EyeOff,
  Shield,
  Users,
  CheckCircle
} from 'lucide-react';

export const DepartmentLogin: React.FC = () => {
  const { user, login, loading, error } = useDepartmentAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/department/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (error) {
      // Error handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Department Portal</h1>
          <p className="text-gray-600">Access your assigned civic issues and manage resolutions</p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
            <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Secure Access</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
            <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Team Management</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
            <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Issue Resolution</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="department@civic.gov"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter your password"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In to Department</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 font-medium mb-2">Demo Department Accounts:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p><strong>Public Works:</strong> publicworks@civic.gov / demo123</p>
              <p><strong>Water Dept:</strong> water@civic.gov / demo123</p>
              <p><strong>Electrical:</strong> electrical@civic.gov / demo123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Need help? Contact your department administrator
          </p>
        </div>
      </div>
    </div>
  );
};
