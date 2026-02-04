"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LeaderboardWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardWorker = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../modules/rabbitmq/rabbitmq.service");
const redis_service_1 = require("../modules/redis/redis.service");
const queues_1 = require("../common/constants/queues");
let LeaderboardWorker = LeaderboardWorker_1 = class LeaderboardWorker {
    constructor(rabbitmqService, redisService) {
        this.rabbitmqService = rabbitmqService;
        this.redisService = redisService;
        this.logger = new common_1.Logger(LeaderboardWorker_1.name);
    }
    async onModuleInit() {
        await this.startConsuming();
    }
    async startConsuming() {
        await this.rabbitmqService.consume(queues_1.QUEUES.LEADERBOARD_CACHE, async (msg) => {
            await this.processLeaderboardUpdate(msg);
        });
        this.logger.log('Leaderboard worker started consuming from queue');
    }
    async processLeaderboardUpdate(payload) {
        this.logger.log(`Processing leaderboard update: ${JSON.stringify(payload)}`);
        try {
            await this.redisService.updateLeaderboardEntry(payload.userId, payload.score);
            const topPlayers = await this.redisService.getTopLeaderboard(100);
            if (topPlayers) {
                await this.redisService.setLeaderboard(topPlayers);
            }
            this.logger.log(`Leaderboard updated for user: ${payload.userId}`);
        }
        catch (error) {
            this.logger.error(`Error processing leaderboard update: ${error}`);
        }
    }
    async enqueueLeaderboardUpdate(payload) {
        await this.rabbitmqService.publishToQueue(queues_1.QUEUES.LEADERBOARD_CACHE, payload);
    }
    async refreshLeaderboard(sport) {
        this.logger.log(`Refreshing leaderboard for sport: ${sport || 'all'}`);
    }
};
exports.LeaderboardWorker = LeaderboardWorker;
exports.LeaderboardWorker = LeaderboardWorker = LeaderboardWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitmqService,
        redis_service_1.RedisService])
], LeaderboardWorker);
//# sourceMappingURL=leaderboard.worker.js.map