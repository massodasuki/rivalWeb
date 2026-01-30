import { get, patch, del } from './api';

// Types for users (matching backend entity)
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string;
  primary_sport?: string;
  skill_level?: number;
  sport_preferences?: string[];
  created_at?: string;
  updated_at?: string;
  // Additional fields for UI
  team?: string;
  teamRank?: number;
}

// Backend entity type (with password_hash - not for frontend use)
export interface UserEntity {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  skill_level?: number;
  location?: string;
  sport_preferences?: string[];
  avatar?: string;
  phone?: string;
  primary_sport?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserStats {
  matches: number;
  wins: number;
  losses: number;
  goals: number;
  assists: number;
  rating: number;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  primary_sport?: string;
  skill_level?: number;
}

// User API functions
export const userService = {
  // Get all users
  async getUsers(): Promise<User[]> {
    return get<User[]>('/users');
  },

  // Get a single user by ID
  async getUser(id: number): Promise<User> {
    return get<User>(`/users/${id}`);
  },

  // Get user stats
  async getUserStats(id: number): Promise<UserStats> {
    return get<UserStats>(`/users/${id}/stats`);
  },

  // Update a user
  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    return patch<User>(`/users/${id}`, data);
  },

  // Delete a user
  async deleteUser(id: number): Promise<void> {
    return del(`/users/${id}`);
  },

  // Get current user profile (uses /auth/profile endpoint)
  async getCurrentUser(): Promise<User> {
    const userId = localStorage.getItem('userId');
    if (userId) {
      return this.getUser(parseInt(userId, 10));
    }
    throw new Error('User not authenticated');
  },
};

export default userService;
