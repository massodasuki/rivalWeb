import { OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from '../modules/rabbitmq/rabbitmq.service';
interface TeamInvitePayload {
    type: 'team_invite';
    teamId: string;
    teamName: string;
    inviterId: string;
    inviterName: string;
    inviteeId: string;
    inviteeEmail: string;
}
interface MatchInvitePayload {
    type: 'match_invite';
    matchId: string;
    inviterId: string;
    inviterName: string;
    inviteeId: string;
    inviteeEmail: string;
    matchDetails: {
        sport: string;
        scheduledAt: Date;
        location: string;
    };
}
export declare class NotificationWorker implements OnModuleInit {
    private readonly rabbitmqService;
    private readonly logger;
    constructor(rabbitmqService: RabbitmqService);
    onModuleInit(): Promise<void>;
    private startConsuming;
    private processTeamInvite;
    private processMatchInvite;
    enqueueTeamInvite(payload: TeamInvitePayload): Promise<void>;
    enqueueMatchInvite(payload: MatchInvitePayload): Promise<void>;
}
export {};
