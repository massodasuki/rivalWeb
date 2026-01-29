import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatMessage } from './entities/chat-message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private roomsRepository: Repository<ChatRoom>,
    @InjectRepository(ChatMessage)
    private messagesRepository: Repository<ChatMessage>,
  ) {}

  async findAllRooms(): Promise<ChatRoom[]> {
    return this.roomsRepository.find({ relations: ['messages'] });
  }

  async findRoom(id: number): Promise<ChatRoom> {
    const room = await this.roomsRepository.findOne({ where: { id }, relations: ['messages'] });
    if (!room) {
      throw new NotFoundException(`Chat room with ID ${id} not found`);
    }
    return room;
  }

  async createRoom(data: Partial<ChatRoom>): Promise<ChatRoom> {
    const room = this.roomsRepository.create(data);
    return this.roomsRepository.save(room);
  }

  async getMessages(roomId: number): Promise<ChatMessage[]> {
    return this.messagesRepository.find({
      where: { room_id: roomId },
      relations: ['sender'],
      order: { created_at: 'ASC' },
    });
  }

  async saveMessage(data: Partial<ChatMessage>): Promise<ChatMessage> {
    const message = this.messagesRepository.create(data);
    return this.messagesRepository.save(message);
  }

  async removeRoom(id: number): Promise<void> {
    const result = await this.roomsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Chat room with ID ${id} not found`);
    }
  }
}