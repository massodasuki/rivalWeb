import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private client;
    private readonly logger;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getClient(): Redis;
    setLeaderboard(leaderboard: any[]): Promise<void>;
    getLeaderboard(): Promise<any[] | null>;
    invalidateLeaderboard(): Promise<void>;
    updateLeaderboardEntry(userId: string, score: number): Promise<void>;
    getTopLeaderboard(limit?: number): Promise<{
        userId: string;
        score: number;
    }[]>;
    setUpcomingMatches(matches: any[]): Promise<void>;
    getUpcomingMatches(): Promise<any[] | null>;
    invalidateUpcomingMatches(): Promise<void>;
    setUserStats(userId: string, stats: any): Promise<void>;
    getUserStats(userId: string): Promise<any | null>;
    invalidateUserStats(userId: string): Promise<void>;
    setTeamStats(teamId: string, stats: any): Promise<void>;
    getTeamStats(teamId: string): Promise<any | null>;
    invalidateTeamStats(teamId: string): Promise<void>;
    setMatchResults(matchId: string, results: any): Promise<void>;
    getMatchResults(matchId: string): Promise<any | null>;
    invalidateMatchResults(matchId: string): Promise<void>;
}
