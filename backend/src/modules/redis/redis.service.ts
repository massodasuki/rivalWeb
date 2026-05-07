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

  // ==================== Leaderboard (JSON cache) ====================

  /** Store a full leaderboard snapshot as a JSON string. */
  async setLeaderboard(leaderboard: any[]) {
    await this.client.setex(
      REDIS_KEYS.LEADERBOARD_CACHE,
      CACHE_TTL.LEADERBOARD,
      JSON.stringify(leaderboard),
    );
  }

  /** Retrieve the cached leaderboard snapshot. */
  async getLeaderboard(): Promise<any[] | null> {
    const data = await this.client.get(REDIS_KEYS.LEADERBOARD_CACHE);
    return data ? JSON.parse(data) : null;
  }

  /** Invalidate the leaderboard JSON cache. */
  async invalidateLeaderboard() {
    await this.client.del(REDIS_KEYS.LEADERBOARD_CACHE);
  }

  // ==================== Leaderboard (sorted set) ====================

  /** Update a single user's score in the leaderboard sorted set. */
  async updateLeaderboardEntry(userId: string, score: number) {
    await this.client.zadd(REDIS_KEYS.LEADERBOARD_SCORES, score, userId);
    await this.client.expire(REDIS_KEYS.LEADERBOARD_SCORES, CACHE_TTL.LEADERBOARD);
  }

  /** Get the top N entries from the leaderboard sorted set. */
  async getTopLeaderboard(limit: number = 10): Promise<{ userId: string; score: number }[]> {
    const entries = await this.client.zrevrange(
      REDIS_KEYS.LEADERBOARD_SCORES,
      0,
      limit - 1,
      'WITHSCORES',
    );
    const result: { userId: string; score: number }[] = [];
    for (let i = 0; i < entries.length; i += 2) {
      result.push({ userId: entries[i], score: parseFloat(entries[i + 1]) });
    }
    return result;
  }

  // ==================== Upcoming matches ====================

  async setUpcomingMatches(matches: any[]) {
    await this.client.setex(
      REDIS_KEYS.UPCOMING_MATCHES,
      CACHE_TTL.UPCOMING_MATCHES,
      JSON.stringify(matches),
    );
  }

  async getUpcomingMatches(): Promise<any[] | null> {
    const data = await this.client.get(REDIS_KEYS.UPCOMING_MATCHES);
    return data ? JSON.parse(data) : null;
  }

  async invalidateUpcomingMatches() {
    await this.client.del(REDIS_KEYS.UPCOMING_MATCHES);
  }

  // ==================== User stats ====================

  async setUserStats(userId: string, stats: any) {
    const key = `${REDIS_KEYS.USER_STATS}:${userId}`;
    await this.client.setex(key, CACHE_TTL.USER_STATS, JSON.stringify(stats));
  }

  async getUserStats(userId: string): Promise<any | null> {
    const key = `${REDIS_KEYS.USER_STATS}:${userId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async invalidateUserStats(userId: string) {
    await this.client.del(`${REDIS_KEYS.USER_STATS}:${userId}`);
  }

  // ==================== Team stats ====================

  async setTeamStats(teamId: string, stats: any) {
    const key = `${REDIS_KEYS.TEAM_STATS}:${teamId}`;
    await this.client.setex(key, CACHE_TTL.TEAM_STATS, JSON.stringify(stats));
  }

  async getTeamStats(teamId: string): Promise<any | null> {
    const key = `${REDIS_KEYS.TEAM_STATS}:${teamId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async invalidateTeamStats(teamId: string) {
    await this.client.del(`${REDIS_KEYS.TEAM_STATS}:${teamId}`);
  }

  // ==================== Match results ====================

  async setMatchResults(matchId: string, results: any) {
    const key = `${REDIS_KEYS.MATCH_RESULTS}:${matchId}`;
    await this.client.setex(key, CACHE_TTL.MATCH_RESULTS, JSON.stringify(results));
  }

  async getMatchResults(matchId: string): Promise<any | null> {
    const key = `${REDIS_KEYS.MATCH_RESULTS}:${matchId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async invalidateMatchResults(matchId: string) {
    await this.client.del(`${REDIS_KEYS.MATCH_RESULTS}:${matchId}`);
  }
}
