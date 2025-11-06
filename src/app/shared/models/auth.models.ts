export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}