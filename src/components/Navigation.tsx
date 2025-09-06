import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-borders">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-18">
        <div className="flex items-center justify-between h-full">
          
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-accent">CivicConnect</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            <a href="#report" className="text-text-secondary hover:text-accent font-medium transition-colors duration-200">Report Issue</a>
            <a href="#track" className="text-text-secondary hover:text-accent font-medium transition-colors duration-200">Track Issues</a>
            <a href="#about" className="text-text-secondary hover:text-accent font-medium transition-colors duration-200">About</a>
          </div>
          
          {/* Login Button */}
          <button className="hidden md:block btn-primary px-6 py-2.5 rounded-lg">
            Admin Login
          </button>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-text-secondary" />
            ) : (
              <Menu className="w-6 h-6 text-text-secondary" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-borders">
          <div className="px-4 py-6 space-y-4">
            <a href="#report" className="block text-text-secondary hover:text-accent font-medium transition-colors duration-200">Report Issue</a>
            <a href="#track" className="block text-text-secondary hover:text-accent font-medium transition-colors duration-200">Track Issues</a>
            <a href="#about" className="block text-text-secondary hover:text-accent font-medium transition-colors duration-200">About</a>
            <button className="w-full btn-primary px-6 py-2.5 rounded-lg mt-4">
              Admin Login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;