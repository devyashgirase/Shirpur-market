// Database configuration for dual environment support
const isProduction = import.meta.env.PROD;

export const dbConfig = {
  // Local MySQL
  local: {
    apiUrl: 'http://localhost:5000/api',
    type: 'mysql'
  },
  // Production MySQL on Vercel
  production: {
    apiUrl: '/api',
    type: 'mysql'
  }
};

export const currentDb = isProduction ? dbConfig.production : dbConfig.local;
export const API_BASE_URL = currentDb.apiUrl;