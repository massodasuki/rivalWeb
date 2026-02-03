import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityPost } from './entities/community-post.entity';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityPost)
    private postsRepository: Repository<CommunityPost>,
  ) {}

  async findAll(): Promise<CommunityPost[]> {
    return this.postsRepository.find({ relations: ['user'], order: { created_at: 'DESC' } });
  }

  async findOne(id: number): Promise<CommunityPost> {
    const post = await this.postsRepository.findOne({ where: { id }, relations: ['user'] });
    if (!post) {
      throw new NotFoundException(`Community post with ID ${id} not found`);
    }
    return post;
  }

  async create(data: Partial<CommunityPost>): Promise<CommunityPost> {
    const post = this.postsRepository.create(data);
    return this.postsRepository.save(post);
  }

  async update(id: number, updateData: Partial<CommunityPost>): Promise<CommunityPost> {
    await this.findOne(id);
    await this.postsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.postsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Community post with ID ${id} not found`);
    }
  }

  async reply(id: number, data: { user_id: number; content: string }): Promise<{ status: string }> {
    await this.findOne(id);
    return { status: 'reply_received' };
  }

  async registerEvent(data: { user_id: number; event_id: number }): Promise<{ status: string }> {
    return { status: 'event_registered' };
  }

  async joinEvent(data: { user_id: number; event_id: number }): Promise<{ status: string }> {
    return { status: 'event_joined' };
  }
}
