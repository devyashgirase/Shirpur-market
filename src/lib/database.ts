// Database configuration for dual environment support
const isProduction = import.meta.env.PROD;
const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

export const dbConfig = {
  // Local MySQL
  local: {
    apiUrl: 'http://localhost:5000/api',
    type: 'mysql'
  },
  // Production Supabase
  production: {
    apiUrl: '/api/supabase',
    type: 'supabase'
  }
};

// Use Supabase if in production OR if Supabase config is available
export const useSupabase = isProduction || hasSupabaseConfig;
export const currentDb = useSupabase ? dbConfig.production : dbConfig.local;
export const API_BASE_URL = currentDb.apiUrl;
export const DB_TYPE = currentDb.type;