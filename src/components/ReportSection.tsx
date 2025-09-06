import React, { useState } from 'react';
import { Camera, MapPin } from 'lucide-react';

const ReportSection = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = [
    { id: 'roads', icon: '🛣️', label: 'Roads' },
    { id: 'lighting', icon: '💡', label: 'Lighting' },
    { id: 'water', icon: '💧', label: 'Water' },
    { id: 'waste', icon: '🗑️', label: 'Waste' },
  ];

  return (
    <section id="report" className="py-16 md:py-32 bg-surface px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Header */}
        <h2 className="text-h1 md:text-5xl font-semibold text-accent mb-8 md:mb-16">
          Report an Issue
        </h2>
        
        {/* Form Container */}
        <div className="bg-surface card-hover rounded-2xl p-6 md:p-8">
          
          {/* Category Selection */}
          <div className="mb-8">
            <label className="block text-caption mb-4">
              Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 md:p-6 border rounded-xl transition-colors duration-200 group ${
                    selectedCategory === category.id 
                      ? 'border-accent bg-subtle' 
                      : 'border-borders hover:border-accent'
                  }`}
                >
                  <div className="text-2xl md:text-3xl mx-auto mb-3">
                    {category.icon}
                  </div>
                  <span className="text-sm font-medium text-text-secondary group-hover:text-accent">
                    {category.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Photo Upload */}
          <div className="mb-8">
            <label className="block text-caption mb-4">
              Photo Evidence
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 md:p-12 text-center hover:border-accent transition-colors duration-200 cursor-pointer">
              <Camera className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-text-secondary mb-2">Upload Photos</p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to browse • Up to 5 photos
              </p>
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-8">
            <label className="block text-caption mb-4">
              Description
            </label>
            <textarea 
              className="w-full h-24 md:h-32 p-4 md:p-6 input-field rounded-xl resize-none"
              placeholder="Describe the issue in detail..."
            />
          </div>
          
          {/* Location */}
          <div className="mb-8">
            <label className="block text-caption mb-4">
              Location
            </label>
            <button className="w-full p-4 md:p-6 input-field rounded-xl hover:border-accent transition-colors duration-200 text-left">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 md:w-6 md:h-6 mr-3 text-text-secondary" />
                <span className="text-text-secondary font-medium">Use Current Location</span>
              </div>
            </button>
          </div>
          
          {/* Submit Button */}
          <button className="w-full btn-primary py-4 rounded-xl text-lg">
            Submit Report
          </button>
          
        </div>
      </div>
    </section>
  );
};

export default ReportSection;