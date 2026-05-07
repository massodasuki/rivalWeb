import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SendMessageDto, SendMatchInvitationDto, RespondMatchInvitationDto, SendTeamInvitationDto, RespondTeamInvitationDto, TypingIndicatorDto } from './dto/socket.dto';
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
export declare class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly configService;
    private readonly chatService;
    private readonly notificationsService;
    private readonly matchesService;
    private readonly teamsService;
    private readonly usersService;
    private readonly logger;
    private userSockets;
    server: Server;
    constructor(jwtService: JwtService, configService: ConfigService, chatService: ChatService, notificationsService: NotificationsService, matchesService: MatchesService, teamsService: TeamsService, usersService: UsersService);
    afterInit(server: Server): void;
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): Promise<void>;
    handleJoinRoom(client: AuthenticatedSocket, data: {
        roomId: number;
    }): {
        event: string;
        data: {
            roomId: number;
        };
    };
    handleLeaveRoom(client: AuthenticatedSocket, data: {
        roomId: number;
    }): {
        event: string;
        data: {
            roomId: number;
        };
    };
    handleSendMessage(client: AuthenticatedSocket, data: SendMessageDto): Promise<{
        event: string;
        data: {
            id: number;
            roomId: number;
            senderId: number;
            senderName: string;
            content: string;
            messageType: "file" | "text" | "image" | "system";
            createdAt: Date;
        };
    } | {
        event: "error";
        data: {
            message: string;
        };
    }>;
    handleTypingStart(client: AuthenticatedSocket, data: TypingIndicatorDto): void;
    handleTypingStop(client: AuthenticatedSocket, data: TypingIndicatorDto): void;
    handleSendMatchInvitation(client: AuthenticatedSocket, data: SendMatchInvitationDto): Promise<{
        event: string;
        data: {
            id: number;
            inviterId: number;
            inviterName: string;
            inviteeId: number;
            inviteeName: string;
            sportType: string;
            matchType: "casual" | "ranked" | "tournament";
            status: string;
            scheduledAt: Date;
            venue: string;
            notes: string;
            createdAt: Date;
        };
    } | {
        event: "error";
        data: {
            message: string;
        };
    }>;
    handleRespondMatchInvitation(client: AuthenticatedSocket, data: RespondMatchInvitationDto): Promise<{
        event: string;
        data: {
            success: boolean;
            message?: undefined;
        };
    } | {
        event: "error";
        data: {
            message: string;
            success?: undefined;
        };
    }>;
    handleSendTeamInvitation(client: AuthenticatedSocket, data: SendTeamInvitationDto): Promise<{
        event: string;
        data: {
            id: number;
            inviterId: number;
            inviterName: string;
            teamId: number;
            teamName: string;
            role: "member" | "captain" | "vice_captain";
            status: string;
            message: string;
            createdAt: Date;
        };
    } | {
        event: "error";
        data: {
            message: string;
        };
    }>;
    handleRespondTeamInvitation(client: AuthenticatedSocket, data: RespondTeamInvitationDto): Promise<{
        event: string;
        data: {
            success: boolean;
            message?: undefined;
        };
    } | {
        event: "error";
        data: {
            message: string;
            success?: undefined;
        };
    }>;
    handleMarkNotificationRead(client: AuthenticatedSocket, data: {
        notificationId: number;
    }): Promise<{
        event: string;
        data: {
            notificationId: number;
            message?: undefined;
        };
    } | {
        event: "error";
        data: {
            message: string;
            notificationId?: undefined;
        };
    }>;
    sendToUser(userId: number, event: string, data: any): Promise<void>;
    sendToUsers(userIds: number[], event: string, data: any): Promise<void>;
    broadcastToRoom(roomId: number, event: string, data: any): void;
    isUserOnline(userId: number): boolean;
    getOnlineUsers(): number[];
}
export {};
