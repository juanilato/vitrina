/**
 * Authentication Types
 */

export interface User {
  type: any;
  id: string;
  name: string;
  email: string;
  role: 'cliente' | 'empresa' | 'repartidor';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
    type: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface GoogleAuthResponse {
  idToken: string;
  accessToken?: string;
}
