// Analytics utilities for tracking user interactions
export const trackEvent = (eventName, properties = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', eventName, properties);
  }
  
  // In production, you would send this to your analytics service
  // Example: Google Analytics, Mixpanel, etc.
  // gtag('event', eventName, properties);
};

export const trackGeneration = (prompt, aspectRatio, duration, success) => {
  trackEvent('image_generation', {
    prompt_length: prompt.length,
    aspect_ratio: aspectRatio,
    duration_ms: duration,
    success,
  });
};

export const trackError = (errorType, errorMessage, context = '') => {
  trackEvent('error', {
    error_type: errorType,
    error_message: errorMessage,
    context,
  });
};

export const trackUserAction = (action, element = '') => {
  trackEvent('user_action', {
    action,
    element,
    timestamp: Date.now(),
  });
};
