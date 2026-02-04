"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SocketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const socket_dto_1 = require("./dto/socket.dto");
const chat_service_1 = require("../chat/chat.service");
const notifications_service_1 = require("../notifications/notifications.service");
const matches_service_1 = require("../matches/matches.service");
const teams_service_1 = require("../teams/teams.service");
const users_service_1 = require("../users/users.service");
let SocketGateway = SocketGateway_1 = class SocketGateway {
    constructor(jwtService, configService, chatService, notificationsService, matchesService, teamsService, usersService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.chatService = chatService;
        this.notificationsService = notificationsService;
        this.matchesService = matchesService;
        this.teamsService = teamsService;
        this.usersService = usersService;
        this.logger = new common_1.Logger(SocketGateway_1.name);
        this.userSockets = new Map();
    }
    afterInit(server) {
        this.logger.log('WebSocket Gateway initialized');
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                this.logger.warn(`Client ${client.id} attempted to connect without token`);
                client.emit(socket_dto_1.SOCKET_EVENTS.AUTH_ERROR, { message: 'Authentication required' });
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            const user = await this.usersService.findOne(payload.sub);
            if (!user) {
                client.emit(socket_dto_1.SOCKET_EVENTS.AUTH_ERROR, { message: 'User not found' });
                client.disconnect();
                return;
            }
            client.userId = user.id;
            client.user = {
                id: user.id,
                name: user.name,
                email: user.email,
            };
            if (!this.userSockets.has(user.id)) {
                this.userSockets.set(user.id, new Set());
            }
            this.userSockets.get(user.id).add(client.id);
            client.join(`user_${user.id}`);
            client.broadcast.emit(socket_dto_1.SOCKET_EVENTS.USER_ONLINE, { userId: user.id });
            this.logger.log(`Client ${client.id} connected as user ${user.id}`);
        }
        catch (error) {
            this.logger.error(`Connection error: ${error.message}`);
            client.emit(socket_dto_1.SOCKET_EVENTS.AUTH_ERROR, { message: 'Invalid token' });
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        if (client.userId) {
            const userSockets = this.userSockets.get(client.userId);
            if (userSockets) {
                userSockets.delete(client.id);
                if (userSockets.size === 0) {
                    this.userSockets.delete(client.userId);
                    client.broadcast.emit(socket_dto_1.SOCKET_EVENTS.USER_OFFLINE, { userId: client.userId });
                }
            }
            this.logger.log(`Client ${client.id} disconnected for user ${client.userId}`);
        }
        else {
            this.logger.log(`Client ${client.id} disconnected`);
        }
    }
    handleJoinRoom(client, data) {
        const { roomId } = data;
        client.join(`room_${roomId}`);
        this.logger.log(`User ${client.userId} joined room ${roomId}`);
        return { event: 'joinedRoom', data: { roomId } };
    }
    handleLeaveRoom(client, data) {
        const { roomId } = data;
        client.leave(`room_${roomId}`);
        this.logger.log(`User ${client.userId} left room ${roomId}`);
        return { event: 'leftRoom', data: { roomId } };
    }
    async handleSendMessage(client, data) {
        try {
            const message = await this.chatService.saveMessage({
                room_id: data.roomId,
                sender_id: client.userId,
                message: data.content,
            });
            const sender = await this.usersService.findOne(client.userId);
            const messagePayload = {
                id: message.id,
                roomId: data.roomId,
                senderId: client.userId,
                senderName: sender?.name || 'Unknown',
                content: data.content,
                messageType: data.messageType || 'text',
                createdAt: message.created_at,
            };
            this.server.to(`room_${data.roomId}`).emit(socket_dto_1.SOCKET_EVENTS.NEW_MESSAGE, messagePayload);
            return { event: 'messageSent', data: messagePayload };
        }
        catch (error) {
            this.logger.error(`Error sending message: ${error.message}`);
            return { event: socket_dto_1.SOCKET_EVENTS.ERROR, data: { message: 'Failed to send message' } };
        }
    }
    handleTypingStart(client, data) {
        client.to(`room_${data.roomId}`).emit('chat:userTyping', {
            roomId: data.roomId,
            userId: client.userId,
            username: client.user?.name,
            isTyping: true,
        });
    }
    handleTypingStop(client, data) {
        client.to(`room_${data.roomId}`).emit('chat:userTyping', {
            roomId: data.roomId,
            userId: client.userId,
            username: client.user?.name,
            isTyping: false,
        });
    }
    async handleSendMatchInvitation(client, data) {
        try {
            const inviter = await this.usersService.findOne(client.userId);
            const invitee = await this.usersService.findOne(data.opponentId);
            const invitationPayload = {
                id: Date.now(),
                inviterId: client.userId,
                inviterName: inviter?.name || 'Unknown',
                inviteeId: data.opponentId,
                inviteeName: invitee?.name || 'Unknown',
                sportType: data.sportType,
                matchType: data.matchType,
                status: 'pending',
                scheduledAt: data.scheduledAt,
                venue: data.venue,
                notes: data.notes,
                createdAt: new Date(),
            };
            this.server.to(`user_${data.opponentId}`).emit(socket_dto_1.SOCKET_EVENTS.MATCH_INVITATION_RECEIVED, { invitation: invitationPayload });
            await this.notificationsService.create({
                user_id: data.opponentId,
                type: 'match_invitation',
                message: `${inviter?.name} has invited you to a ${data.matchType} ${data.sportType} match`,
            });
            return { event: 'invitationSent', data: invitationPayload };
        }
        catch (error) {
            this.logger.error(`Error sending match invitation: ${error.message}`);
            return { event: socket_dto_1.SOCKET_EVENTS.ERROR, data: { message: 'Failed to send invitation' } };
        }
    }
    async handleRespondMatchInvitation(client, data) {
        try {
            const responder = await this.usersService.findOne(client.userId);
            this.server.emit(socket_dto_1.SOCKET_EVENTS.MATCH_INVITATION_UPDATED, {
                invitationId: data.invitationId,
                responderId: client.userId,
                responderName: responder?.name,
                response: data.response,
                status: data.response === 'accept' ? 'accepted' : 'declined',
            });
            return { event: 'invitationResponded', data: { success: true } };
        }
        catch (error) {
            this.logger.error(`Error responding to match invitation: ${error.message}`);
            return { event: socket_dto_1.SOCKET_EVENTS.ERROR, data: { message: 'Failed to respond to invitation' } };
        }
    }
    async handleSendTeamInvitation(client, data) {
        try {
            const inviter = await this.usersService.findOne(client.userId);
            const team = await this.teamsService.findOne(data.teamId);
            const invitationPayload = {
                id: Date.now(),
                inviterId: client.userId,
                inviterName: inviter?.name || 'Unknown',
                teamId: data.teamId,
                teamName: team?.name || 'Unknown Team',
                role: data.role,
                status: 'pending',
                message: data.message,
                createdAt: new Date(),
            };
            this.server.to(`user_${data.userId}`).emit(socket_dto_1.SOCKET_EVENTS.TEAM_INVITATION_RECEIVED, { invitation: invitationPayload });
            await this.notificationsService.create({
                user_id: data.userId,
                type: 'team_invitation',
                message: `${inviter?.name} has invited you to join ${team?.name}`,
            });
            return { event: 'teamInvitationSent', data: invitationPayload };
        }
        catch (error) {
            this.logger.error(`Error sending team invitation: ${error.message}`);
            return { event: socket_dto_1.SOCKET_EVENTS.ERROR, data: { message: 'Failed to send invitation' } };
        }
    }
    async handleRespondTeamInvitation(client, data) {
        try {
            const responder = await this.usersService.findOne(client.userId);
            this.server.emit(socket_dto_1.SOCKET_EVENTS.TEAM_INVITATION_UPDATED, {
                invitationId: data.invitationId,
                responderId: client.userId,
                responderName: responder?.name,
                response: data.response,
                status: data.response === 'accept' ? 'accepted' : 'declined',
            });
            return { event: 'teamInvitationResponded', data: { success: true } };
        }
        catch (error) {
            this.logger.error(`Error responding to team invitation: ${error.message}`);
            return { event: socket_dto_1.SOCKET_EVENTS.ERROR, data: { message: 'Failed to respond to invitation' } };
        }
    }
    async handleMarkNotificationRead(client, data) {
        try {
            await this.notificationsService.markAsRead(data.notificationId);
            return { event: 'notificationMarkedRead', data: { notificationId: data.notificationId } };
        }
        catch (error) {
            this.logger.error(`Error marking notification as read: ${error.message}`);
            return { event: socket_dto_1.SOCKET_EVENTS.ERROR, data: { message: 'Failed to mark notification as read' } };
        }
    }
    async sendToUser(userId, event, data) {
        this.server.to(`user_${userId}`).emit(event, data);
    }
    async sendToUsers(userIds, event, data) {
        userIds.forEach(userId => {
            this.server.to(`user_${userId}`).emit(event, data);
        });
    }
    broadcastToRoom(roomId, event, data) {
        this.server.to(`room_${roomId}`).emit(event, data);
    }
    isUserOnline(userId) {
        return this.userSockets.has(userId);
    }
    getOnlineUsers() {
        return Array.from(this.userSockets.keys());
    }
};
exports.SocketGateway = SocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)(socket_dto_1.SOCKET_EVENTS.JOIN_ROOM),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(socket_dto_1.SOCKET_EVENTS.LEAVE_ROOM),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(socket_dto_1.SOCKET_EVENTS.SEND_MESSAGE),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(socket_dto_1.SOCKET_EVENTS.TYPING_START),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_dto_1.TypingIndicatorDto]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(socket_dto_1.SOCKET_EVENTS.TYPING_STOP),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_dto_1.TypingIndicatorDto]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "handleTypingStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(socket_dto_1.SOCKET_EVENTS.SEND_MATCH_INVITATION),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_dto_1.SendMatchInvitationDto]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleSendMatchInvitation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(socket_dto_1.SOCKET_EVENTS.RESPOND_MATCH_INVITATION),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_dto_1.RespondMatchInvitationDto]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleRespondMatchInvitation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(socket_dto_1.SOCKET_EVENTS.SEND_TEAM_INVITATION),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_dto_1.SendTeamInvitationDto]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleSendTeamInvitation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(socket_dto_1.SOCKET_EVENTS.RESPOND_TEAM_INVITATION),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_dto_1.RespondTeamInvitationDto]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleRespondTeamInvitation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(socket_dto_1.SOCKET_EVENTS.MARK_NOTIFICATION_READ),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleMarkNotificationRead", null);
exports.SocketGateway = SocketGateway = SocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/socket.io',
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        chat_service_1.ChatService,
        notifications_service_1.NotificationsService,
        matches_service_1.MatchesService,
        teams_service_1.TeamsService,
        users_service_1.UsersService])
], SocketGateway);
//# sourceMappingURL=socket.gateway.js.map