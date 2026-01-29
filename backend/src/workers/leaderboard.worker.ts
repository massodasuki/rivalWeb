import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitmqService } from '../modules/rabbitmq/rabbitmq.service';
import { RedisService } from '../modules/redis/redis.service';
import { QUEUES, ROUTING_KEYS } from '../common/constants/queues';

interface LeaderboardUpdatePayload {
  type: 'leaderboard_update';
  userId: string;
  teamId?: string;
  score: number;
  sport: string;
}

@Injectable()
export class LeaderboardWorker implements OnModuleInit {
  private readonly logger = new Logger(LeaderboardWorker.name);

  constructor(
    private readonly rabbitmqService: RabbitmqService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    await this.startConsuming();
  }

  private async startConsuming() {
    await this.rabbitmqService.consume(QUEUES.LEADERBOARD_CACHE, async (msg) => {
      await this.processLeaderboardUpdate(msg as LeaderboardUpdatePayload);
    });

    this.logger.log('Leaderboard worker started consuming from queue');
  }

  private async processLeaderboardUpdate(payload: LeaderboardUpdatePayload) {
    this.logger.log(`Processing leaderboard update: ${JSON.stringify(payload)}`);

    try {
      // Update the leaderboard in Redis
      await this.redisService.updateLeaderboardEntry(payload.userId, payload.score);

      // Get the updated leaderboard
      const topPlayers = await this.redisService.getTopLeaderboard(100);

      // Store the updated leaderboard
      if (topPlayers) {
        await this.redisService.setLeaderboard(topPlayers);
      }

      this.logger.log(`Leaderboard updated for user: ${payload.userId}`);
    } catch (error) {
      this.logger.error(`Error processing leaderboard update: ${error}`);
    }
  }

  async enqueueLeaderboardUpdate(payload: LeaderboardUpdatePayload) {
    await this.rabbitmqService.publishWithRoutingKey(
      ROUTING_KEYS.LEADERBOARD_UPDATE,
      payload,
    );
  }

  async refreshLeaderboard(sport?: string) {
    // This method can be called to force a full leaderboard refresh
    // In production, this would query the database and rebuild the leaderboard
    this.logger.log(`Refreshing leaderboard for sport: ${sport || 'all'}`);
    
    // TODO: Query database for all users and their scores
    // TODO: Rebuild leaderboard and store in Redis
  }
}
