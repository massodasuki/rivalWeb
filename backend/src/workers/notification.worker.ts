import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitmqService } from '../modules/rabbitmq/rabbitmq.service';
import { QUEUES } from '../common/constants/queues';

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

@Injectable()
export class NotificationWorker implements OnModuleInit {
  private readonly logger = new Logger(NotificationWorker.name);

  constructor(private readonly rabbitmqService: RabbitmqService) {}

  async onModuleInit() {
    await this.startConsuming();
  }

  private async startConsuming() {
    // Consume team invites
    await this.rabbitmqService.consume(QUEUES.TEAM_INVITES, async (msg) => {
      await this.processTeamInvite(msg as TeamInvitePayload);
    });

    // Consume match invites
    await this.rabbitmqService.consume(QUEUES.MATCH_INVITES, async (msg) => {
      await this.processMatchInvite(msg as MatchInvitePayload);
    });

    this.logger.log('Notification worker started consuming from queues');
  }

  private async processTeamInvite(payload: TeamInvitePayload) {
    this.logger.log(`Processing team invite: ${JSON.stringify(payload)}`);
    
    // In production, integrate with email service (e.g., SendGrid, AWS SES)
    // For now, log the notification
    console.log(`[EMAIL] To: ${payload.inviteeEmail}`);
    console.log(`[EMAIL] Subject: Team Invitation from ${payload.inviterName}`);
    console.log(`[EMAIL] Body: You have been invited to join ${payload.teamName} by ${payload.inviterName}`);
    
    // TODO: Store notification in database
    // TODO: Send real-time notification via WebSocket
    
    this.logger.log(`Team invite processed for user: ${payload.inviteeId}`);
  }

  private async processMatchInvite(payload: MatchInvitePayload) {
    this.logger.log(`Processing match invite: ${JSON.stringify(payload)}`);
    
    // In production, integrate with email service
    console.log(`[EMAIL] To: ${payload.inviteeEmail}`);
    console.log(`[EMAIL] Subject: Match Invitation from ${payload.inviterName}`);
    console.log(`[EMAIL] Body: You've been invited to a ${payload.matchDetails.sport} match by ${payload.inviterName}`);
    
    // TODO: Store notification in database
    // TODO: Send real-time notification via WebSocket
    
    this.logger.log(`Match invite processed for user: ${payload.inviteeId}`);
  }

  // Helper methods for enqueueing notifications
  async enqueueTeamInvite(payload: TeamInvitePayload) {
    await this.rabbitmqService.publishToQueue(QUEUES.TEAM_INVITES, payload);
  }

  async enqueueMatchInvite(payload: MatchInvitePayload) {
    await this.rabbitmqService.publishToQueue(QUEUES.MATCH_INVITES, payload);
  }
}
