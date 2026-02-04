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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MatchesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchesController = void 0;
const common_1 = require("@nestjs/common");
const matches_service_1 = require("./matches.service");
let MatchesController = MatchesController_1 = class MatchesController {
    constructor(matchesService) {
        this.matchesService = matchesService;
        this.logger = new common_1.Logger(MatchesController_1.name);
    }
    async findAll() {
        this.logger.log('GET /matches - Fetching all matches');
        return this.matchesService.findAll();
    }
    async findOne(id) {
        this.logger.log(`GET /matches/${id} - Fetching match`);
        return this.matchesService.findOne(id);
    }
    async create(data) {
        this.logger.log(`POST /matches - Creating match with data:`, data);
        try {
            const matchData = {
                home_team_id: data.home_team_id,
                away_team_id: data.away_team_id,
                home_team_name: data.home_team,
                away_team_name: data.away_team,
                sport: data.sport,
                scheduled_at: new Date(data.scheduled_at),
                location: data.location,
                max_players: data.max_players || 10,
                description: data.description,
            };
            this.logger.log(`Converted match data:`, matchData);
            const result = await this.matchesService.create(matchData);
            this.logger.log(`Match created successfully:`, result);
            return result;
        }
        catch (error) {
            this.logger.error(`Error creating match:`, error);
            throw error;
        }
    }
    async addParticipant(id, body) {
        this.logger.log(`POST /matches/${id}/participants - Adding participant:`, body);
        return this.matchesService.addParticipant(id, body.user_id, body.role);
    }
    async updateStats(id, body) {
        return this.matchesService.updateStats(id, body.user_id, body);
    }
    async updateStatus(id, body) {
        return this.matchesService.updateStatus(id, body.status);
    }
    async remove(id) {
        return this.matchesService.remove(id);
    }
};
exports.MatchesController = MatchesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/participants'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "addParticipant", null);
__decorate([
    (0, common_1.Post)(':id/stats'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "updateStats", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "remove", null);
exports.MatchesController = MatchesController = MatchesController_1 = __decorate([
    (0, common_1.Controller)('matches'),
    __metadata("design:paramtypes", [matches_service_1.MatchesService])
], MatchesController);
//# sourceMappingURL=matches.controller.js.map