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
    updateLeaderboardEntry(userId: string, score: number): Promise<void>;
    getTopLeaderboard(limit?: number): Promise<any[]>;
    setUpcomingMatches(matches: any[]): Promise<void>;
    getUpcomingMatches(): Promise<any[] | null>;
    setUserStats(userId: string, stats: any): Promise<void>;
    getUserStats(userId: string): Promise<any | null>;
    setTeamStats(teamId: string, stats: any): Promise<void>;
    getTeamStats(teamId: string): Promise<any | null>;
    setMatchResults(matchId: string, results: any): Promise<void>;
    getMatchResults(matchId: string): Promise<any | null>;
    invalidateLeaderboard(): Promise<void>;
    invalidateUpcomingMatches(): Promise<void>;
    invalidateUserStats(userId: string): Promise<void>;
    invalidateTeamStats(teamId: string): Promise<void>;
    invalidateMatchResults(matchId: string): Promise<void>;
}
