import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { 
  SOCKET_EVENTS,
  SendMessageDto,
  SendMatchInvitationDto,
  RespondMatchInvitationDto,
  SendTeamInvitationDto,
  RespondTeamInvitationDto,
  TypingIndicatorDto,
} from './dto/socket.dto';
import { ChatService } from '../chat/chat.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MatchesService } from '../matches/matches.service';
import { TeamsService } from '../teams/teams.service';
import { UsersService } from '../users/users.service';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

@WebSocketGateway({
  namespace: '/socket.io',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SocketGateway.name);
  private userSockets: Map<number, Set<string>> = new Map();

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
    private readonly notificationsService: NotificationsService,
    private readonly matchesService: MatchesService,
    private readonly teamsService: TeamsService,
    private readonly usersService: UsersService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        this.logger.warn(`Client ${client.id} attempted to connect without token`);
        client.emit(SOCKET_EVENTS.AUTH_ERROR, { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub);
      
      if (!user) {
        client.emit(SOCKET_EVENTS.AUTH_ERROR, { message: 'User not found' });
        client.disconnect();
        return;
      }

      client.userId = user.id;
      client.user = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      // Track user's sockets
      if (!this.userSockets.has(user.id)) {
        this.userSockets.set(user.id, new Set());
      }
      this.userSockets.get(user.id)!.add(client.id);

      // Join user's personal room for targeted notifications
      client.join(`user_${user.id}`);

      // Broadcast online status
      client.broadcast.emit(SOCKET_EVENTS.USER_ONLINE, { userId: user.id });

      this.logger.log(`Client ${client.id} connected as user ${user.id}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.emit(SOCKET_EVENTS.AUTH_ERROR, { message: 'Invalid token' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // Remove from tracking
      const userSockets = this.userSockets.get(client.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.userSockets.delete(client.userId);
          // Broadcast offline status
          client.broadcast.emit(SOCKET_EVENTS.USER_OFFLINE, { userId: client.userId });
        }
      }
      this.logger.log(`Client ${client.id} disconnected for user ${client.userId}`);
    } else {
      this.logger.log(`Client ${client.id} disconnected`);
    }
  }

  // ==================== Chat Events ====================

  @SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: number },
  ) {
    const { roomId } = data;
    client.join(`room_${roomId}`);
    this.logger.log(`User ${client.userId} joined room ${roomId}`);
    return { event: 'joinedRoom', data: { roomId } };
  }

  @SubscribeMessage(SOCKET_EVENTS.LEAVE_ROOM)
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: number },
  ) {
    const { roomId } = data;
    client.leave(`room_${roomId}`);
    this.logger.log(`User ${client.userId} left room ${roomId}`);
    return { event: 'leftRoom', data: { roomId } };
  }

  @SubscribeMessage(SOCKET_EVENTS.SEND_MESSAGE)
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendMessageDto,
  ) {
    try {
      const message = await this.chatService.saveMessage({
        room_id: data.roomId,
        sender_id: client.userId,
        message: data.content,
      });

      // Get sender info
      const sender = await this.usersService.findOne(client.userId!);
      
      const messagePayload = {
        id: message.id,
        roomId: data.roomId,
        senderId: client.userId,
        senderName: sender?.name || 'Unknown',
        content: data.content,
        messageType: data.messageType || 'text',
        createdAt: message.created_at,
      };

      // Emit to room
      this.server.to(`room_${data.roomId}`).emit(SOCKET_EVENTS.NEW_MESSAGE, messagePayload);

      return { event: 'messageSent', data: messagePayload };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      return { event: SOCKET_EVENTS.ERROR, data: { message: 'Failed to send message' } };
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.TYPING_START)
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: TypingIndicatorDto,
  ) {
    client.to(`room_${data.roomId}`).emit('chat:userTyping', {
      roomId: data.roomId,
      userId: client.userId,
      username: client.user?.name,
      isTyping: true,
    });
  }

  @SubscribeMessage(SOCKET_EVENTS.TYPING_STOP)
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: TypingIndicatorDto,
  ) {
    client.to(`room_${data.roomId}`).emit('chat:userTyping', {
      roomId: data.roomId,
      userId: client.userId,
      username: client.user?.name,
      isTyping: false,
    });
  }

  // ==================== Match Invitation Events ====================

  @SubscribeMessage(SOCKET_EVENTS.SEND_MATCH_INVITATION)
  async handleSendMatchInvitation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendMatchInvitationDto,
  ) {
    try {
      // Create a match invitation record
      const inviter = await this.usersService.findOne(client.userId!);
      const invitee = await this.usersService.findOne(data.opponentId);
      
      const invitationPayload = {
        id: Date.now(), // Generate temporary ID
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

      // Send to invitee
      this.server.to(`user_${data.opponentId}`).emit(
        SOCKET_EVENTS.MATCH_INVITATION_RECEIVED,
        { invitation: invitationPayload },
      );

      // Create notification
      await this.notificationsService.create({
        user_id: data.opponentId,
        type: 'match_invitation',
        message: `${inviter?.name} has invited you to a ${data.matchType} ${data.sportType} match`,
      });

      return { event: 'invitationSent', data: invitationPayload };
    } catch (error) {
      this.logger.error(`Error sending match invitation: ${error.message}`);
      return { event: SOCKET_EVENTS.ERROR, data: { message: 'Failed to send invitation' } };
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.RESPOND_MATCH_INVITATION)
  async handleRespondMatchInvitation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: RespondMatchInvitationDto,
  ) {
    try {
      // Notify inviter about the response
      const responder = await this.usersService.findOne(client.userId!);
      
      this.server.emit(SOCKET_EVENTS.MATCH_INVITATION_UPDATED, {
        invitationId: data.invitationId,
        responderId: client.userId,
        responderName: responder?.name,
        response: data.response,
        status: data.response === 'accept' ? 'accepted' : 'declined',
      });

      return { event: 'invitationResponded', data: { success: true } };
    } catch (error) {
      this.logger.error(`Error responding to match invitation: ${error.message}`);
      return { event: SOCKET_EVENTS.ERROR, data: { message: 'Failed to respond to invitation' } };
    }
  }

  // ==================== Team Invitation Events ====================

  @SubscribeMessage(SOCKET_EVENTS.SEND_TEAM_INVITATION)
  async handleSendTeamInvitation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendTeamInvitationDto,
  ) {
    try {
      const inviter = await this.usersService.findOne(client.userId!);
      const team = await this.teamsService.findOne(data.teamId);

      const invitationPayload = {
        id: Date.now(), // Generate temporary ID
        inviterId: client.userId,
        inviterName: inviter?.name || 'Unknown',
        teamId: data.teamId,
        teamName: team?.name || 'Unknown Team',
        role: data.role,
        status: 'pending',
        message: data.message,
        createdAt: new Date(),
      };

      // Send to invitee
      this.server.to(`user_${data.userId}`).emit(
        SOCKET_EVENTS.TEAM_INVITATION_RECEIVED,
        { invitation: invitationPayload },
      );

      // Create notification
      await this.notificationsService.create({
        user_id: data.userId,
        type: 'team_invitation',
        message: `${inviter?.name} has invited you to join ${team?.name}`,
      });

      return { event: 'teamInvitationSent', data: invitationPayload };
    } catch (error) {
      this.logger.error(`Error sending team invitation: ${error.message}`);
      return { event: SOCKET_EVENTS.ERROR, data: { message: 'Failed to send invitation' } };
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.RESPOND_TEAM_INVITATION)
  async handleRespondTeamInvitation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: RespondTeamInvitationDto,
  ) {
    try {
      const responder = await this.usersService.findOne(client.userId!);
      
      this.server.emit(SOCKET_EVENTS.TEAM_INVITATION_UPDATED, {
        invitationId: data.invitationId,
        responderId: client.userId,
        responderName: responder?.name,
        response: data.response,
        status: data.response === 'accept' ? 'accepted' : 'declined',
      });

      return { event: 'teamInvitationResponded', data: { success: true } };
    } catch (error) {
      this.logger.error(`Error responding to team invitation: ${error.message}`);
      return { event: SOCKET_EVENTS.ERROR, data: { message: 'Failed to respond to invitation' } };
    }
  }

  // ==================== Notification Events ====================

  @SubscribeMessage(SOCKET_EVENTS.MARK_NOTIFICATION_READ)
  async handleMarkNotificationRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: number },
  ) {
    try {
      await this.notificationsService.markAsRead(data.notificationId);
      return { event: 'notificationMarkedRead', data: { notificationId: data.notificationId } };
    } catch (error) {
      this.logger.error(`Error marking notification as read: ${error.message}`);
      return { event: SOCKET_EVENTS.ERROR, data: { message: 'Failed to mark notification as read' } };
    }
  }

  // ==================== Utility Methods ====================

  // Send notification to specific user
  async sendToUser(userId: number, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
  }

  // Send notification to multiple users
  async sendToUsers(userIds: number[], event: string, data: any) {
    userIds.forEach(userId => {
      this.server.to(`user_${userId}`).emit(event, data);
    });
  }

  // Broadcast to room
  broadcastToRoom(roomId: number, event: string, data: any) {
    this.server.to(`room_${roomId}`).emit(event, data);
  }

  // Get online status for user
  isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId);
  }

  // Get all online user IDs
  getOnlineUsers(): number[] {
    return Array.from(this.userSockets.keys());
  }
}
