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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_room_entity_1 = require("./entities/chat-room.entity");
const chat_message_entity_1 = require("./entities/chat-message.entity");
let ChatService = class ChatService {
    constructor(roomsRepository, messagesRepository) {
        this.roomsRepository = roomsRepository;
        this.messagesRepository = messagesRepository;
    }
    async findAllRooms() {
        return this.roomsRepository.find({ relations: ['messages'] });
    }
    async findRoom(id) {
        const room = await this.roomsRepository.findOne({ where: { id }, relations: ['messages'] });
        if (!room) {
            throw new common_1.NotFoundException(`Chat room with ID ${id} not found`);
        }
        return room;
    }
    async createRoom(data) {
        const room = this.roomsRepository.create(data);
        return this.roomsRepository.save(room);
    }
    async getMessages(roomId) {
        return this.messagesRepository.find({
            where: { room_id: roomId },
            relations: ['sender'],
            order: { created_at: 'ASC' },
        });
    }
    async saveMessage(data) {
        const message = this.messagesRepository.create(data);
        return this.messagesRepository.save(message);
    }
    async removeRoom(id) {
        const result = await this.roomsRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Chat room with ID ${id} not found`);
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_room_entity_1.ChatRoom)),
    __param(1, (0, typeorm_1.InjectRepository)(chat_message_entity_1.ChatMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ChatService);
//# sourceMappingURL=chat.service.js.map