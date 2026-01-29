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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const match_entity_1 = require("./entities/match.entity");
const match_participant_entity_1 = require("./entities/match-participant.entity");
const match_stat_entity_1 = require("./entities/match-stat.entity");
let MatchesService = class MatchesService {
    constructor(matchesRepository, participantsRepository, statsRepository) {
        this.matchesRepository = matchesRepository;
        this.participantsRepository = participantsRepository;
        this.statsRepository = statsRepository;
    }
    async findAll() {
        return this.matchesRepository.find({
            relations: ['home_team', 'away_team', 'participants', 'stats'],
        });
    }
    async findOne(id) {
        const match = await this.matchesRepository.findOne({
            where: { id },
            relations: ['home_team', 'away_team', 'participants', 'stats'],
        });
        if (!match) {
            throw new common_1.NotFoundException(`Match with ID ${id} not found`);
        }
        return match;
    }
    async create(data) {
        const match = this.matchesRepository.create(data);
        return this.matchesRepository.save(match);
    }
    async addParticipant(matchId, userId, role = 'player') {
        const participant = this.participantsRepository.create({
            match_id: matchId,
            user_id: userId,
            role,
        });
        return this.participantsRepository.save(participant);
    }
    async updateStats(matchId, userId, stats) {
        let existingStat = await this.statsRepository.findOne({
            where: { match_id: matchId, user_id: userId },
        });
        if (existingStat) {
            Object.assign(existingStat, stats);
        }
        else {
            existingStat = this.statsRepository.create({
                match_id: matchId,
                user_id: userId,
                ...stats,
            });
        }
        return this.statsRepository.save(existingStat);
    }
    async updateStatus(id, status) {
        await this.matchesRepository.update(id, { status });
        return this.findOne(id);
    }
    async remove(id) {
        const result = await this.matchesRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Match with ID ${id} not found`);
        }
    }
};
exports.MatchesService = MatchesService;
exports.MatchesService = MatchesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(match_entity_1.Match)),
    __param(1, (0, typeorm_1.InjectRepository)(match_participant_entity_1.MatchParticipant)),
    __param(2, (0, typeorm_1.InjectRepository)(match_stat_entity_1.MatchStat)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MatchesService);
//# sourceMappingURL=matches.service.js.map