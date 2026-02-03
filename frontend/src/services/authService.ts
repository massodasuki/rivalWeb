import { get, post } from './api';

// Types for authentication
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  skill_level?: number;
  sport_preferences?: string[];
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    skill_level?: number;
    sport_preferences?: string[];
    avatar?: string;
    phone?: string;
    primary_sport?: string;
  };
}

// Custom error class for auth errors
export class AuthError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'AuthError';
  }
}

// Auth API functions
export const authService = {
  // Login
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await post<AuthResponse>('/api/auth/login', data);
      // Store token and user ID
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('userId', response.user.id.toString());
      return response;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
      throw new AuthError(
        axiosError.response?.data?.message || 'Login failed. Please check your credentials.',
        axiosError.response?.status
      );
    }
  },

  // Register
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await post<AuthResponse>('/api/auth/register', data);
      // Store token and user ID
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('userId', response.user.id.toString());
      return response;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
      
      // Handle specific error cases
      if (axiosError.response?.status === 409) {
        throw new AuthError('An account with this email already exists.', axiosError.response?.status);
      }
      if (axiosError.response?.status === 400) {
        throw new AuthError('Please check your input and try again.', axiosError.response?.status);
      }
      throw new AuthError(
        axiosError.response?.data?.message || 'Registration failed. Please try again later.',
        axiosError.response?.status
      );
    }
  },

  // Get current user profile
  async getCurrentUser(): Promise<AuthResponse['user']> {
    try {
      return await get<AuthResponse['user']>('/api/auth/profile');
    } catch (error) {
      throw new AuthError('Failed to fetch user profile');
    }
  },

  // Logout
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  // Get stored user ID
  getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  },
};

export default authService;
