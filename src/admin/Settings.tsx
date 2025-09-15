// admin/Settings.tsx
import React, { useState, useEffect } from 'react';

// Types
type SettingCategory = 'system' | 'departments' | 'users' | 'notifications' | 'integrations' | 'security';
type UserRole = 'super_admin' | 'admin' | 'department_head' | 'staff' | 'viewer';
type IssueCategory = 'roads' | 'lighting' | 'water' | 'waste' | 'parks' | 'traffic' | 'other';
type NotificationTrigger = 'issue_created' | 'status_updated' | 'assigned' | 'resolved' | 'escalated';

interface SystemConfig {
  siteName: string;
  adminEmail: string;
  defaultResponseTime: number; // hours
  defaultResolutionTime: number; // days
  autoAssignment: boolean;
  publicReporting: boolean;
  anonymousReporting: boolean;
  photoRequired: boolean;
  maxPhotosPerIssue: number;
}

interface Department {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  categories: IssueCategory[];
  slaHours: number;
  autoAssign: boolean;
  headId?: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departments: string[];
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  trigger: NotificationTrigger;
  subject: string;
  content: string;
  channels: ('email' | 'sms' | 'push')[];
  isActive: boolean;
  variables: string[];
}

interface IntegrationSettings {
  maps: {
    provider: 'google' | 'mapbox' | 'osm';
    apiKey: string;
    defaultZoom: number;
    enabled: boolean;
  };
  sms: {
    provider: 'twilio' | 'aws_sns' | 'local';
    apiKey: string;
    enabled: boolean;
  };
  email: {
    provider: 'smtp' | 'sendgrid' | 'ses';
    host: string;
    port: number;
    username: string;
    enabled: boolean;
  };
  storage: {
    provider: 'local' | 's3' | 'cloudinary';
    bucketName: string;
    maxFileSize: number; // MB
    allowedTypes: string[];
  };
}

