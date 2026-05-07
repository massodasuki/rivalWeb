/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Socket event types
export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  createdAt: Date;
}

export interface MatchInvitation {
  id: number;
  inviterId: number;
  inviterName: string;
  inviterAvatar?: string;
  inviteeId: number;
  inviteeName?: string;
  sportType: string;
  matchType: 'casual' | 'ranked' | 'tournament';
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'countered';
  scheduledAt?: Date;
  venue?: string;
  notes?: string;
  createdAt: Date;
}

export interface TeamInvitation {
  id: number;
  inviterId: number;
  inviterName: string;
  inviterAvatar?: string;
  teamId: number;
  teamName: string;
  teamAvatar?: string;
  role: 'member' | 'captain' | 'vice_captain';
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  message?: string;
  createdAt: Date;
}

export interface Notification {
  id: number;
  userId: number;
  type: 'match_invitation' | 'team_invitation' | 'chat_message' | 'match_update' | 
        'team_update' | 'achievement' | 'system' | 'friendship';
  title?: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export interface UserTyping {
  roomId: number;
  userId: number;
  username: string;
  isTyping: boolean;
}

export interface MatchInvitationUpdated {
  invitationId: number;
  responderId: number;
  responderName?: string;
  response: 'accept' | 'decline' | 'counter';
  status: 'accepted' | 'declined';
}

export interface TeamInvitationUpdated {
  invitationId: number;
  responderId: number;
  responderName?: string;
  response: 'accept' | 'decline';
  status: 'accepted' | 'declined';
}
