import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const usePageTransition = () => {
  const navigate = useNavigate();

  const navigateWithTransition = useCallback((path, options = {}) => {
    const { 
      exitDuration = 400, // Default exit animation duration
      onStart = () => {},
      onComplete = () => {}
    } = options;

    // Start exit animation
    onStart();
    
    // Dispatch custom event for page exit
    window.dispatchEvent(new CustomEvent('page-transition-exit', {
      detail: { href: path }
    }));

    // Wait for exit animation to complete before navigating
    setTimeout(() => {
      navigate(path);
      onComplete();
    }, exitDuration);
  }, [navigate]);

  return navigateWithTransition;
};