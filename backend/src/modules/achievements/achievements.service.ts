import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';
import { ActivityLog } from '../users/entities/activity-log.entity';

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(
    @InjectRepository(Achievement)
    private achievementsRepository: Repository<Achievement>,
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
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
    const saved = await this.achievementsRepository.save(achievement);

    try {
      await this.activityLogRepository.save({
        user_id: data.user_id,
        type: 'achievement',
        message: `Achievement unlocked: ${data.type || 'new achievement'}`,
      });
    } catch (err) {
      this.logger.error(`Failed to insert activity log for achievement create (user=${data.user_id}): ${err}`);
    }

    return saved;
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
    const saved = await this.achievementsRepository.save(achievement);

    try {
      await this.activityLogRepository.save({
        user_id: userId,
        type: 'achievement',
        message: `Achievement unlocked: ${type}`,
      });
    } catch (err) {
      this.logger.error(`Failed to insert activity log for achievement update (user=${userId}, type=${type}): ${err}`);
    }

    return saved;
  }

  async remove(id: number): Promise<void> {
    const result = await this.achievementsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }
  }
}