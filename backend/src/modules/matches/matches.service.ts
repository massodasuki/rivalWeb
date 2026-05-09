import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { MatchParticipant } from './entities/match-participant.entity';
import { MatchStat } from './entities/match-stat.entity';
import { ActivityLog } from '../users/entities/activity-log.entity';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
    @InjectRepository(MatchParticipant)
    private participantsRepository: Repository<MatchParticipant>,
    @InjectRepository(MatchStat)
    private statsRepository: Repository<MatchStat>,
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async findAll(filters?: { participantId?: number; createdBy?: number }): Promise<Match[]> {
    const qb = this.matchesRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.home_team', 'home_team')
      .leftJoinAndSelect('match.away_team', 'away_team')
      .leftJoinAndSelect('match.participants', 'participants')
      .leftJoinAndSelect('match.stats', 'stats');

    if (filters?.participantId) {
      qb.innerJoin(
        'match_participants',
        'filter_participant',
        'filter_participant.match_id = match.id AND filter_participant.user_id = :pid',
        { pid: filters.participantId },
      );
    }

    if (filters?.createdBy) {
      qb.innerJoin(
        'teams',
        'creator_team',
        'match.home_team_id = creator_team.id AND creator_team.captain_id = :cid',
        { cid: filters.createdBy },
      );
    }

    return qb.getMany();
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
    const saved = await this.participantsRepository.save(participant);

    try {
      await this.activityLogRepository.save({
        user_id: userId,
        type: 'match_join',
        message: `You joined match #${matchId}`,
      });
    } catch (err) {
      this.logger.error(`Failed to insert activity log for match join (user=${userId}, match=${matchId}): ${err}`);
    }

    return saved;
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
