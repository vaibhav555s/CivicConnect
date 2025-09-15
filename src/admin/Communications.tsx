// admin/Communications.tsx
import React, { useState, useEffect } from 'react';

// Define proper types
type MessageChannel = 'email' | 'sms' | 'push';
type MessageType = 'individual' | 'bulk' | 'announcement';
type MessageStatus = 'draft' | 'scheduled' | 'sent' | 'failed';
type TemplateType = 'status_update' | 'announcement' | 'reminder' | 'welcome';

// Types
interface Message {
  id: string;
  type: MessageType;
  subject: string;
  content: string;
  recipients: string[];
  channels: MessageChannel[];
  status: MessageStatus;
  sentAt?: string;
  sentBy: string;
  readCount?: number;
  totalRecipients: number;
  relatedIssueId?: string;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: TemplateType;
  variables: string[];
}

interface NotificationStats {
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  responseRate: number;
}

export const Communications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compose' | 'messages' | 'templates' | 'stats'>('compose');
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [messageType, setMessageType] = useState<MessageType>('individual');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [messageForm, setMessageForm] = useState({
    subject: '',
    content: '',
    recipients: '',
    channels: ['email'] as MessageChannel[],
    scheduleDate: '',
    relatedIssue: ''
  });

  useEffect(() => {
    // Load mock data
    const mockMessages: Message[] = [
      {
        id: 'msg-001',
        type: 'individual',
        subject: 'Issue Update: Pothole Repair Completed',
        content: 'Your reported pothole on Main Street has been successfully repaired. Thank you for helping improve our community!',
        recipients: ['user@example.com'],
        channels: ['email', 'sms'],
        status: 'sent',
        sentAt: '2024-01-15T14:30:00Z',
        sentBy: 'Admin User',
        readCount: 1,
        totalRecipients: 1,
        relatedIssueId: 'CV-2024-001'
      },
      {
        id: 'msg-002',
        type: 'bulk',
        subject: 'Scheduled Maintenance Notice',
        content: 'Water supply will be temporarily interrupted on January 20th from 10 AM to 4 PM for maintenance work.',
        recipients: ['area:bandra-west'],
        channels: ['email', 'push'],
        status: 'sent',
        sentAt: '2024-01-14T09:00:00Z',
        sentBy: 'Admin User',
        readCount: 243,
        totalRecipients: 567
      },
      {
        id: 'msg-003',
        type: 'announcement',
        subject: 'New Mobile App Features Available',
        content: 'We have added new features to make reporting civic issues even easier. Update your app today!',
        recipients: ['all-users'],
        channels: ['email', 'push'],
        status: 'scheduled',
        sentBy: 'Admin User',
        totalRecipients: 1247
      }
    ];

    const mockTemplates: Template[] = [
      {
        id: 'tpl-001',
        name: 'Issue Status Update',
        subject: 'Update on your reported issue: {{ISSUE_TITLE}}',
        content: 'Dear {{CITIZEN_NAME}},\n\nYour issue "{{ISSUE_TITLE}}" (ID: {{ISSUE_ID}}) has been updated.\n\nStatus: {{STATUS}}\nDepartment: {{DEPARTMENT}}\nExpected Resolution: {{EXPECTED_DATE}}\n\nThank you for your patience.',
        type: 'status_update',
        variables: ['CITIZEN_NAME', 'ISSUE_TITLE', 'ISSUE_ID', 'STATUS', 'DEPARTMENT', 'EXPECTED_DATE']
      },
      {
        id: 'tpl-002',
        name: 'Public Announcement',
        subject: 'Important Notice: {{ANNOUNCEMENT_TITLE}}',
        content: 'Dear Citizens,\n\n{{ANNOUNCEMENT_CONTENT}}\n\nFor more information, please contact us at support@civicconnect.gov\n\nBest regards,\nCivicConnect Team',
        type: 'announcement',
        variables: ['ANNOUNCEMENT_TITLE', 'ANNOUNCEMENT_CONTENT']
      },
      {
        id: 'tpl-003',
        name: 'Issue Resolution Confirmation',
        subject: 'Issue Resolved: {{ISSUE_TITLE}}',
        content: 'Great news! Your reported issue "{{ISSUE_TITLE}}" has been resolved.\n\nPlease take a moment to rate our service and provide feedback.\n\nThank you for helping improve our community!',
        type: 'status_update',
        variables: ['ISSUE_TITLE', 'RESOLUTION_DATE']
      }
    ];

    const mockStats: NotificationStats = {
      totalSent: 2847,
      deliveryRate: 96.8,
      openRate: 73.2,
      responseRate: 12.4
    };

    setTimeout(() => {
      setMessages(mockMessages);
      setTemplates(mockTemplates);
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSendMessage = () => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      type: messageType,
      subject: messageForm.subject,
      content: messageForm.content,
      recipients: messageType === 'individual' ? [messageForm.recipients] : [messageForm.recipients],
      channels: messageForm.channels,
      status: messageForm.scheduleDate ? 'scheduled' : 'sent',
      sentAt: messageForm.scheduleDate || new Date().toISOString(),
      sentBy: 'Current Admin',
      totalRecipients: messageType === 'individual' ? 1 : 100, // Mock recipient count
      relatedIssueId: messageForm.relatedIssue || undefined
    };

    setMessages(prev => [newMessage, ...prev]);
    
    // Reset form
    setMessageForm({
      subject: '',
      content: '',
      recipients: '',
      channels: ['email'],
      scheduleDate: '',
      relatedIssue: ''
    });
  };

  const getStatusBadge = (status: MessageStatus) => {
    const statusConfig: Record<MessageStatus, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'sent': 'bg-emerald-100 text-emerald-800',
      'failed': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getChannelIcon = (channel: MessageChannel) => {
    const icons: Record<MessageChannel, string> = {
      'email': '📧',
      'sms': '📱',
      'push': '🔔'
    };
    return icons[channel];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        <span className="ml-4 text-gray-600">Loading communications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-black">Communications Center</h1>
          <p className="text-gray-600 mt-2">Manage notifications, messages, and citizen communications</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            📊 View Analytics
          </button>
          <button className="bg-black text-white px-6 py-2 rounded-xl font-medium hover:opacity-95 transition-opacity">
            🚨 Emergency Alert
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Messages Sent</p>
                <p className="text-3xl font-bold text-black">{stats.totalSent.toLocaleString()}</p>
                <p className="text-emerald-600 text-sm">📈 +8% this month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📧</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Delivery Rate</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.deliveryRate}%</p>
                <p className="text-emerald-600 text-sm">📈 +2% this month</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Open Rate</p>
                <p className="text-3xl font-bold text-blue-600">{stats.openRate}%</p>
                <p className="text-blue-600 text-sm">📊 Industry avg: 68%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👁️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Response Rate</p>
                <p className="text-3xl font-bold text-amber-600">{stats.responseRate}%</p>
                <p className="text-emerald-600 text-sm">📈 +3% this month</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-gray-200 p-2">
        <nav className="flex space-x-2">
          {[
            { key: 'compose', label: 'Compose Message', icon: '✍️' },
            { key: 'messages', label: 'Message History', icon: '📝' },
            { key: 'templates', label: 'Templates', icon: '📄' },
            { key: 'stats', label: 'Analytics', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`
                flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200
                ${activeTab === tab.key
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:text-black hover:bg-gray-50'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        {/* Compose Message Tab */}
        {activeTab === 'compose' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-black">Compose New Message</h2>
            
            {/* Message Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Message Type</label>
              <div className="flex space-x-4">
                {[
                  { value: 'individual', label: 'Individual', icon: '👤', desc: 'Send to specific citizen' },
                  { value: 'bulk', label: 'Bulk', icon: '👥', desc: 'Send to group/area' },
                  { value: 'announcement', label: 'Public', icon: '📢', desc: 'Public announcement' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setMessageType(type.value as MessageType)}
                    className={`
                      flex-1 p-4 border-2 rounded-xl text-left transition-colors
                      ${messageType === type.value
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">{type.icon}</span>
                      <span className="font-medium text-black">{type.label}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Use Template (Optional)</label>
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  const template = templates.find(t => t.id === e.target.value);
                  if (template) {
                    setMessageForm(prev => ({
                      ...prev,
                      subject: template.subject,
                      content: template.content
                    }));
                  }
                }}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
              >
                <option value="">Select a template...</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Recipients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipients
                    {messageType === 'individual' && ' (Email/Phone)'}
                    {messageType === 'bulk' && ' (Area/Department)'}
                    {messageType === 'announcement' && ' (All Users)'}
                  </label>
                  {messageType === 'announcement' ? (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">📢</span>
                        <span>All registered users (1,247 recipients)</span>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={messageForm.recipients}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, recipients: e.target.value }))}
                      placeholder={
                        messageType === 'individual' 
                          ? "user@example.com or +91 9876543210"
                          : "bandra-west, public-works, etc."
                      }
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                    />
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter message subject..."
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                  />
                </div>

                {/* Related Issue */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Related Issue (Optional)</label>
                  <input
                    type="text"
                    value={messageForm.relatedIssue}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, relatedIssue: e.target.value }))}
                    placeholder="CV-2024-001"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Delivery Channels */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Channels</label>
                  <div className="space-y-3">
                    {[
                      { value: 'email', label: 'Email', icon: '📧', desc: 'Send via email' },
                      { value: 'sms', label: 'SMS', icon: '📱', desc: 'Text message' },
                      { value: 'push', label: 'Push', icon: '🔔', desc: 'App notification' }
                    ].map((channel) => (
                      <label
                        key={channel.value}
                        className="flex items-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={messageForm.channels.includes(channel.value as MessageChannel)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMessageForm(prev => ({
                                ...prev,
                                channels: [...prev.channels, channel.value as MessageChannel]
                              }));
                            } else {
                              setMessageForm(prev => ({
                                ...prev,
                                channels: prev.channels.filter(c => c !== channel.value)
                              }));
                            }
                          }}
                          className="mr-3"
                        />
                        <span className="mr-3 text-xl">{channel.icon}</span>
                        <div>
                          <div className="font-medium text-black">{channel.label}</div>
                          <div className="text-gray-600 text-sm">{channel.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (Optional)</label>
                  <input
                    type="datetime-local"
                    value={messageForm.scheduleDate}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, scheduleDate: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                  />
                  <p className="text-gray-500 text-sm mt-1">Leave empty to send immediately</p>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
              <textarea
                value={messageForm.content}
                onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                placeholder="Type your message here..."
                className="w-full p-4 border border-gray-200 rounded-xl focus:border-black focus:outline-none resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-gray-500 text-sm">
                  {messageForm.content.length} characters
                </p>
                <div className="flex space-x-2">
                  <button className="text-gray-500 hover:text-gray-700 text-sm">
                    📎 Attach File
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 text-sm">
                    🖼️ Add Image
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-gray-800 font-medium">
                  📄 Save as Draft
                </button>
                <button className="text-gray-600 hover:text-gray-800 font-medium">
                  👁️ Preview
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <button className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageForm.subject || !messageForm.content}
                  className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {messageForm.scheduleDate ? '⏰ Schedule Message' : '📤 Send Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message History Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-black">Message History</h2>
              <div className="flex items-center space-x-4">
                <input
                  type="search"
                  placeholder="Search messages..."
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                />
                <select className="px-4 py-2 border border-gray-200 rounded-xl focus:border-black focus:outline-none">
                  <option value="all">All Types</option>
                  <option value="individual">Individual</option>
                  <option value="bulk">Bulk</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="border border-gray-200 rounded-2xl p-6 hover:border-black transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-black">{message.subject}</h3>
                        {getStatusBadge(message.status)}
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600 text-sm capitalize">{message.type}</span>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{message.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>👤 By {message.sentBy}</span>
                        <span>📧 {message.totalRecipients} recipients</span>
                        {message.readCount && (
                          <span>👁️ {message.readCount} opened</span>
                        )}
                        {message.sentAt && (
                          <span>🕐 {new Date(message.sentAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {message.channels.map(channel => (
                        <span key={channel} className="text-lg">
                          {getChannelIcon(channel)}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {message.relatedIssueId && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <span className="text-sm text-gray-600">
                        🔗 Related to issue: <span className="font-medium">{message.relatedIssueId}</span>
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      📊 View Analytics
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                      📋 Duplicate
                    </button>
                    {message.status === 'draft' && (
                      <button className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-black">Message Templates</h2>
              <button className="bg-black text-white px-6 py-2 rounded-xl font-medium hover:opacity-95 transition-opacity">
                ➕ Create Template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-2xl p-6 hover:border-black transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-black mb-2">{template.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 capitalize">{template.type.replace('_', ' ')}</p>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="font-medium text-sm text-black mb-2">Subject:</p>
                        <p className="text-gray-600 text-sm mb-3">{template.subject}</p>
                        <p className="font-medium text-sm text-black mb-2">Content:</p>
                        <p className="text-gray-600 text-sm line-clamp-3">{template.content}</p>
                      </div>
                    </div>
                  </div>
                  
                  {template.variables.length > 0 && (
                    <div className="mb-4">
                      <p className="font-medium text-sm text-black mb-2">Variables:</p>
                      <div className="flex flex-wrap gap-2">
                        {template.variables.map(variable => (
                          <span key={variable} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      📝 Use Template
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                      ✏️ Edit
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                      📋 Duplicate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-black">Communication Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Delivery Performance */}
              <div className="border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Delivery Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Email Delivery</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-emerald-500 h-2 rounded-full w-[97%]"></div>
                      </div>
                      <span className="font-medium">97%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">SMS Delivery</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-emerald-500 h-2 rounded-full w-[95%]"></div>
                      </div>
                      <span className="font-medium">95%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Push Notifications</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-emerald-500 h-2 rounded-full w-[89%]"></div>
                      </div>
                      <span className="font-medium">89%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Metrics */}
              <div className="border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Engagement Metrics</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">73.2%</div>
                    <div className="text-gray-600 text-sm">Average Open Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">12.4%</div>
                    <div className="text-gray-600 text-sm">Response Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600">4.2 min</div>
                    <div className="text-gray-600 text-sm">Avg. Reading Time</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Recent Communication Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-emerald-600">📧</span>
                    </div>
                    <div>
                      <p className="font-medium text-black">Issue resolution notification sent</p>
                      <p className="text-gray-600 text-sm">Sent to 234 users • 2 hours ago</p>
                    </div>
                  </div>
                  <span className="text-emerald-600 text-sm font-medium">94% delivered</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600">📱</span>
                    </div>
                    <div>
                      <p className="font-medium text-black">Maintenance alert SMS</p>
                      <p className="text-gray-600 text-sm">Sent to Bandra West residents • 1 day ago</p>
                    </div>
                  </div>
                  <span className="text-emerald-600 text-sm font-medium">97% delivered</span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-amber-600">🔔</span>
                    </div>
                    <div>
                      <p className="font-medium text-black">App update notification</p>
                      <p className="text-gray-600 text-sm">Push notification to all users • 2 days ago</p>
                    </div>
                  </div>
                  <span className="text-emerald-600 text-sm font-medium">89% delivered</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
