import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      icon: '📸',
      title: 'Report',
      description: 'Snap a photo and describe the civic issue in your neighborhood',
    },
    {
      icon: '🔄',
      title: 'Assigned',
      description: 'Your report gets automatically assigned to the relevant department',
    },
    {
      icon: '✅',
      title: 'Resolved',
      description: 'Track progress and get notified when the issue is fixed',
    },
  ];

  return (
    <section className="py-16 md:py-32 bg-surface px-4 md:px-8">
      <div className="max-w-6xl mx-auto text-center">
        
        <h2 className="text-h1 md:text-5xl font-semibold text-accent mb-12 md:mb-20">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-16">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-subtle rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">{step.icon}</span>
              </div>
              <h3 className="text-h2 font-semibold text-accent mb-4">{step.title}</h3>
              <p className="text-text-secondary leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;