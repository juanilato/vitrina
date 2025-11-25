/**
 * Public Axios Configuration
 * For endpoints that don't require authentication
 */

import axios from 'axios';
import { API_URL } from '../utils/constants';

const publicApi = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// No interceptors needed for public API
// Public endpoints don't require authentication

export default publicApi;
