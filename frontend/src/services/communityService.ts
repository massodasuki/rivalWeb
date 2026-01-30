import { get, post, patch, del } from './api';

// Types for community posts
export interface CommunityPost {
  id: number;
  user_id: number;
  title?: string;
  content: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
  // Additional fields for UI
  author?: string;
  author_avatar?: string;
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
};

export default communityService;
