import React from 'react';

const Footer = () => {
  const footerLinks = {
    Product: [
      { name: 'Features', href: '#' },
      { name: 'How it Works', href: '#' },
      { name: 'Pricing', href: '#' },
    ],
    Company: [
      { name: 'About', href: '#' },
      { name: 'Contact', href: '#' },
      { name: 'Careers', href: '#' },
    ],
    Support: [
      { name: 'Help Center', href: '#' },
      { name: 'Privacy', href: '#' },
      { name: 'Terms', href: '#' },
    ],
  };

  return (
    <footer className="bg-accent text-white py-12 md:py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 md:mb-12">
          
          {/* Logo & Tagline */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-2xl font-semibold mb-2">CivicConnect</h3>
            <p className="text-gray-400">Smart civic reporting platform</p>
          </div>
          
          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full md:w-auto">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-medium mb-4">{category}</h4>
                <div className="space-y-2 text-gray-400">
                  {links.map((link) => (
                    <a 
                      key={link.name}
                      href={link.href} 
                      className="block hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500">© 2025 CivicConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;