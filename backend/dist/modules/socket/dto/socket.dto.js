"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET_EVENTS = exports.TypingIndicatorDto = exports.UserPresenceDto = exports.AuthenticateSocketDto = exports.MarkAllNotificationsReadDto = exports.MarkNotificationReadDto = exports.NotificationPayload = exports.TeamInvitationReceivedPayload = exports.TeamInvitation = exports.RespondTeamInvitationDto = exports.SendTeamInvitationDto = exports.MatchInvitationReceivedPayload = exports.MatchInvitation = exports.RespondMatchInvitationDto = exports.SendMatchInvitationDto = exports.ChatMessage = exports.CreateRoomDto = exports.LeaveRoomDto = exports.JoinRoomDto = exports.SendMessageDto = void 0;
class SendMessageDto {
}
exports.SendMessageDto = SendMessageDto;
class JoinRoomDto {
}
exports.JoinRoomDto = JoinRoomDto;
class LeaveRoomDto {
}
exports.LeaveRoomDto = LeaveRoomDto;
class CreateRoomDto {
}
exports.CreateRoomDto = CreateRoomDto;
class ChatMessage {
}
exports.ChatMessage = ChatMessage;
class SendMatchInvitationDto {
}
exports.SendMatchInvitationDto = SendMatchInvitationDto;
class RespondMatchInvitationDto {
}
exports.RespondMatchInvitationDto = RespondMatchInvitationDto;
class MatchInvitation {
}
exports.MatchInvitation = MatchInvitation;
class MatchInvitationReceivedPayload {
}
exports.MatchInvitationReceivedPayload = MatchInvitationReceivedPayload;
class SendTeamInvitationDto {
}
exports.SendTeamInvitationDto = SendTeamInvitationDto;
class RespondTeamInvitationDto {
}
exports.RespondTeamInvitationDto = RespondTeamInvitationDto;
class TeamInvitation {
}
exports.TeamInvitation = TeamInvitation;
class TeamInvitationReceivedPayload {
}
exports.TeamInvitationReceivedPayload = TeamInvitationReceivedPayload;
class NotificationPayload {
}
exports.NotificationPayload = NotificationPayload;
class MarkNotificationReadDto {
}
exports.MarkNotificationReadDto = MarkNotificationReadDto;
class MarkAllNotificationsReadDto {
}
exports.MarkAllNotificationsReadDto = MarkAllNotificationsReadDto;
class AuthenticateSocketDto {
}
exports.AuthenticateSocketDto = AuthenticateSocketDto;
class UserPresenceDto {
}
exports.UserPresenceDto = UserPresenceDto;
class TypingIndicatorDto {
}
exports.TypingIndicatorDto = TypingIndicatorDto;
exports.SOCKET_EVENTS = {
    SEND_MESSAGE: 'chat:sendMessage',
    NEW_MESSAGE: 'chat:newMessage',
    JOIN_ROOM: 'chat:joinRoom',
    LEAVE_ROOM: 'chat:leaveRoom',
    TYPING_START: 'chat:typingStart',
    TYPING_STOP: 'chat:typingStop',
    SEND_MATCH_INVITATION: 'match:sendInvitation',
    MATCH_INVITATION_RECEIVED: 'match:invitationReceived',
    RESPOND_MATCH_INVITATION: 'match:respondInvitation',
    MATCH_INVITATION_UPDATED: 'match:invitationUpdated',
    SEND_TEAM_INVITATION: 'team:sendInvitation',
    TEAM_INVITATION_RECEIVED: 'team:invitationReceived',
    RESPOND_TEAM_INVITATION: 'team:respondInvitation',
    TEAM_INVITATION_UPDATED: 'team:invitationUpdated',
    NOTIFICATION_RECEIVED: 'notification:received',
    MARK_NOTIFICATION_READ: 'notification:markRead',
    MARK_ALL_NOTIFICATIONS_READ: 'notification:markAllRead',
    USER_PRESENCE_UPDATE: 'presence:update',
    USER_ONLINE: 'presence:online',
    USER_OFFLINE: 'presence:offline',
    CONNECT: 'connection',
    DISCONNECT: 'disconnect',
    AUTH_ERROR: 'auth:error',
    ERROR: 'error',
};
//# sourceMappingURL=socket.dto.js.map