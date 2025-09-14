import { useEffect } from 'react';

const PatternSelector = () => {
  const patterns = [
    { id: 'dots', name: 'Dots', className: 'pattern-dots' },
    { id: 'grid', name: 'Grid', className: 'pattern-grid' },
    { id: 'stripes', name: 'Stripes', className: 'pattern-stripes' },
    { id: 'circles', name: 'Circles', className: 'pattern-circles' },
    { id: 'diagonal', name: 'Diagonal', className: 'pattern-diagonal' },
    { id: 'none', name: 'None', className: '' }
  ];

  useEffect(() => {
    // Apply default pattern (dots) - you can change this to any pattern
    const defaultPattern = patterns[1]; // Using dots as default
    
    // Clear any existing pattern classes
    document.body.className = document.body.className.replace(/pattern-\w+/g, '').trim();
    
    // Apply the default pattern
    if (defaultPattern.className) {
      document.body.className += ` ${defaultPattern.className}`;
    }
    
    // Save to localStorage (can be used for future UI implementation)
    localStorage.setItem('selectedPattern', defaultPattern.id);
  }, []);

  // No UI - this is a utility component
  return null;
};

export default PatternSelector;