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
    const data = response.data;

    // 🚦 Si no es cliente → rechazar
    if (data.user?.type !== 'cliente') {
      console.warn(`🚫 Usuario tipo "${data.user?.type}" no permitido en este portal.`);
      throw new Error('Usuario no permitido en esta aplicación.');
    }

    return data;
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
      role: 'cliente', // fuerza tipo cliente
    });

    const data = response.data;

    // 🚦 Si no es cliente → rechazar
    if (data.user?.type !== 'cliente') {
      console.warn(`🚫 Usuario tipo "${data.user?.type}" no permitido en este portal.`);
      throw new Error('Usuario no permitido en esta aplicación.');
    }

    return data;
  },

  /**
   * Register with Google
   */
  async googleRegister(idToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/google/register', {
      idToken,
      type: 'cliente', // fuerza tipo cliente
    });

    const data = response.data;

    // 🚦 Si no es cliente → rechazar
    if (data.user?.type !== 'cliente') {
      console.warn(`🚫 Usuario tipo "${data.user?.type}" no permitido en este portal.`);
      throw new Error('Usuario no permitido en esta aplicación.');
    }

    return data;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    const user = response.data as User;

    // 🚦 Si no es cliente → rechazar
    if (user?.type !== 'cliente') {
      console.warn(`🚫 Usuario tipo "${user?.type}" no permitido en este portal.`);
      throw new Error('Usuario no permitido en esta aplicación.');
    }

    return user;
  },

  /**
   * Logout (clear server-side session if applicable)
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    // Nota: La limpieza del storage se maneja en AuthContext
  },
};
