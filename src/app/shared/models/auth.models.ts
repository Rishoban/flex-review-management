export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    user: User;
    expiresIn: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface TokenStorage {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}