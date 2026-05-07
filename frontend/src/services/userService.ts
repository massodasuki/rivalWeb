import { get, patch, del, post } from './api';

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

export interface UpdateNotificationsData {
  email?: boolean;
  push?: boolean;
  matchReminders?: boolean;
  teamInvites?: boolean;
  friendRequests?: boolean;
}

export interface UpdatePrivacyData {
  profileVisible?: boolean;
  showOnlineStatus?: boolean;
  allowFriendRequests?: boolean;
  showInLeaderboards?: boolean;
}

export interface UpdatePasswordData {
  current_password?: string;
  new_password: string;
}

// User API functions
export const userService = {
  // Get all users
  async getUsers(): Promise<User[]> {
    return get<User[]>('/api/users');
  },

  // Get a single user by ID
  async getUser(id: number): Promise<User> {
    return get<User>(`/api/users/${id}`);
  },

  // Get user stats
  async getUserStats(id: number): Promise<UserStats> {
    return get<UserStats>(`/api/users/${id}/stats`);
  },

  // Update a user
  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    return patch<User>(`/api/users/${id}`, data);
  },

  // Delete a user
  async deleteUser(id: number): Promise<void> {
    return del(`/api/users/${id}`);
  },

  // Update notification preferences
  async updateNotifications(id: number, data: UpdateNotificationsData): Promise<{ status: string }> {
    return patch<{ status: string }>(`/api/users/${id}/notifications`, data);
  },

  // Update privacy settings
  async updatePrivacy(id: number, data: UpdatePrivacyData): Promise<{ status: string }> {
    return patch<{ status: string }>(`/api/users/${id}/privacy`, data);
  },

  // Update password
  async updatePassword(id: number, data: UpdatePasswordData): Promise<{ status: string }> {
    return post<{ status: string }>(`/api/users/${id}/password`, data);
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
