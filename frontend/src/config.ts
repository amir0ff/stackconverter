// Configuration for API endpoints
const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000'  // Development - direct backend
  : 'http://api.amiroff.me:5000'; // Production - public backend URL

export const API_ENDPOINTS = {
  convert: `${API_BASE_URL}/convert`,
  upload: `${API_BASE_URL}/upload`,
  batchConvert: `${API_BASE_URL}/batch-convert`,
} as const; 