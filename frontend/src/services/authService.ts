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

// Auth API functions
export const authService = {
  // Login
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await post<AuthResponse>('/auth/login', data);
    // Store token and user ID
    localStorage.setItem('authToken', response.access_token);
    localStorage.setItem('userId', response.user.id.toString());
    return response;
  },

  // Register
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await post<AuthResponse>('/auth/register', data);
    // Store token and user ID
    localStorage.setItem('authToken', response.access_token);
    localStorage.setItem('userId', response.user.id.toString());
    return response;
  },

  // Get current user profile
  async getCurrentUser(): Promise<AuthResponse['user']> {
    return get<AuthResponse['user']>('/auth/profile');
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
};

export default authService;
