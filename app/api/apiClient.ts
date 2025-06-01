// Client-side REST API client for making requests to the backend
import { useAuth } from '@clerk/nextjs';

const API_URL = 'http://localhost:8080/api';

export const useApi = () => {
  const { getToken, isLoaded } = useAuth();

  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    if (!isLoaded) {
      throw new Error('Auth not loaded');
    }

    try {
      // Get Clerk session token
      const token = await getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {}),
      };
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });
      
      if (response.status === 401) {
        throw new Error('Unauthorized access');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  };
  
  return {
    get: (endpoint: string) => makeRequest(endpoint, { method: 'GET' }),
    post: (endpoint: string, body: any) => makeRequest(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(body),
    }),
    put: (endpoint: string, body: any) => makeRequest(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(body),
    }),
    delete: (endpoint: string) => makeRequest(endpoint, { method: 'DELETE' }),
  };
};