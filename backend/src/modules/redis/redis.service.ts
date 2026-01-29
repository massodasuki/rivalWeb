import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_KEYS, CACHE_TTL } from '../../common/constants/redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);

  async onModuleInit() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT) || 6379;
    
    this.client = new Redis({
      host,
      port,
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error', error);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient() {
    return this.client;
  }

  // Leaderboard operations
  async setLeaderboard(leaderboard: any[]) {
    const key = REDIS_KEYS.LEADERBOARD;
    await this.client.setex(key, CACHE_TTL.LEADERBOARD, JSON.stringify(leaderboard));
  }

  async getLeaderboard(): Promise<any[] | null> {
    const key = REDIS_KEYS.LEADERBOARD;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async updateLeaderboardEntry(userId: string, score: number) {
    const key = REDIS_KEYS.LEADERBOARD;
    await this.client.zadd(key, score, userId);
    await this.client.expire(key, CACHE_TTL.LEADERBOARD);
  }

  async getTopLeaderboard(limit: number = 10): Promise<any[]> {
    const key = REDIS_KEYS.LEADERBOARD;
    const entries = await this.client.zrevrange(key, 0, limit - 1, 'WITHSCORES');
    const result = [];
    for (let i = 0; i < entries.length; i += 2) {
      result.push({
        userId: entries[i],
        score: parseFloat(entries[i + 1]),
      });
    }
    return result;
  }

  // Upcoming matches caching
  async setUpcomingMatches(matches: any[]) {
    const key = REDIS_KEYS.UPCOMING_MATCHES;
    await this.client.setex(key, CACHE_TTL.UPCOMING_MATCHES, JSON.stringify(matches));
  }

  async getUpcomingMatches(): Promise<any[] | null> {
    const key = REDIS_KEYS.UPCOMING_MATCHES;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // User stats caching
  async setUserStats(userId: string, stats: any) {
    const key = `${REDIS_KEYS.USER_STATS}:${userId}`;
    await this.client.setex(key, CACHE_TTL.USER_STATS, JSON.stringify(stats));
  }

  async getUserStats(userId: string): Promise<any | null> {
    const key = `${REDIS_KEYS.USER_STATS}:${userId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Team stats caching
  async setTeamStats(teamId: string, stats: any) {
    const key = `${REDIS_KEYS.TEAM_STATS}:${teamId}`;
    await this.client.setex(key, CACHE_TTL.TEAM_STATS, JSON.stringify(stats));
  }

  async getTeamStats(teamId: string): Promise<any | null> {
    const key = `${REDIS_KEYS.TEAM_STATS}:${teamId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Match results caching
  async setMatchResults(matchId: string, results: any) {
    const key = `${REDIS_KEYS.MATCH_RESULTS}:${matchId}`;
    await this.client.setex(key, CACHE_TTL.MATCH_RESULTS, JSON.stringify(results));
  }

  async getMatchResults(matchId: string): Promise<any | null> {
    const key = `${REDIS_KEYS.MATCH_RESULTS}:${matchId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Invalidate cache
  async invalidateLeaderboard() {
    await this.client.del(REDIS_KEYS.LEADERBOARD);
  }

  async invalidateUpcomingMatches() {
    await this.client.del(REDIS_KEYS.UPCOMING_MATCHES);
  }

  async invalidateUserStats(userId: string) {
    const key = `${REDIS_KEYS.USER_STATS}:${userId}`;
    await this.client.del(key);
  }

  async invalidateTeamStats(teamId: string) {
    const key = `${REDIS_KEYS.TEAM_STATS}:${teamId}`;
    await this.client.del(key);
  }

  async invalidateMatchResults(matchId: string) {
    const key = `${REDIS_KEYS.MATCH_RESULTS}:${matchId}`;
    await this.client.del(key);
  }
}
