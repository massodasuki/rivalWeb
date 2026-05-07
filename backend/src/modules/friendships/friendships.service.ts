import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from './entities/friendship.entity';

@Injectable()
export class FriendshipsService {
  constructor(
    @InjectRepository(Friendship)
    private friendshipsRepository: Repository<Friendship>,
  ) {}

  async findAll(): Promise<Friendship[]> {
    return this.friendshipsRepository.find({ relations: ['user', 'friend'] });
  }

  async findByUser(userId: number): Promise<Friendship[]> {
    return this.friendshipsRepository.find({
      where: [{ user_id: userId }, { friend_id: userId }],
      relations: ['user', 'friend'],
    });
  }

  async create(userId: number, friendId: number): Promise<Friendship> {
    const friendship = this.friendshipsRepository.create({
      user_id: userId,
      friend_id: friendId,
      status: 'pending',
    });
    return this.friendshipsRepository.save(friendship);
  }

  async updateStatus(id: number, status: string): Promise<Friendship> {
    await this.friendshipsRepository.update(id, { status });
    const friendship = await this.friendshipsRepository.findOne({ where: { id } });
    if (!friendship) {
      throw new NotFoundException(`Friendship with ID ${id} not found`);
    }
    return friendship;
  }

  async remove(id: number): Promise<void> {
    const result = await this.friendshipsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Friendship with ID ${id} not found`);
    }
  }
}