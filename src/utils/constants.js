// Application constants
export const API_CONFIG = {
  TIMEOUT: 300_000, // 5 minutes
  POLLING_INTERVAL: 1500, // 1.5 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

export const UI_CONFIG = {
  MAX_PROMPT_LENGTH: 500,
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
};

export const VALIDATION_RULES = {
  PROMPT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 500,
    REQUIRED: true,
  },
  ASPECT_RATIO: {
    REQUIRED: true,
    VALID_VALUES: [
      '--ar 1:1',
      '--ar 3:2',
      '--ar 16:9',
      '--ar 21:9',
      '--ar 2:3',
      '--ar 9:16',
    ],
  },
};

export const ERROR_MESSAGES = {
  NETWORK: 'Network connection failed. Please check your internet connection.',
  API: 'API request failed. Please try again later.',
  VALIDATION: 'Invalid input. Please check your data.',
  TIMEOUT: 'Request timed out. Please try again.',
  CANCELLED: 'Request was cancelled.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
};

// Admin configuration
export const ADMIN_CONFIG = {
  EMAIL: import.meta.env.VITE_ADMIN_EMAIL || 'ADMIN_EMAIL',
};
