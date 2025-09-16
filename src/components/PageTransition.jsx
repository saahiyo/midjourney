import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const transitionRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      // Page entrance animation
      gsap.fromTo(contentRef.current,
        {
          opacity: 0,
          filter: 'blur(10px)',
          scale: 0.98
        },
        {
          opacity: 1,
          filter: 'blur(0px)',
          scale: 1,
          duration: 0.8,
          ease: 'power2.out'
        }
      );
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleExit = (e) => {
      if (contentRef.current) {
        e.preventDefault();
        
        // Page exit animation
        gsap.to(contentRef.current, {
          opacity: 0,
          filter: 'blur(8px)',
          scale: 0.99,
          duration: 0.4,
          ease: 'power2.in',
          onComplete: () => {
            // Continue with navigation after animation
            window.location.href = e.detail.href;
          }
        });
      }
    };

    // Listen for custom navigation events
    window.addEventListener('page-transition-exit', handleExit);
    
    return () => {
      window.removeEventListener('page-transition-exit', handleExit);
    };
  }, []);

  return (
    <div ref={transitionRef} className="page-transition">
      <div ref={contentRef} className="page-content">
        {children}
      </div>
      <style jsx>{`
        .page-transition {
          position: relative;
          min-height: 100vh;
        }
        
        .page-content {
          will-change: opacity, filter, transform;
        }
      `}</style>
    </div>
  );
};

export default PageTransition;