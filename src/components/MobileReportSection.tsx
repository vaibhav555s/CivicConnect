import React, { useState } from 'react';
import { Camera, MapPin, ArrowLeft } from 'lucide-react';

interface MobileReportSectionProps {
  onBack: () => void;
}

const MobileReportSection: React.FC<MobileReportSectionProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = [
    { id: 'roads', icon: '🛣️', label: 'Roads' },
    { id: 'lighting', icon: '💡', label: 'Lighting' },
    { id: 'water', icon: '💧', label: 'Water' },
    { id: 'waste', icon: '🗑️', label: 'Waste' },
  ];

  return (
    <section className="min-h-screen bg-surface">
      <div className="max-w-lg mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-borders">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-subtle rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h1 className="text-lg font-semibold text-accent">Report Issue</h1>
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>
        
        {/* Form Container */}
        <div className="p-6">
          
          {/* Category Selection */}
          <div className="mb-8">
            <label className="block text-caption mb-4">
              Category
            </label>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-6 border rounded-xl transition-colors duration-200 group ${
                    selectedCategory === category.id 
                      ? 'border-accent bg-subtle' 
                      : 'border-borders hover:border-accent'
                  }`}
                >
                  <div className="text-3xl mx-auto mb-3">
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
            <div className="border-2 border-dashed border-borders rounded-xl p-12 text-center hover:border-accent transition-colors duration-200 cursor-pointer">
              <Camera className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
              <p className="text-lg font-medium text-text-secondary mb-2">Upload Photos</p>
              <p className="text-sm text-text-secondary">
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
              className="w-full h-32 p-6 input-field rounded-xl resize-none"
              placeholder="Describe the issue in detail..."
            />
          </div>
          
          {/* Location */}
          <div className="mb-8">
            <label className="block text-caption mb-4">
              Location
            </label>
            <button className="w-full p-6 input-field rounded-xl hover:border-accent transition-colors duration-200 text-left">
              <div className="flex items-center">
                <MapPin className="w-6 h-6 mr-3 text-text-secondary" />
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

export default MobileReportSection;