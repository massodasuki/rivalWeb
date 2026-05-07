import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitmqService } from '../modules/rabbitmq/rabbitmq.service';
import { RedisService } from '../modules/redis/redis.service';
import { QUEUES, ROUTING_KEYS } from '../common/constants/queues';

interface MatchResultPayload {
  type: 'match_result';
  matchId: string;
  sport: string;
  results: {
    winnerId: string;
    loserId: string;
    winnerScore: number;
    loserScore: number;
    stats: Record<string, any>;
  };
  participants: {
    userId: string;
    teamId?: string;
    isWinner: boolean;
    score: number;
  }[];
  processedAt: Date;
}

@Injectable()
export class MatchResultsWorker implements OnModuleInit {
  private readonly logger = new Logger(MatchResultsWorker.name);

  constructor(
    private readonly rabbitmqService: RabbitmqService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    await this.startConsuming();
  }

  private async startConsuming() {
    await this.rabbitmqService.consume(QUEUES.MATCH_RESULTS, async (msg) => {
      await this.processMatchResult(msg as MatchResultPayload);
    });

    this.logger.log('Match results worker started consuming from queue');
  }

  private async processMatchResult(payload: MatchResultPayload) {
    this.logger.log(`Processing match result: ${JSON.stringify(payload)}`);

    try {
      // Cache the match results
      await this.redisService.setMatchResults(payload.matchId, payload);

      // Update leaderboard for all participants
      for (const participant of payload.participants) {
        // Winners get their score, losers get partial points
        const points = participant.isWinner 
          ? payload.results.winnerScore 
          : payload.results.loserScore;

        await this.rabbitmqService.publishWithRoutingKey(
          ROUTING_KEYS.LEADERBOARD_UPDATE,
          {
            type: 'leaderboard_update',
            userId: participant.userId,
            teamId: participant.teamId,
            score: points,
            sport: payload.sport,
          },
        );
      }

      // Invalidate relevant caches
      await this.redisService.invalidateUpcomingMatches();

      // TODO: Update user stats in database
      // TODO: Update team stats if applicable
      // TODO: Award achievements
      // TODO: Send notifications to participants

      this.logger.log(`Match result processed for match: ${payload.matchId}`);
    } catch (error) {
      this.logger.error(`Error processing match result: ${error}`);
    }
  }

  async enqueueMatchResult(payload: MatchResultPayload) {
    await this.rabbitmqService.publishToQueue(QUEUES.MATCH_RESULTS, payload);
  }
}
