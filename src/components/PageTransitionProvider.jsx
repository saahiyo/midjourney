import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransitionProvider = ({ 
  children, 
  duration = 400,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionType = 'fade-scale'
}) => {
  const location = useLocation();
  const [transitionState, setTransitionState] = useState('idle');
  const [displayedChildren, setDisplayedChildren] = useState(children);
  const lastLocationRef = useRef(location.pathname);
  const containerRef = useRef(null);
  const timeoutRefs = useRef([]);
  const isFirstRender = useRef(true);

  // Clear all timeouts helper
  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, []);

  // Add timeout with cleanup tracking
  const addTimeout = useCallback((callback, delay) => {
    const timeoutId = setTimeout(() => {
      callback();
      timeoutRefs.current = timeoutRefs.current.filter(id => id !== timeoutId);
    }, delay);
    timeoutRefs.current.push(timeoutId);
    return timeoutId;
  }, []);

  // Handle route transitions
  useEffect(() => {
    if (location.pathname !== lastLocationRef.current) {
      lastLocationRef.current = location.pathname;
      
      if (isFirstRender.current) {
        // Skip transition on first render
        isFirstRender.current = false;
        setDisplayedChildren(children);
        return;
      }

      // Start exit transition
      setTransitionState('exiting');
      
      // After exit completes, update content and start entrance
      addTimeout(() => {
        setDisplayedChildren(children);
        setTransitionState('entering');
        
        // Complete entrance
        addTimeout(() => {
          setTransitionState('idle');
        }, duration / 2);
      }, duration / 2);
    }
  }, [location.pathname, children, duration, addTimeout]);

  // Initial load animation
  useEffect(() => {
    if (isFirstRender.current && containerRef.current) {
      // Prevent flash of unstyled content
      containerRef.current.style.opacity = '0';
      
      addTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = `all ${duration}ms ${easing}`;
          containerRef.current.style.opacity = '1';
        }
        isFirstRender.current = false;
      }, 50);
    }
  }, [duration, easing, addTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  // Get transition classes based on type
  const getTransitionClasses = () => {
    const baseClass = 'page-transition-container';
    const typeClass = `transition-${transitionType}`;
    const stateClass = transitionState !== 'idle' ? `transition-${transitionState}` : '';
    
    return `${baseClass} ${typeClass} ${stateClass}`.trim();
  };

  // Generate CSS based on transition type and duration
  const generateCSS = () => {
    const transitions = {
      'fade-scale': {
        base: `
          opacity: 1;
          transform: scale(1);
          filter: blur(0px);
        `,
        exiting: `
          opacity: 0;
          transform: scale(0.95);
          filter: blur(4px);
        `,
        entering: `
          opacity: 1;
          transform: scale(1);
          filter: blur(0px);
        `
      },
      'slide-fade': {
        base: `
          opacity: 1;
          transform: translateY(0px);
        `,
        exiting: `
          opacity: 0;
          transform: translateY(-20px);
        `,
        entering: `
          opacity: 1;
          transform: translateY(0px);
        `
      },
      'zoom': {
        base: `
          opacity: 1;
          transform: scale(1);
        `,
        exiting: `
          opacity: 0;
          transform: scale(1.05);
        `,
        entering: `
          opacity: 1;
          transform: scale(1);
        `
      },
      'fade': {
        base: `
          opacity: 1;
        `,
        exiting: `
          opacity: 0;
        `,
        entering: `
          opacity: 1;
        `
      }
    };

    const config = transitions[transitionType] || transitions['fade-scale'];

    return `
      .page-transition-container {
        min-height: 100vh;
        transition: all ${duration}ms ${easing};
        will-change: opacity, transform, filter;
        ${config.base}
      }
      
      .transition-${transitionType}.transition-exiting {
        ${config.exiting}
      }
      
      .transition-${transitionType}.transition-entering {
        ${config.entering}
      }
      
      /* Reduce motion for accessibility */
      @media (prefers-reduced-motion: reduce) {
        .page-transition-container {
          transition-duration: 0ms !important;
          filter: none !important;
          transform: none !important;
        }
      }
      
      /* Performance optimizations */
      .page-transition-container * {
        backface-visibility: hidden;
        perspective: 1000px;
      }
    `;
  };

  return (
    <>
      <style jsx>{generateCSS()}</style>
      <div 
        ref={containerRef}
        className={getTransitionClasses()}
        aria-live="polite"
        role="main"
      >
        {displayedChildren}
      </div>
    </>
  );
};

export default PageTransitionProvider;