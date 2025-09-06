// Error handling utilities
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  API: 'API_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

export const getErrorMessage = (error, type = ErrorTypes.UNKNOWN) => {
  if (typeof error === 'string') return error;
  
  switch (type) {
    case ErrorTypes.NETWORK:
      return 'Network connection failed. Please check your internet connection and try again.';
    case ErrorTypes.API:
      return error.message || 'API request failed. Please try again later.';
    case ErrorTypes.VALIDATION:
      return error.message || 'Invalid input. Please check your data and try again.';
    case ErrorTypes.AUTH:
      return 'Authentication failed. Please log in again.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

export const logError = (error, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
  }
  // In production, you might want to send errors to a logging service
  // like Sentry, LogRocket, etc.
};

export const handleApiError = (error) => {
  logError(error, 'API');
  
  if (error.name === 'AbortError') {
    return { type: ErrorTypes.NETWORK, message: 'Request was cancelled' };
  }
  
  if (error.message?.includes('HTTP')) {
    return { type: ErrorTypes.API, message: getErrorMessage(error, ErrorTypes.API) };
  }
  
  return { type: ErrorTypes.UNKNOWN, message: getErrorMessage(error) };
};
