import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { MatchParticipant } from './entities/match-participant.entity';
import { MatchStat } from './entities/match-stat.entity';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
    @InjectRepository(MatchParticipant)
    private participantsRepository: Repository<MatchParticipant>,
    @InjectRepository(MatchStat)
    private statsRepository: Repository<MatchStat>,
  ) {}

  async findAll(): Promise<Match[]> {
    try {
      return this.matchesRepository.find({
        relations: ['home_team', 'away_team', 'participants', 'stats'],
      });
    } catch (error) {
      // Fallback for older schema builds where participants/stats relations don't exist
      return this.matchesRepository.find({
        relations: ['home_team', 'away_team'],
      });
    }
  }

  async findOne(id: number): Promise<Match> {
    let match: Match | null = null;
    try {
      match = await this.matchesRepository.findOne({
        where: { id },
        relations: ['home_team', 'away_team', 'participants', 'stats'],
      });
    } catch (error) {
      match = await this.matchesRepository.findOne({
        where: { id },
        relations: ['home_team', 'away_team'],
      });
    }
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return match;
  }

  async create(data: Partial<Match>): Promise<Match> {
    const match = this.matchesRepository.create(data);
    return this.matchesRepository.save(match);
  }

  async addParticipant(matchId: number, userId: number, role: string = 'player'): Promise<MatchParticipant> {
    const participant = this.participantsRepository.create({
      match_id: matchId,
      user_id: userId,
      role,
    });
    return this.participantsRepository.save(participant);
  }

  async updateStats(matchId: number, userId: number, stats: Partial<MatchStat>): Promise<MatchStat> {
    let existingStat = await this.statsRepository.findOne({
      where: { match_id: matchId, user_id: userId },
    });
    if (existingStat) {
      Object.assign(existingStat, stats);
    } else {
      existingStat = this.statsRepository.create({
        match_id: matchId,
        user_id: userId,
        ...stats,
      });
    }
    return this.statsRepository.save(existingStat);
  }

  async updateStatus(id: number, status: string): Promise<Match> {
    await this.matchesRepository.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.matchesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
  }
}
