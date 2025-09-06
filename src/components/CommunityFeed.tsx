import React, { useState } from 'react';
import { Search, ThumbsUp, MessageCircle, MapPin } from 'lucide-react';

const CommunityFeed = () => {
  const [activeFilter, setActiveFilter] = useState('nearby');

  const filters = [
    { id: 'nearby', label: '📍 Nearby', icon: '📍' },
    { id: 'trending', label: '🔥 Trending', icon: '🔥' },
    { id: 'recent', label: '⚡ Recent', icon: '⚡' },
  ];

  const feedItems = [
    {
      id: 1,
      category: { icon: '🛣️', label: 'Roads', color: 'bg-amber-100 text-amber-800' },
      title: 'Large pothole causing traffic issues',
      location: 'Bandra West',
      timeAgo: '2h',
      status: 'In Review',
      statusColor: 'text-amber-600',
      likes: 24,
      comments: 8,
      image: '🕳️'
    },
    {
      id: 2,
      category: { icon: '💡', label: 'Lighting', color: 'bg-emerald-100 text-emerald-800' },
      title: 'Street light not working causing safety concerns',
      location: 'Juhu',
      timeAgo: '1d',
      status: 'Resolved',
      statusColor: 'text-emerald-600',
      likes: 16,
      comments: 3,
      image: '💡'
    },
    {
      id: 3,
      category: { icon: '💧', label: 'Water', color: 'bg-blue-100 text-blue-800' },
      title: 'Water leak from municipal pipe',
      location: 'Andheri',
      timeAgo: '3h',
      status: 'Assigned',
      statusColor: 'text-blue-600',
      likes: 12,
      comments: 5,
      image: '💧'
    }
  ];

  return (
    <section className="px-4 pt-6 pb-12">
      <div className="max-w-lg mx-auto">
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-h2 font-semibold text-accent">Community Feed</h1>
          <button className="p-2 hover:bg-subtle rounded-lg transition-colors">
            <Search className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                activeFilter === filter.id
                  ? 'bg-accent text-white'
                  : 'bg-subtle text-text-secondary hover:bg-borders'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        
        {/* Feed Items */}
        <div className="space-y-6">
          {feedItems.map((item) => (
            <div key={item.id} className="bg-surface border border-borders rounded-2xl overflow-hidden card-hover">
              
              {/* Card Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-subtle rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm">👤</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-accent">Anonymous</div>
                    <div className="text-xs text-text-secondary">📍 {item.location} • {item.timeAgo}</div>
                  </div>
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.category.color}`}>
                  {item.category.icon} {item.category.label}
                </div>
              </div>
              
              {/* Issue Image */}
              <div className="px-4 pb-3">
                <div className="w-full h-48 bg-subtle rounded-xl flex items-center justify-center">
                  <span className="text-4xl">{item.image}</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="px-4 pb-4">
                <p className="text-sm text-accent mb-3">{item.title}</p>
                
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 hover:bg-subtle rounded-lg px-2 py-1 transition-colors">
                      <ThumbsUp className="w-4 h-4 text-text-secondary" />
                      <span className="text-xs font-medium text-text-secondary">{item.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:bg-subtle rounded-lg px-2 py-1 transition-colors">
                      <MessageCircle className="w-4 h-4 text-text-secondary" />
                      <span className="text-xs font-medium text-text-secondary">{item.comments}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:bg-subtle rounded-lg px-2 py-1 transition-colors">
                      <MapPin className="w-4 h-4 text-text-secondary" />
                      <span className="text-xs font-medium text-text-secondary">View</span>
                    </button>
                  </div>
                  <div className={`text-xs font-medium ${item.statusColor}`}>
                    {item.status === 'Resolved' ? '✅' : item.status === 'In Review' ? '⏳' : '📋'} {item.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityFeed;