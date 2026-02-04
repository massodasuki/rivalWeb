import { OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from '../modules/rabbitmq/rabbitmq.service';
import { RedisService } from '../modules/redis/redis.service';
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
export declare class MatchResultsWorker implements OnModuleInit {
    private readonly rabbitmqService;
    private readonly redisService;
    private readonly logger;
    constructor(rabbitmqService: RabbitmqService, redisService: RedisService);
    onModuleInit(): Promise<void>;
    private startConsuming;
    private processMatchResult;
    enqueueMatchResult(payload: MatchResultPayload): Promise<void>;
}
export {};
