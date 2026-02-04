import { OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from '../modules/rabbitmq/rabbitmq.service';
import { RedisService } from '../modules/redis/redis.service';
interface LeaderboardUpdatePayload {
    type: 'leaderboard_update';
    userId: string;
    teamId?: string;
    score: number;
    sport: string;
}
export declare class LeaderboardWorker implements OnModuleInit {
    private readonly rabbitmqService;
    private readonly redisService;
    private readonly logger;
    constructor(rabbitmqService: RabbitmqService, redisService: RedisService);
    onModuleInit(): Promise<void>;
    private startConsuming;
    private processLeaderboardUpdate;
    enqueueLeaderboardUpdate(payload: LeaderboardUpdatePayload): Promise<void>;
    refreshLeaderboard(sport?: string): Promise<void>;
}
export {};
