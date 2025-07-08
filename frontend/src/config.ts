// Configuration for API endpoints
const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000'  // Development - direct backend
  : '/api';                   // Production - proxied through Apache

export const API_ENDPOINTS = {
  convert: `${API_BASE_URL}/convert`,
  upload: `${API_BASE_URL}/upload`,
  batchConvert: `${API_BASE_URL}/batch-convert`,
} as const; 