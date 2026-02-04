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
var NotificationWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationWorker = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../modules/rabbitmq/rabbitmq.service");
const queues_1 = require("../common/constants/queues");
let NotificationWorker = NotificationWorker_1 = class NotificationWorker {
    constructor(rabbitmqService) {
        this.rabbitmqService = rabbitmqService;
        this.logger = new common_1.Logger(NotificationWorker_1.name);
    }
    async onModuleInit() {
        await this.startConsuming();
    }
    async startConsuming() {
        await this.rabbitmqService.consume(queues_1.QUEUES.TEAM_INVITES, async (msg) => {
            await this.processTeamInvite(msg);
        });
        await this.rabbitmqService.consume(queues_1.QUEUES.MATCH_INVITES, async (msg) => {
            await this.processMatchInvite(msg);
        });
        this.logger.log('Notification worker started consuming from queues');
    }
    async processTeamInvite(payload) {
        this.logger.log(`Processing team invite: ${JSON.stringify(payload)}`);
        console.log(`[EMAIL] To: ${payload.inviteeEmail}`);
        console.log(`[EMAIL] Subject: Team Invitation from ${payload.inviterName}`);
        console.log(`[EMAIL] Body: You have been invited to join ${payload.teamName} by ${payload.inviterName}`);
        this.logger.log(`Team invite processed for user: ${payload.inviteeId}`);
    }
    async processMatchInvite(payload) {
        this.logger.log(`Processing match invite: ${JSON.stringify(payload)}`);
        console.log(`[EMAIL] To: ${payload.inviteeEmail}`);
        console.log(`[EMAIL] Subject: Match Invitation from ${payload.inviterName}`);
        console.log(`[EMAIL] Body: You've been invited to a ${payload.matchDetails.sport} match by ${payload.inviterName}`);
        this.logger.log(`Match invite processed for user: ${payload.inviteeId}`);
    }
    async enqueueTeamInvite(payload) {
        await this.rabbitmqService.publishToQueue(queues_1.QUEUES.TEAM_INVITES, payload);
    }
    async enqueueMatchInvite(payload) {
        await this.rabbitmqService.publishToQueue(queues_1.QUEUES.MATCH_INVITES, payload);
    }
};
exports.NotificationWorker = NotificationWorker;
exports.NotificationWorker = NotificationWorker = NotificationWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitmqService])
], NotificationWorker);
//# sourceMappingURL=notification.worker.js.map