// Socket Event DTOs for Rival SaaS

// ==================== Chat Events ====================

export class SendMessageDto {
  roomId: number;
  content: string;
  messageType?: 'text' | 'image' | 'file' | 'system';
}

export class JoinRoomDto {
  roomId: number;
}

export class LeaveRoomDto {
  roomId: number;
}

export class CreateRoomDto {
  name: string;
  type: 'direct' | 'group' | 'team' | 'match';
  participantIds?: number[];
}

export class ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  createdAt: Date;
}

// ==================== Match Invitation Events ====================

export class SendMatchInvitationDto {
  opponentId: number;
  sportType: string;
  matchType: 'casual' | 'ranked' | 'tournament';
  scheduledAt?: Date;
  venue?: string;
  notes?: string;
}

export class RespondMatchInvitationDto {
  invitationId: number;
  response: 'accept' | 'decline' | 'counter';
  counterDate?: Date;
  reason?: string;
}

export class MatchInvitation {
  id: number;
  inviterId: number;
  inviterName: string;
  inviterAvatar?: string;
  inviteeId: number;
  sportType: string;
  matchType: 'casual' | 'ranked' | 'tournament';
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'countered';
  scheduledAt?: Date;
  venue?: string;
  notes?: string;
  createdAt: Date;
}

export class MatchInvitationReceivedPayload {
  invitation: MatchInvitation;
}

// ==================== Team Invitation Events ====================

export class SendTeamInvitationDto {
  userId: number;
  teamId: number;
  role: 'member' | 'captain' | 'vice_captain';
  message?: string;
}

export class RespondTeamInvitationDto {
  invitationId: number;
  response: 'accept' | 'decline';
  reason?: string;
}

export class TeamInvitation {
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

export class TeamInvitationReceivedPayload {
  invitation: TeamInvitation;
}

// ==================== Notification Events ====================

export class NotificationPayload {
  id: number;
  userId: number;
  type: 'match_invitation' | 'team_invitation' | 'chat_message' | 'match_update' | 
        'team_update' | 'achievement' | 'system' | 'friendship';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export class MarkNotificationReadDto {
  notificationId: number;
}

export class MarkAllNotificationsReadDto {
  userId: number;
}

// ==================== Generic Socket Events ====================

export class AuthenticateSocketDto {
  token: string;
}

export class UserPresenceDto {
  userId: number;
  status: 'online' | 'offline' | 'away' | 'busy';
}

export class TypingIndicatorDto {
  roomId: number;
  userId: number;
  isTyping: boolean;
}

// ==================== Event Names ====================

export const SOCKET_EVENTS = {
  // Chat Events
  SEND_MESSAGE: 'chat:sendMessage',
  NEW_MESSAGE: 'chat:newMessage',
  JOIN_ROOM: 'chat:joinRoom',
  LEAVE_ROOM: 'chat:leaveRoom',
  TYPING_START: 'chat:typingStart',
  TYPING_STOP: 'chat:typingStop',
  
  // Match Invitation Events
  SEND_MATCH_INVITATION: 'match:sendInvitation',
  MATCH_INVITATION_RECEIVED: 'match:invitationReceived',
  RESPOND_MATCH_INVITATION: 'match:respondInvitation',
  MATCH_INVITATION_UPDATED: 'match:invitationUpdated',
  
  // Team Invitation Events
  SEND_TEAM_INVITATION: 'team:sendInvitation',
  TEAM_INVITATION_RECEIVED: 'team:invitationReceived',
  RESPOND_TEAM_INVITATION: 'team:respondInvitation',
  TEAM_INVITATION_UPDATED: 'team:invitationUpdated',
  
  // Notification Events
  NOTIFICATION_RECEIVED: 'notification:received',
  MARK_NOTIFICATION_READ: 'notification:markRead',
  MARK_ALL_NOTIFICATIONS_READ: 'notification:markAllRead',
  
  // Presence Events
  USER_PRESENCE_UPDATE: 'presence:update',
  USER_ONLINE: 'presence:online',
  USER_OFFLINE: 'presence:offline',
  
  // Generic Events
  CONNECT: 'connection',
  DISCONNECT: 'disconnect',
  AUTH_ERROR: 'auth:error',
  ERROR: 'error',
} as const;

// Type exports
export type SendMessagePayload = SendMessageDto;
export type NewMessagePayload = ChatMessage;
export type SendMatchInvitationPayload = SendMatchInvitationDto;
export type MatchInvitationReceivedPayloadType = MatchInvitationReceivedPayload;
export type SendTeamInvitationPayload = SendTeamInvitationDto;
export type TeamInvitationReceivedPayloadType = TeamInvitationReceivedPayload;
export type NotificationPayloadType = NotificationPayload;
