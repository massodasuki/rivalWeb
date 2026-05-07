import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievement)
    private achievementsRepository: Repository<Achievement>,
  ) {}

  async findAll(): Promise<Achievement[]> {
    return this.achievementsRepository.find({ relations: ['user'] });
  }

  async findByUser(userId: number): Promise<Achievement[]> {
    return this.achievementsRepository.find({
      where: { user_id: userId },
      relations: ['user'],
    });
  }

  async create(data: Partial<Achievement>): Promise<Achievement> {
    const achievement = this.achievementsRepository.create(data);
    return this.achievementsRepository.save(achievement);
  }

  async updateValue(userId: number, type: string, value: number): Promise<Achievement> {
    let achievement = await this.achievementsRepository.findOne({
      where: { user_id: userId, type },
    });
    if (achievement) {
      achievement.value = value;
    } else {
      achievement = this.achievementsRepository.create({
        user_id: userId,
        type,
        value,
      });
    }
    return this.achievementsRepository.save(achievement);
  }

  async remove(id: number): Promise<void> {
    const result = await this.achievementsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }
  }
}