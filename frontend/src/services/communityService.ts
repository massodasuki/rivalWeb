import { get, post, patch, del } from './api';

// Types for community posts (matching backend entity)
export interface CommunityPost {
  id: number;
  user_id: number;
  title?: string;
  content: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
  // Relations (populated by backend) - can be string (author name) or object
  author?: string | {
    id: number;
    name: string;
    avatar?: string;
  };
  // Additional fields for UI
  replies?: number;
  time?: string;
  likes?: number;
  comments?: number;
}

export interface CreatePostData {
  user_id: number;
  title?: string;
  content: string;
  type?: string;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  type?: string;
}

export interface ReplyPostData {
  user_id: number;
  content: string;
}

export interface EventRegistrationData {
  user_id: number;
  event_id: number;
}

// Community API functions
export const communityService = {
  // Get all community posts
  async getPosts(): Promise<CommunityPost[]> {
    return get<CommunityPost[]>('/community');
  },

  // Get a single post by ID
  async getPost(id: number): Promise<CommunityPost> {
    return get<CommunityPost>(`/community/${id}`);
  },

  // Create a new post
  async createPost(data: CreatePostData): Promise<CommunityPost> {
    return post<CommunityPost>('/community', data);
  },

  // Update a post
  async updatePost(id: number, data: UpdatePostData): Promise<CommunityPost> {
    return patch<CommunityPost>(`/community/${id}`, data);
  },

  // Delete a post
  async deletePost(id: number): Promise<void> {
    return del(`/community/${id}`);
  },

  // Reply to a post
  async replyToPost(id: number, data: ReplyPostData): Promise<{ status: string }> {
    return post<{ status: string }>(`/community/${id}/replies`, data);
  },

  // Register for an event
  async registerEvent(data: EventRegistrationData): Promise<{ status: string }> {
    return post<{ status: string }>(`/community/events/register`, data);
  },

  // Join an event
  async joinEvent(data: EventRegistrationData): Promise<{ status: string }> {
    return post<{ status: string }>(`/community/events/join`, data);
  },
};

export default communityService;
