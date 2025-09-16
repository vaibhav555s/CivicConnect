// routes/DepartmentRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DepartmentAuthProvider } from '../contexts/DepartmentAuthContext';
import { DepartmentIssues } from '../department/Issues';
import { DepartmentAnalytics } from '../department/Analytics';
import { DepartmentSettings } from '../department/Settings';

import { DepartmentDashboard } from '../department/Dashboard';
import { DepartmentLayout } from '../department/DepartmentLayout';
import { DepartmentLogin } from '../department/Login';

export const DepartmentRoutes: React.FC = () => {
  return (
    <DepartmentAuthProvider>
      <Routes>
        {/* Department Login */}
        <Route path="/login" element={<DepartmentLogin />} />
        
        {/* Department App Routes */}
        <Route path="/" element={<DepartmentLayout />}>
          <Route index element={<Navigate to="/department/dashboard" replace />} />
          <Route path="dashboard" element={<DepartmentDashboard />} />
          {/* Add more routes later */}
          <Route path="issues" element={<DepartmentIssues />} />
          <Route path="analytics" element={<DepartmentAnalytics />} />
          <Route path="settings" element={<DepartmentSettings />} />
        </Route>
        
        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/department/login" replace />} />
      </Routes>
    </DepartmentAuthProvider>
  );
};