export const Settings: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('system');
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load mock settings data
    const mockSystemConfig: SystemConfig = {
      siteName: 'CivicConnect Mumbai',
      adminEmail: 'admin@civicconnect.gov',
      defaultResponseTime: 24,
      defaultResolutionTime: 7,
      autoAssignment: true,
      publicReporting: true,
      anonymousReporting: true,
      photoRequired: false,
      maxPhotosPerIssue: 5
    };

    const mockDepartments: Department[] = [
      {
        id: 'dept-001',
        name: 'Public Works',
        description: 'Road maintenance, infrastructure repairs, and construction',
        email: 'publicworks@civic.gov',
        phone: '+91 22 2672 2000',
        categories: ['roads', 'parks'],
        slaHours: 72,
        autoAssign: true,
        headId: 'user-001'
      },
      {
        id: 'dept-002',
        name: 'Electrical Department',
        description: 'Street lighting and electrical infrastructure',
        email: 'electrical@civic.gov',
        phone: '+91 22 2672 2001',
        categories: ['lighting'],
        slaHours: 48,
        autoAssign: true,
        headId: 'user-002'
      },
      {
        id: 'dept-003',
        name: 'Water & Sanitation',
        description: 'Water supply, drainage, and sanitation services',
        email: 'water@civic.gov',
        phone: '+91 22 2672 2002',
        categories: ['water', 'waste'],
        slaHours: 24,
        autoAssign: true
      }
    ];

    const mockAdminUsers: AdminUser[] = [
      {
        id: 'user-001',
        name: 'John Smith',
        email: 'john.smith@civic.gov',
        role: 'department_head',
        departments: ['dept-001'],
        permissions: ['view_issues', 'update_issues', 'manage_staff'],
        isActive: true,
        lastLogin: '2024-01-15T10:30:00Z',
        createdAt: '2023-01-15T10:30:00Z'
      },
      {
        id: 'user-002',
        name: 'Emily Davis',
        email: 'emily.davis@civic.gov',
        role: 'department_head',
        departments: ['dept-002'],
        permissions: ['view_issues', 'update_issues', 'manage_staff'],
        isActive: true,
        lastLogin: '2024-01-14T09:15:00Z',
        createdAt: '2023-02-20T14:22:00Z'
      },
      {
        id: 'user-003',
        name: 'Admin User',
        email: 'admin@civicconnect.gov',
        role: 'super_admin',
        departments: ['dept-001', 'dept-002', 'dept-003'],
        permissions: ['*'],
        isActive: true,
        lastLogin: '2024-01-15T11:45:00Z',
        createdAt: '2022-12-01T00:00:00Z'
      }
    ];

    const mockTemplates: NotificationTemplate[] = [
      {
        id: 'tpl-001',
        name: 'Issue Confirmation',
        trigger: 'issue_created',
        subject: 'Issue Reported: {{ISSUE_TITLE}}',
        content: 'Thank you for reporting "{{ISSUE_TITLE}}". Your issue ID is {{ISSUE_ID}}. We will respond within {{SLA_HOURS}} hours.',
        channels: ['email', 'sms'],
        isActive: true,
        variables: ['ISSUE_TITLE', 'ISSUE_ID', 'SLA_HOURS', 'CITIZEN_NAME']
      },
      {
        id: 'tpl-002',
        name: 'Status Update',
        trigger: 'status_updated',
        subject: 'Update: {{ISSUE_TITLE}}',
        content: 'Your issue "{{ISSUE_TITLE}}" status has been updated to {{NEW_STATUS}}. Department: {{DEPARTMENT}}.',
        channels: ['email', 'push'],
        isActive: true,
        variables: ['ISSUE_TITLE', 'NEW_STATUS', 'DEPARTMENT', 'CITIZEN_NAME']
      },
      {
        id: 'tpl-003',
        name: 'Issue Resolved',
        trigger: 'resolved',
        subject: 'Resolved: {{ISSUE_TITLE}}',
        content: 'Great news! Your issue "{{ISSUE_TITLE}}" has been resolved. Please rate our service.',
        channels: ['email', 'push'],
        isActive: true,
        variables: ['ISSUE_TITLE', 'RESOLUTION_DATE', 'CITIZEN_NAME']
      }
    ];

    const mockIntegrations: IntegrationSettings = {
      maps: {
        provider: 'google',
        apiKey: 'AIzaSy...',
        defaultZoom: 15,
        enabled: true
      },
      sms: {
        provider: 'twilio',
        apiKey: 'AC...',
        enabled: true
      },
      email: {
        provider: 'smtp',
        host: 'smtp.gmail.com',
        port: 587,
        username: 'noreply@civicconnect.gov',
        enabled: true
      },
      storage: {
        provider: 's3',
        bucketName: 'civicconnect-uploads',
        maxFileSize: 10,
        allowedTypes: ['jpg', 'jpeg', 'png', 'mp4', 'mov']
      }
    };

    setTimeout(() => {
      setSystemConfig(mockSystemConfig);
      setDepartments(mockDepartments);
      setAdminUsers(mockAdminUsers);
      setTemplates(mockTemplates);
      setIntegrations(mockIntegrations);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    // Mock save operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSaving(false);
  };

  const categories = [
    { key: 'system', label: 'System Config', icon: '⚙️', desc: 'Basic system settings' },
    { key: 'departments', label: 'Departments', icon: '🏢', desc: 'Manage departments' },
    { key: 'users', label: 'User Management', icon: '👥', desc: 'Admin users & roles' },
    { key: 'notifications', label: 'Notifications', icon: '🔔', desc: 'Templates & triggers' },
    { key: 'integrations', label: 'Integrations', icon: '🔗', desc: 'External services' },
    { key: 'security', label: 'Security & Audit', icon: '🔒', desc: 'Security settings' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        <span className="ml-4 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-black">System Settings</h1>
          <p className="text-gray-600 mt-2">Configure and manage your CivicConnect platform</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            🔄 Reset to Defaults
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-black text-white px-6 py-2 rounded-xl font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {saving ? '💾 Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-black mb-4">Settings Categories</h2>
            <nav className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key as SettingCategory)}
                  className={`
                    w-full text-left p-4 rounded-xl transition-colors duration-200
                    ${activeCategory === category.key
                      ? 'bg-black text-white'
                      : 'hover:bg-gray-50 text-gray-600 hover:text-black'
                    }
                  `}
                >
                  <div className="flex items-center mb-2">
                    <span className="mr-3 text-lg">{category.icon}</span>
                    <span className="font-medium">{category.label}</span>
                  </div>
                  <p className={`text-sm ${activeCategory === category.key ? 'text-gray-300' : 'text-gray-500'}`}>
                    {category.desc}
                  </p>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            {/* System Configuration */}
            {activeCategory === 'system' && systemConfig && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-black mb-2">System Configuration</h2>
                  <p className="text-gray-600 mb-6">Basic settings for your CivicConnect platform</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                    <input
                      type="text"
                      value={systemConfig.siteName}
                      onChange={(e) => setSystemConfig(prev => prev ? {...prev, siteName: e.target.value} : null)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                    <input
                      type="email"
                      value={systemConfig.adminEmail}
                      onChange={(e) => setSystemConfig(prev => prev ? {...prev, adminEmail: e.target.value} : null)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Response Time (hours)</label>
                    <input
                      type="number"
                      value={systemConfig.defaultResponseTime}
                      onChange={(e) => setSystemConfig(prev => prev ? {...prev, defaultResponseTime: parseInt(e.target.value)} : null)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Resolution Time (days)</label>
                    <input
                      type="number"
                      value={systemConfig.defaultResolutionTime}
                      onChange={(e) => setSystemConfig(prev => prev ? {...prev, defaultResolutionTime: parseInt(e.target.value)} : null)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Photos per Issue</label>
                    <input
                      type="number"
                      value={systemConfig.maxPhotosPerIssue}
                      onChange={(e) => setSystemConfig(prev => prev ? {...prev, maxPhotosPerIssue: parseInt(e.target.value)} : null)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                {/* Feature Toggles */}
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4">Feature Settings</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'autoAssignment', label: 'Auto-assign Issues to Departments', desc: 'Automatically assign new issues based on category and location' },
                      { key: 'publicReporting', label: 'Public Issue Reporting', desc: 'Allow anyone to report issues without registration' },
                      { key: 'anonymousReporting', label: 'Anonymous Reporting', desc: 'Allow users to report issues anonymously' },
                      { key: 'photoRequired', label: 'Photo Required', desc: 'Require at least one photo for issue reporting' }
                    ].map((feature) => (
                      <label key={feature.key} className="flex items-start p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemConfig[feature.key as keyof SystemConfig] as boolean}
                          onChange={(e) => setSystemConfig(prev => prev ? {...prev, [feature.key]: e.target.checked} : null)}
                          className="mt-1 mr-4"
                        />
                        <div>
                          <div className="font-medium text-black">{feature.label}</div>
                          <div className="text-gray-600 text-sm">{feature.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Department Management */}
            {activeCategory === 'departments' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-black mb-2">Department Management</h2>
                    <p className="text-gray-600">Manage departments and their configurations</p>
                  </div>
                  <button className="bg-black text-white px-6 py-2 rounded-xl font-medium hover:opacity-95 transition-opacity">
                    ➕ Add Department
                  </button>
                </div>

                <div className="space-y-6">
                  {departments.map((dept) => (
                    <div key={dept.id} className="border border-gray-200 rounded-2xl p-6 hover:border-black transition-colors">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-black">{dept.name}</h3>
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">✏️ Edit</button>
                              <button className="text-red-600 hover:text-red-800 text-sm font-medium">🗑️ Delete</button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <p className="text-gray-600 text-sm">{dept.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <p className="text-gray-600 text-sm">{dept.email}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <p className="text-gray-600 text-sm">{dept.phone}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Handled Categories</label>
                              <div className="flex flex-wrap gap-2">
                                {dept.categories.map(category => (
                                  <span key={category} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
                                    {category}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SLA (Hours)</label>
                                <div className="text-2xl font-bold text-blue-600">{dept.slaHours}</div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Assign</label>
                                <div className={`text-sm font-medium ${dept.autoAssign ? 'text-emerald-600' : 'text-gray-600'}`}>
                                  {dept.autoAssign ? '✅ Enabled' : '❌ Disabled'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Management */}
            {activeCategory === 'users' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-black mb-2">User Management</h2>
                    <p className="text-gray-600">Manage admin users and their permissions</p>
                  </div>
                  <button className="bg-black text-white px-6 py-2 rounded-xl font-medium hover:opacity-95 transition-opacity">
                    ➕ Add Admin User
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-medium text-gray-700">User</th>
                        <th className="text-left p-4 font-medium text-gray-700">Role</th>
                        <th className="text-left p-4 font-medium text-gray-700">Departments</th>
                        <th className="text-left p-4 font-medium text-gray-700">Status</th>
                        <th className="text-left p-4 font-medium text-gray-700">Last Login</th>
                        <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-black">{user.name}</div>
                                <div className="text-gray-600 text-sm">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
                              {user.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-gray-600">
                              {user.departments.length} department{user.departments.length !== 1 ? 's' : ''}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              user.isActive 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-gray-600">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">✏️ Edit</button>
                              <button className="text-red-600 hover:text-red-800 text-sm font-medium">🗑️ Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notification Templates */}
            {activeCategory === 'notifications' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-black mb-2">Notification Templates</h2>
                    <p className="text-gray-600">Manage automated notification templates</p>
                  </div>
                  <button className="bg-black text-white px-6 py-2 rounded-xl font-medium hover:opacity-95 transition-opacity">
                    ➕ Create Template
                  </button>
                </div>

                <div className="space-y-6">
                  {templates.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-2xl p-6 hover:border-black transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-black">{template.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              template.isActive 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {template.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
                              {template.trigger.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{template.subject}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Channels</label>
                              <div className="flex space-x-2">
                                {template.channels.map(channel => (
                                  <span key={channel} className="text-lg">
                                    {channel === 'email' && '📧'}
                                    {channel === 'sms' && '📱'}
                                    {channel === 'push' && '🔔'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Content Preview</label>
                            <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg line-clamp-3">
                              {template.content}
                            </p>
                          </div>
                          
                          {template.variables.length > 0 && (
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Variables</label>
                              <div className="flex flex-wrap gap-2">
                                {template.variables.map(variable => (
                                  <span key={variable} className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                                    {`{{${variable}}}`}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">✏️ Edit</button>
                          <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">📋 Test</button>
                          <button className="text-red-600 hover:text-red-800 text-sm font-medium">🗑️ Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integration Settings */}
            {activeCategory === 'integrations' && integrations && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-black mb-2">Integration Settings</h2>
                  <p className="text-gray-600 mb-6">Configure external services and APIs</p>
                </div>

                <div className="space-y-8">
                  {/* Maps Integration */}
                  <div className="border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🗺️</span>
                        <div>
                          <h3 className="text-lg font-semibold text-black">Maps Service</h3>
                          <p className="text-gray-600 text-sm">Location services and mapping</p>
                        </div>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={integrations.maps.enabled}
                          onChange={(e) => setIntegrations(prev => prev ? {
                            ...prev,
                            maps: { ...prev.maps, enabled: e.target.checked }
                          } : null)}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium">Enabled</span>
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                        <select
                          value={integrations.maps.provider}
                          onChange={(e) => setIntegrations(prev => prev ? {
                            ...prev,
                            maps: { ...prev.maps, provider: e.target.value as any }
                          } : null)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                        >
                          <option value="google">Google Maps</option>
                          <option value="mapbox">Mapbox</option>
                          <option value="osm">OpenStreetMap</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                        <input
                          type="password"
                          value={integrations.maps.apiKey}
                          onChange={(e) => setIntegrations(prev => prev ? {
                            ...prev,
                            maps: { ...prev.maps, apiKey: e.target.value }
                          } : null)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Zoom</label>
                        <input
                          type="number"
                          value={integrations.maps.defaultZoom}
                          onChange={(e) => setIntegrations(prev => prev ? {
                            ...prev,
                            maps: { ...prev.maps, defaultZoom: parseInt(e.target.value) }
                          } : null)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SMS Integration */}
                  <div className="border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">📱</span>
                        <div>
                          <h3 className="text-lg font-semibold text-black">SMS Service</h3>
                          <p className="text-gray-600 text-sm">Text messaging notifications</p>
                        </div>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={integrations.sms.enabled}
                          onChange={(e) => setIntegrations(prev => prev ? {
                            ...prev,
                            sms: { ...prev.sms, enabled: e.target.checked }
                          } : null)}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium">Enabled</span>
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                        <select
                          value={integrations.sms.provider}
                          onChange={(e) => setIntegrations(prev => prev ? {
                            ...prev,
                            sms: { ...prev.sms, provider: e.target.value as any }
                          } : null)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                        >
                          <option value="twilio">Twilio</option>
                          <option value="aws_sns">AWS SNS</option>
                          <option value="local">Local Gateway</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                        <input
                          type="password"
                          value={integrations.sms.apiKey}
                          onChange={(e) => setIntegrations(prev => prev ? {
                            ...prev,
                            sms: { ...prev.sms, apiKey: e.target.value }
                          } : null)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Integration */}
                  <div className="border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">📧</span>
                        <div>
                          <h3 className="text-lg font-semibold text-black">Email Service</h3>
                          <p className="text-gray-600 text-sm">Email notifications and communications</p>
                        </div>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={integrations.email.enabled}
                          onChange={(e) => setIntegrations(prev => prev ? {
                            ...prev,
                            email: { ...prev.email, enabled: e.target.checked }
                          } : null)}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium">Enabled</span>
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                        <select
                          value={integrations.email.provider}
                          onChange={(e) => setIntegrations(prev => prev ? {
                            ...prev,
                            email: { ...prev.email, provider: e.target.value as any }
                          } : null)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                        >
                          <option value="smtp">SMTP</option>
                          <option value="sendgrid">SendGrid</option>
                          <option value="ses">Amazon SES</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Host</label>
                        <input
                          type="text"
                          value={integrations.email.host}
                          onChange={(e) => setIntegrations(prev => prev ? {
                            ...prev,
                            email: { ...prev.email, host: e.target.value }
                          } : null)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Port</label>
                        <input
                          type="number"
                          value={integrations.email.port}
                          onChange={(e) => setIntegrations(prev => prev ? {
                            ...prev,
                            email: { ...prev.email, port: parseInt(e.target.value) }
                          } : null)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <input
                          type="text"
                          value={integrations.email.username}
                          onChange={(e) => setIntegrations(prev => prev ? {
                            ...prev,
                            email: { ...prev.email, username: e.target.value }
                          } : null)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* File Storage */}
                  <div className="border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">💾</span>
                      <div>
                        <h3 className="text-lg font-semibold text-black">File Storage</h3>
                        <p className="text-gray-600 text-sm">Photo and document storage settings</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                        <select
                          value={integrations.storage.provider}
                          onChange={(e) => setIntegrations(prev => prev ? {
                            ...prev,
                            storage: { ...prev.storage, provider: e.target.value as any }
                          } : null)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                        >
                          <option value="local">Local Storage</option>
                          <option value="s3">Amazon S3</option>
                          <option value="cloudinary">Cloudinary</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bucket/Container Name</label>
                        <input
                          type="text"
                          value={integrations.storage.bucketName}
                          onChange={(e) => setIntegrations(prev => prev ? {
                            ...prev,
                            storage: { ...prev.storage, bucketName: e.target.value }
                          } : null)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
                        <input
                          type="number"
                          value={integrations.storage.maxFileSize}
                          onChange={(e) => setIntegrations(prev => prev ? {
                            ...prev,
                            storage: { ...prev.storage, maxFileSize: parseInt(e.target.value) }
                          } : null)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Allowed File Types</label>
                      <div className="flex flex-wrap gap-2">
                        {integrations.storage.allowedTypes.map(type => (
                          <span key={type} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            .{type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security & Audit */}
            {activeCategory === 'security' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-black mb-2">Security & Audit</h2>
                  <p className="text-gray-600 mb-6">Security settings and audit trail</p>
                </div>

                <div className="space-y-6">
                  {/* Security Settings */}
                  <div className="border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-black mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'twoFactor', label: 'Two-Factor Authentication', desc: 'Require 2FA for admin logins' },
                        { key: 'sessionTimeout', label: 'Auto Logout', desc: 'Automatically logout inactive sessions after 30 minutes' },
                        { key: 'ipRestriction', label: 'IP Address Restriction', desc: 'Restrict admin access to specific IP addresses' },
                        { key: 'auditLogging', label: 'Audit Logging', desc: 'Log all admin actions for compliance' }
                      ].map((setting) => (
                        <label key={setting.key} className="flex items-start p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                          <input type="checkbox" className="mt-1 mr-4" />
                          <div>
                            <div className="font-medium text-black">{setting.label}</div>
                            <div className="text-gray-600 text-sm">{setting.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Audit Trail */}
                  <div className="border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-black mb-4">Recent Admin Activity</h3>
                    <div className="space-y-3">
                      {[
                        { user: 'Admin User', action: 'Updated system settings', time: '2 minutes ago', ip: '192.168.1.100' },
                        { user: 'John Smith', action: 'Assigned issue CV-2024-001', time: '15 minutes ago', ip: '192.168.1.101' },
                        { user: 'Emily Davis', action: 'Sent bulk notification', time: '1 hour ago', ip: '192.168.1.102' },
                        { user: 'Admin User', action: 'Created new department', time: '3 hours ago', ip: '192.168.1.100' }
                      ].map((log, index) => (
                        <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex-1">
                            <div className="font-medium text-black">{log.action}</div>
                            <div className="text-gray-600 text-sm">by {log.user} • {log.time}</div>
                          </div>
                          <div className="text-gray-500 text-sm">{log.ip}</div>
                        </div>
                      ))}
                    </div>
                    <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Full Audit Log
                    </button>
                  </div>

                  {/* Data Backup */}
                  <div className="border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-black mb-4">Data Backup & Recovery</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">💾</span>
                        </div>
                        <div className="font-medium text-black">Last Backup</div>
                        <div className="text-emerald-600 text-sm">2 hours ago</div>
                        <div className="text-gray-500 text-xs">Automatic daily backup</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">📊</span>
                        </div>
                        <div className="font-medium text-black">Data Size</div>
                        <div className="text-blue-600 text-sm">2.4 GB</div>
                        <div className="text-gray-500 text-xs">Including all media files</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">🔄</span>
                        </div>
                        <div className="font-medium text-black">Retention</div>
                        <div className="text-amber-600 text-sm">30 days</div>
                        <div className="text-gray-500 text-xs">Automatic cleanup</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center space-x-4 mt-6">
                      <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                        💾 Backup Now
                      </button>
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:opacity-95 transition-opacity">
                        📥 Download Backup
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
