import React from 'react';

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-subtle to-background px-4 md:px-8 pt-18">
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Main Headline */}
        <h1 className="text-display md:text-8xl font-semibold text-accent leading-tight mb-6">
          Report Civic Issues
          <br />
          <span className="text-text-secondary">Effortlessly</span>
        </h1>
        
        {/* Subheadline */}
        <p className="text-body-lg mb-12 max-w-2xl mx-auto leading-relaxed">
          Quickly report potholes, streetlight issues, and civic problems in your area. 
          Track progress and see real change happen.
        </p>
        
        {/* Primary CTA */}
        <button className="btn-primary px-12 py-4 rounded-xl text-lg mb-8">
          Report an Issue
        </button>
        
        {/* Secondary Info */}
        <p className="text-sm text-gray-500">
          No registration required • Anonymous reporting available
        </p>
        
      </div>
    </section>
  );
};

export default Hero;