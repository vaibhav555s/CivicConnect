// pages/department/Settings.tsx
import React, { useState } from 'react';
import { useDepartmentAuth } from '../contexts/DepartmentAuthContext';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Clock,
  Users,
  Settings as SettingsIcon
} from 'lucide-react';

export const DepartmentSettings: React.FC = () => {
  const { user } = useDepartmentAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      displayName: user?.displayName || '',
      email: user?.email || '',
      phone: '+91 98765 43210',
      location: 'Mumbai Municipal Office',
      workingHours: '9:00 AM - 6:00 PM',
      teamSize: '12 members'
    },
    notifications: {
      newAssignments: true,
      statusUpdates: true,
      emergencyIssues: true,
      weeklyReports: false,
      citizenFeedback: true,
      systemUpdates: false
    },
    preferences: {
      theme: 'light',
      language: 'english',
      timezone: 'Asia/Kolkata',
      defaultView: 'grid',
      autoRefresh: true,
      soundAlerts: false
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const handleSave = () => {
    console.log('Settings saved:', settings);
    // Show success message
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
            <Camera className="w-3 h-3" />
          </button>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{user?.displayName}</h3>
          <p className="text-gray-600">{user?.department}</p>
          <p className="text-sm text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
          <input
            type="text"
            value={settings.profile.displayName}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              profile: { ...prev.profile, displayName: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, email: e.target.value }
              }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={settings.profile.phone}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, phone: e.target.value }
              }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Office Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={settings.profile.location}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, location: e.target.value }
              }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={settings.profile.workingHours}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, workingHours: e.target.value }
              }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={settings.profile.teamSize}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, teamSize: e.target.value }
              }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {key === 'newAssignments' && 'Get notified when new issues are assigned to your department'}
                  {key === 'statusUpdates' && 'Receive updates when issue statuses change'}
                  {key === 'emergencyIssues' && 'Immediate alerts for critical and emergency issues'}
                  {key === 'weeklyReports' && 'Weekly performance and analytics reports'}
                  {key === 'citizenFeedback' && 'Notifications when citizens provide feedback'}
                  {key === 'systemUpdates' && 'System maintenance and update notifications'}
                </p>
              </div>
              <button
                onClick={() => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, [key]: !value }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
          <select
            value={settings.preferences.theme}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              preferences: { ...prev.preferences, theme: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
          <select
            value={settings.preferences.language}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              preferences: { ...prev.preferences, language: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="english">English</option>
            <option value="hindi">हिंदी</option>
            <option value="marathi">मराठी</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={settings.preferences.timezone}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              preferences: { ...prev.preferences, timezone: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default View</label>
          <select
            value={settings.preferences.defaultView}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              preferences: { ...prev.preferences, defaultView: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="grid">Grid View</option>
            <option value="list">List View</option>
            <option value="map">Map View</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="text-sm font-medium text-gray-700">Auto Refresh</label>
            <p className="text-xs text-gray-500 mt-1">Automatically refresh data every 30 seconds</p>
          </div>
          <button
            onClick={() => setSettings(prev => ({
              ...prev,
              preferences: { ...prev.preferences, autoRefresh: !prev.preferences.autoRefresh }
            }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.preferences.autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.preferences.autoRefresh ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="text-sm font-medium text-gray-700">Sound Alerts</label>
            <p className="text-xs text-gray-500 mt-1">Play sounds for important notifications</p>
          </div>
          <button
            onClick={() => setSettings(prev => ({
              ...prev,
              preferences: { ...prev.preferences, soundAlerts: !prev.preferences.soundAlerts }
            }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.preferences.soundAlerts ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.preferences.soundAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-yellow-600" />
          <h4 className="font-medium text-yellow-800">Security Settings</h4>
        </div>
        <p className="text-sm text-yellow-700 mt-2">
          For security changes, please contact your system administrator.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Password</h4>
          <p className="text-sm text-gray-600 mb-4">Last changed 30 days ago</p>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            Request Password Change
          </button>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
          <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account</p>
          <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
            Enable 2FA
          </button>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Login History</h4>
          <p className="text-sm text-gray-600 mb-4">View your recent login activity</p>
          <button className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700">
            View History
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Department Settings</h1>
            <p className="text-blue-100 text-lg">
              Manage your preferences and profile settings
            </p>
          </div>
          <SettingsIcon className="w-12 h-12 text-blue-200" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'preferences' && renderPreferencesTab()}
          {activeTab === 'security' && renderSecurityTab()}
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
