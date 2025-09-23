// Database configuration for dual environment support
const isProduction = import.meta.env.PROD;

export const dbConfig = {
  // Local MySQL
  local: {
    apiUrl: 'http://localhost:5000/api',
    type: 'mysql'
  },
  // Production Supabase on Vercel
  production: {
    apiUrl: '/api/supabase',
    type: 'supabase'
  }
};

export const currentDb = isProduction ? dbConfig.production : dbConfig.local;
export const API_BASE_URL = currentDb.apiUrl;
export const DB_TYPE = currentDb.type;