// Input validation utilities
export const validatePrompt = (prompt) => {
  if (!prompt || typeof prompt !== 'string') {
    return { isValid: false, error: 'Prompt is required' };
  }
  
  const trimmed = prompt.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Prompt cannot be empty' };
  }
  
  if (trimmed.length > 500) {
    return { isValid: false, error: 'Prompt must be 500 characters or less' };
  }
  
  // Check for potentially harmful content
  const harmfulPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
  ];
  
  for (const pattern of harmfulPatterns) {
    if (pattern.test(trimmed)) {
      return { isValid: false, error: 'Prompt contains invalid content' };
    }
  }
  
  return { isValid: true };
};

export const validateAspectRatio = (aspectRatio) => {
  const validRatios = [
    '--ar 1:1',
    '--ar 3:2',
    '--ar 16:9',
    '--ar 21:9',
    '--ar 2:3',
    '--ar 9:16',
  ];
  
  if (!validRatios.includes(aspectRatio)) {
    return { isValid: false, error: 'Invalid aspect ratio' };
  }
  
  return { isValid: true };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Only remove potentially dangerous HTML characters
    .substring(0, 500); // Limit length
};
