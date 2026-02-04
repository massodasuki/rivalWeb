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
var MatchResultsWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchResultsWorker = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../modules/rabbitmq/rabbitmq.service");
const redis_service_1 = require("../modules/redis/redis.service");
const queues_1 = require("../common/constants/queues");
let MatchResultsWorker = MatchResultsWorker_1 = class MatchResultsWorker {
    constructor(rabbitmqService, redisService) {
        this.rabbitmqService = rabbitmqService;
        this.redisService = redisService;
        this.logger = new common_1.Logger(MatchResultsWorker_1.name);
    }
    async onModuleInit() {
        await this.startConsuming();
    }
    async startConsuming() {
        await this.rabbitmqService.consume(queues_1.QUEUES.MATCH_RESULTS, async (msg) => {
            await this.processMatchResult(msg);
        });
        this.logger.log('Match results worker started consuming from queue');
    }
    async processMatchResult(payload) {
        this.logger.log(`Processing match result: ${JSON.stringify(payload)}`);
        try {
            await this.redisService.setMatchResults(payload.matchId, payload);
            for (const participant of payload.participants) {
                const points = participant.isWinner
                    ? payload.results.winnerScore
                    : payload.results.loserScore;
                await this.rabbitmqService.publishWithRoutingKey(queues_1.ROUTING_KEYS.LEADERBOARD_UPDATE, {
                    type: 'leaderboard_update',
                    userId: participant.userId,
                    teamId: participant.teamId,
                    score: points,
                    sport: payload.sport,
                });
            }
            await this.redisService.invalidateUpcomingMatches();
            this.logger.log(`Match result processed for match: ${payload.matchId}`);
        }
        catch (error) {
            this.logger.error(`Error processing match result: ${error}`);
        }
    }
    async enqueueMatchResult(payload) {
        await this.rabbitmqService.publishToQueue(queues_1.QUEUES.MATCH_RESULTS, payload);
    }
};
exports.MatchResultsWorker = MatchResultsWorker;
exports.MatchResultsWorker = MatchResultsWorker = MatchResultsWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitmqService,
        redis_service_1.RedisService])
], MatchResultsWorker);
//# sourceMappingURL=match-results.worker.js.map