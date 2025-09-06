import React, { memo, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const LoadingSpinner = memo(({ size = 'md', className = '' }) => {
  const spinnerRef = useRef(null);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  useEffect(() => {
    if (spinnerRef.current) {
      gsap.fromTo(spinnerRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
      );
      
      gsap.to(spinnerRef.current, {
        rotation: 360,
        duration: 1,
        ease: "none",
        repeat: -1
      });
    }
  }, []);

  return (
    <div 
      ref={spinnerRef}
      className={`rounded-full border-2 border-neutral-600 border-t-emerald-500 ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
