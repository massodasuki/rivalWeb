export declare class SendMessageDto {
    roomId: number;
    content: string;
    messageType?: 'text' | 'image' | 'file' | 'system';
}
export declare class JoinRoomDto {
    roomId: number;
}
export declare class LeaveRoomDto {
    roomId: number;
}
export declare class CreateRoomDto {
    name: string;
    type: 'direct' | 'group' | 'team' | 'match';
    participantIds?: number[];
}
export declare class ChatMessage {
    id: number;
    roomId: number;
    senderId: number;
    senderName: string;
    senderAvatar?: string;
    content: string;
    messageType: 'text' | 'image' | 'file' | 'system';
    createdAt: Date;
}
export declare class SendMatchInvitationDto {
    opponentId: number;
    sportType: string;
    matchType: 'casual' | 'ranked' | 'tournament';
    scheduledAt?: Date;
    venue?: string;
    notes?: string;
}
export declare class RespondMatchInvitationDto {
    invitationId: number;
    response: 'accept' | 'decline' | 'counter';
    counterDate?: Date;
    reason?: string;
}
export declare class MatchInvitation {
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
export declare class MatchInvitationReceivedPayload {
    invitation: MatchInvitation;
}
export declare class SendTeamInvitationDto {
    userId: number;
    teamId: number;
    role: 'member' | 'captain' | 'vice_captain';
    message?: string;
}
export declare class RespondTeamInvitationDto {
    invitationId: number;
    response: 'accept' | 'decline';
    reason?: string;
}
export declare class TeamInvitation {
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
export declare class TeamInvitationReceivedPayload {
    invitation: TeamInvitation;
}
export declare class NotificationPayload {
    id: number;
    userId: number;
    type: 'match_invitation' | 'team_invitation' | 'chat_message' | 'match_update' | 'team_update' | 'achievement' | 'system' | 'friendship';
    title: string;
    message: string;
    data?: Record<string, any>;
    read: boolean;
    createdAt: Date;
}
export declare class MarkNotificationReadDto {
    notificationId: number;
}
export declare class MarkAllNotificationsReadDto {
    userId: number;
}
export declare class AuthenticateSocketDto {
    token: string;
}
export declare class UserPresenceDto {
    userId: number;
    status: 'online' | 'offline' | 'away' | 'busy';
}
export declare class TypingIndicatorDto {
    roomId: number;
    userId: number;
    isTyping: boolean;
}
export declare const SOCKET_EVENTS: {
    readonly SEND_MESSAGE: "chat:sendMessage";
    readonly NEW_MESSAGE: "chat:newMessage";
    readonly JOIN_ROOM: "chat:joinRoom";
    readonly LEAVE_ROOM: "chat:leaveRoom";
    readonly TYPING_START: "chat:typingStart";
    readonly TYPING_STOP: "chat:typingStop";
    readonly SEND_MATCH_INVITATION: "match:sendInvitation";
    readonly MATCH_INVITATION_RECEIVED: "match:invitationReceived";
    readonly RESPOND_MATCH_INVITATION: "match:respondInvitation";
    readonly MATCH_INVITATION_UPDATED: "match:invitationUpdated";
    readonly SEND_TEAM_INVITATION: "team:sendInvitation";
    readonly TEAM_INVITATION_RECEIVED: "team:invitationReceived";
    readonly RESPOND_TEAM_INVITATION: "team:respondInvitation";
    readonly TEAM_INVITATION_UPDATED: "team:invitationUpdated";
    readonly NOTIFICATION_RECEIVED: "notification:received";
    readonly MARK_NOTIFICATION_READ: "notification:markRead";
    readonly MARK_ALL_NOTIFICATIONS_READ: "notification:markAllRead";
    readonly USER_PRESENCE_UPDATE: "presence:update";
    readonly USER_ONLINE: "presence:online";
    readonly USER_OFFLINE: "presence:offline";
    readonly CONNECT: "connection";
    readonly DISCONNECT: "disconnect";
    readonly AUTH_ERROR: "auth:error";
    readonly ERROR: "error";
};
export type SendMessagePayload = SendMessageDto;
export type NewMessagePayload = ChatMessage;
export type SendMatchInvitationPayload = SendMatchInvitationDto;
export type MatchInvitationReceivedPayloadType = MatchInvitationReceivedPayload;
export type SendTeamInvitationPayload = SendTeamInvitationDto;
export type TeamInvitationReceivedPayloadType = TeamInvitationReceivedPayload;
export type NotificationPayloadType = NotificationPayload;
