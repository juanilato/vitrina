/**
 * Authentication Service
 */

import api from '../config/axios.config';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from '../types/auth';

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new client user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register/cliente', {
      ...data,
    });
    return response.data;
  },

  /**
   * Login with Google
   */
  async googleLogin(idToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/google', {
      idToken,
      role: 'cliente', // Force role to be cliente
    });
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },

  /**
   * Logout (clear server-side session if applicable)
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
      console.error('Logout error:', error);
    }
  },
};
