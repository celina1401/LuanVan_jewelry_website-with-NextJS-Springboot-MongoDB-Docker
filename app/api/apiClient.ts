// Client-side REST API client for making requests to the backend
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs'; // Import Clerk's useAuth

const API_URL = 'http://localhost:8080/api';

export const useApi = () => {
  const { getToken, isLoaded } = useAuth(); // Use Clerk's useAuth and getToken

  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    // Get Clerk session token
    const token = isLoaded ? await getToken() : null;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
      
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