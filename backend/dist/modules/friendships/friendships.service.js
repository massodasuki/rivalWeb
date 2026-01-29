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
exports.FriendshipsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const friendship_entity_1 = require("./entities/friendship.entity");
let FriendshipsService = class FriendshipsService {
    constructor(friendshipsRepository) {
        this.friendshipsRepository = friendshipsRepository;
    }
    async findAll() {
        return this.friendshipsRepository.find({ relations: ['user', 'friend'] });
    }
    async findByUser(userId) {
        return this.friendshipsRepository.find({
            where: [{ user_id: userId }, { friend_id: userId }],
            relations: ['user', 'friend'],
        });
    }
    async create(userId, friendId) {
        const friendship = this.friendshipsRepository.create({
            user_id: userId,
            friend_id: friendId,
            status: 'pending',
        });
        return this.friendshipsRepository.save(friendship);
    }
    async updateStatus(id, status) {
        await this.friendshipsRepository.update(id, { status });
        const friendship = await this.friendshipsRepository.findOne({ where: { id } });
        if (!friendship) {
            throw new common_1.NotFoundException(`Friendship with ID ${id} not found`);
        }
        return friendship;
    }
    async remove(id) {
        const result = await this.friendshipsRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Friendship with ID ${id} not found`);
        }
    }
};
exports.FriendshipsService = FriendshipsService;
exports.FriendshipsService = FriendshipsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(friendship_entity_1.Friendship)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FriendshipsService);
//# sourceMappingURL=friendships.service.js.map