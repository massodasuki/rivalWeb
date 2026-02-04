"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const redis_1 = require("../../common/constants/redis");
let RedisService = RedisService_1 = class RedisService {
    constructor() {
        this.logger = new common_1.Logger(RedisService_1.name);
    }
    async onModuleInit() {
        const host = process.env.REDIS_HOST || 'localhost';
        const port = parseInt(process.env.REDIS_PORT) || 6379;
        this.client = new ioredis_1.default({
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
    async setLeaderboard(leaderboard) {
        const key = redis_1.REDIS_KEYS.LEADERBOARD;
        await this.client.setex(key, redis_1.CACHE_TTL.LEADERBOARD, JSON.stringify(leaderboard));
    }
    async getLeaderboard() {
        const key = redis_1.REDIS_KEYS.LEADERBOARD;
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }
    async updateLeaderboardEntry(userId, score) {
        const key = redis_1.REDIS_KEYS.LEADERBOARD;
        await this.client.zadd(key, score, userId);
        await this.client.expire(key, redis_1.CACHE_TTL.LEADERBOARD);
    }
    async getTopLeaderboard(limit = 10) {
        const key = redis_1.REDIS_KEYS.LEADERBOARD;
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
    async setUpcomingMatches(matches) {
        const key = redis_1.REDIS_KEYS.UPCOMING_MATCHES;
        await this.client.setex(key, redis_1.CACHE_TTL.UPCOMING_MATCHES, JSON.stringify(matches));
    }
    async getUpcomingMatches() {
        const key = redis_1.REDIS_KEYS.UPCOMING_MATCHES;
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }
    async setUserStats(userId, stats) {
        const key = `${redis_1.REDIS_KEYS.USER_STATS}:${userId}`;
        await this.client.setex(key, redis_1.CACHE_TTL.USER_STATS, JSON.stringify(stats));
    }
    async getUserStats(userId) {
        const key = `${redis_1.REDIS_KEYS.USER_STATS}:${userId}`;
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }
    async setTeamStats(teamId, stats) {
        const key = `${redis_1.REDIS_KEYS.TEAM_STATS}:${teamId}`;
        await this.client.setex(key, redis_1.CACHE_TTL.TEAM_STATS, JSON.stringify(stats));
    }
    async getTeamStats(teamId) {
        const key = `${redis_1.REDIS_KEYS.TEAM_STATS}:${teamId}`;
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }
    async setMatchResults(matchId, results) {
        const key = `${redis_1.REDIS_KEYS.MATCH_RESULTS}:${matchId}`;
        await this.client.setex(key, redis_1.CACHE_TTL.MATCH_RESULTS, JSON.stringify(results));
    }
    async getMatchResults(matchId) {
        const key = `${redis_1.REDIS_KEYS.MATCH_RESULTS}:${matchId}`;
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }
    async invalidateLeaderboard() {
        await this.client.del(redis_1.REDIS_KEYS.LEADERBOARD);
    }
    async invalidateUpcomingMatches() {
        await this.client.del(redis_1.REDIS_KEYS.UPCOMING_MATCHES);
    }
    async invalidateUserStats(userId) {
        const key = `${redis_1.REDIS_KEYS.USER_STATS}:${userId}`;
        await this.client.del(key);
    }
    async invalidateTeamStats(teamId) {
        const key = `${redis_1.REDIS_KEYS.TEAM_STATS}:${teamId}`;
        await this.client.del(key);
    }
    async invalidateMatchResults(matchId) {
        const key = `${redis_1.REDIS_KEYS.MATCH_RESULTS}:${matchId}`;
        await this.client.del(key);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map