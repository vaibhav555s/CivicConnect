import React from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import ReportSection from './components/ReportSection';
import TrackIssues from './components/TrackIssues';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation />
      <Hero />
      <ReportSection />
      <TrackIssues />
      <HowItWorks />
      <Footer />
    </div>
  );
}

export default App;