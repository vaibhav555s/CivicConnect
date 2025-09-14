// routes/AdminRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../admin/AdminLayout';
import { AdminLogin } from '../admin/AdminLogin';
import { AdminDashboard } from '../admin/AdminDashboard';
import { IssueManagement } from '../admin/IssueManagement';
import { DepartmentManagement } from '../admin/DepartmentManagement';
import { StaffManagement } from '../admin/StaffManagement';
import { Analytics } from '../admin/Analytics'; // Add this import
import { ProtectedRoute } from '../admin/ProtectedRoute';

export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Admin Login */}
      <Route path="/login" element={<AdminLogin />} />
      
      {/* Protected Admin Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/issues" element={
        <ProtectedRoute>
          <AdminLayout>
            <IssueManagement />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/departments" element={
        <ProtectedRoute>
          <AdminLayout>
            <DepartmentManagement />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/staff" element={
        <ProtectedRoute>
          <AdminLayout>
            <StaffManagement />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      {/* Analytics - Full Featured Dashboard */}
      <Route path="/analytics" element={
        <ProtectedRoute>
          <AdminLayout>
            <Analytics />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      {/* Communications - placeholder for now */}
      <Route path="/communications" element={
        <ProtectedRoute>
          <AdminLayout>
            <div className="p-8">
              <h1 className="text-4xl font-semibold text-black mb-4">Communications Center</h1>
              <p className="text-gray-600">Communication features coming soon...</p>
            </div>
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      {/* Settings - placeholder for now */}
      <Route path="/settings" element={
        <ProtectedRoute>
          <AdminLayout>
            <div className="p-8">
              <h1 className="text-4xl font-semibold text-black mb-4">Admin Settings</h1>
              <p className="text-gray-600">Settings panel coming soon...</p>
            </div>
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      {/* Redirect unknown admin routes */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};
