// Database configuration for dual environment support
const isProduction = import.meta.env.PROD;

export const dbConfig = {
  // Local MySQL
  local: {
    apiUrl: 'http://localhost:5000/api',
    type: 'mysql'
  },
  // Production Supabase
  production: {
    apiUrl: '/api/supabase',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    type: 'supabase'
  }
};

export const currentDb = isProduction ? dbConfig.production : dbConfig.local;
export const API_BASE_URL = currentDb.apiUrl;