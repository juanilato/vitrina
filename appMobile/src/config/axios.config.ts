/**
 * Axios Configuration
 * Interceptors for token management
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL, STORAGE_KEYS } from '../utils/constants';
import { storage } from '../utils/storage';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add token to headers
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await storage.getItem(STORAGE_KEYS.TOKEN);

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error('Error adding token to request:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response) {
      // Handle 401 Unauthorized (token expired or invalid)
      if (error.response.status === 401) {
        console.log('Token expired or invalid, clearing storage');

        // Clear token and user data
        await storage.removeItem(STORAGE_KEYS.TOKEN);
        await storage.removeItem(STORAGE_KEYS.USER);

        // Redirect to login will be handled by AuthContext
      }

      // Handle other status codes
      if (error.response.status === 403) {
        console.error('Access forbidden');
      }

      if (error.response.status === 500) {
        console.error('Server error');
      }
    } else if (error.request) {
      // Request was made but no response
      console.error('No response from server');
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
