// src/utils/api.ts

// Determine if we're in production
const isProduction = import.meta.env.PROD;

// Base API URL that changes based on environment
export const API_BASE_URL = '/v1/services';  // Use relative URL to work with proxy

// Helper function to create full API URLs
export const getApiUrl = (endpoint: string) => {
  // Make sure endpoint doesn't start with a slash if we're appending
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_BASE_URL}/${formattedEndpoint}`;
};

// Fetch wrapper with authorization
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const accessToken = localStorage.getItem('accessToken');
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': accessToken ? `Bearer ${accessToken}` : '',
    ...options.headers,
  };
  
  // Create the full URL
  const url = getApiUrl(endpoint);
  
  // Return the fetch promise
  return fetch(url, {
    ...options,
    headers,
  });
};