// Environment variable validation
export const validateEnvironment = () => {
  const errors = [];
  const warnings = [];

  // Required environment variables
  const requiredVars = {
    VITE_MJ_API_URL: 'MidJourney API URL',
  };

  // Optional but recommended environment variables
  const optionalVars = {
    VITE_SUPABASE_URL: 'Supabase URL',
    VITE_SUPABASE_ANON_KEY: 'Supabase Anonymous Key',
  };

  // Check required variables
  Object.entries(requiredVars).forEach(([key, description]) => {
    if (!import.meta.env[key]) {
      errors.push(`Missing required environment variable: ${key} (${description})`);
    }
  });

  // Check optional variables
  Object.entries(optionalVars).forEach(([key, description]) => {
    if (!import.meta.env[key]) {
      warnings.push(`Missing optional environment variable: ${key} (${description})`);
    }
  });

  // Validate API URL format
  const apiUrl = import.meta.env.VITE_MJ_API_URL;
  if (apiUrl && !isValidUrl(apiUrl)) {
    errors.push('VITE_MJ_API_URL must be a valid URL');
  }

  // Validate Supabase URL format
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl && !isValidUrl(supabaseUrl)) {
    errors.push('VITE_SUPABASE_URL must be a valid URL');
  }

  return { errors, warnings };
};

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const logEnvironmentStatus = () => {
  const { errors, warnings } = validateEnvironment();

  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Environment warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Environment validation passed');
  }

  return { errors, warnings };
};
