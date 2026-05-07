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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const match_participant_entity_1 = require("../matches/entities/match-participant.entity");
const match_stat_entity_1 = require("../matches/entities/match-stat.entity");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    constructor(usersRepository, matchParticipantsRepository, matchStatsRepository) {
        this.usersRepository = usersRepository;
        this.matchParticipantsRepository = matchParticipantsRepository;
        this.matchStatsRepository = matchStatsRepository;
    }
    async findAll() {
        return this.usersRepository.find();
    }
    async findOne(id) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({ where: { email } });
    }
    async getStats(id) {
        const participations = await this.matchParticipantsRepository.find({
            where: { user_id: id },
            relations: ['match'],
        });
        const stats = await this.matchStatsRepository.find({
            where: { user_id: id },
        });
        const matches = participations.length;
        const wins = participations.filter(p => p.match?.status === 'completed').length;
        const losses = matches - wins;
        const goals = stats.reduce((sum, s) => sum + (s.goals || 0), 0);
        const assists = stats.reduce((sum, s) => sum + (s.assists || 0), 0);
        const rating = stats.length > 0
            ? stats.reduce((sum, s) => sum + (s.rating || 0), 0) / stats.length
            : 0;
        return {
            matches,
            wins,
            losses,
            goals,
            assists,
            rating: Math.round(rating * 100) / 100,
        };
    }
    async update(id, updateData) {
        await this.findOne(id);
        await this.usersRepository.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id) {
        const result = await this.usersRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
    }
    async updateNotifications(id, data) {
        await this.findOne(id);
        return { status: 'notifications_updated' };
    }
    async updatePrivacy(id, data) {
        await this.findOne(id);
        return { status: 'privacy_updated' };
    }
    async updatePassword(id, data) {
        const user = await this.findOne(id);
        if (!data.current_password || !(await bcrypt.compare(data.current_password, user.password_hash))) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const password_hash = await bcrypt.hash(data.new_password, 10);
        await this.usersRepository.update(id, { password_hash });
        return { status: 'password_updated' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(match_participant_entity_1.MatchParticipant)),
    __param(2, (0, typeorm_1.InjectRepository)(match_stat_entity_1.MatchStat)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map