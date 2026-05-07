import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { MatchParticipant } from '../matches/entities/match-participant.entity';
import { MatchStat } from '../matches/entities/match-stat.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(MatchParticipant)
    private matchParticipantsRepository: Repository<MatchParticipant>,
    @InjectRepository(MatchStat)
    private matchStatsRepository: Repository<MatchStat>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async getStats(id: number) {
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

  async update(id: number, updateData: Partial<User>): Promise<User> {
    await this.findOne(id);
    await this.usersRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updateNotifications(id: number, data: Record<string, boolean>): Promise<{ status: string }> {
    await this.findOne(id);
    return { status: 'notifications_updated' };
  }

  async updatePrivacy(id: number, data: Record<string, boolean>): Promise<{ status: string }> {
    await this.findOne(id);
    return { status: 'privacy_updated' };
  }

  async updatePassword(id: number, data: { current_password: string; new_password: string }): Promise<{ status: string }> {
    const user = await this.findOne(id);
    if (!data.current_password || !(await bcrypt.compare(data.current_password, user.password_hash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const password_hash = await bcrypt.hash(data.new_password, 10);
    await this.usersRepository.update(id, { password_hash });
    return { status: 'password_updated' };
  }
}
