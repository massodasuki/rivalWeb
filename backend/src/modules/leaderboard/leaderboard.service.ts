import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../matches/entities/match.entity';
import { Team } from '../teams/entities/team.entity';
import { RedisService } from '../redis/redis.service';

export interface LeaderboardEntry {
  rank: number;
  teamId: number;
  teamName: string;
  sport: string;
  wins: number;
  points: number;
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    private readonly redisService: RedisService,
  ) {}

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    // 1. Check Redis cache first
    const cached = await this.redisService.getLeaderboard();
    if (cached) return cached as LeaderboardEntry[];

    // 2. Count completed matches where each team appears as home or away
    const homeWins = await this.matchRepository
      .createQueryBuilder('m')
      .select('m.home_team_id', 'teamId')
      .addSelect('COUNT(m.id)', 'wins')
      .where('m.status = :status', { status: 'completed' })
      .andWhere('m.home_team_id IS NOT NULL')
      .groupBy('m.home_team_id')
      .getRawMany();

    const awayWins = await this.matchRepository
      .createQueryBuilder('m')
      .select('m.away_team_id', 'teamId')
      .addSelect('COUNT(m.id)', 'wins')
      .where('m.status = :status', { status: 'completed' })
      .andWhere('m.away_team_id IS NOT NULL')
      .groupBy('m.away_team_id')
      .getRawMany();

    // 3. Merge and sum wins per team
    const winMap = new Map<number, number>();
    [...homeWins, ...awayWins].forEach((r) => {
      const id = Number(r.teamId);
      winMap.set(id, (winMap.get(id) || 0) + Number(r.wins));
    });

    // 4. Filter out teams with 0 wins (shouldn't happen but guard anyway)
    const teamIds = [...winMap.keys()].filter((id) => (winMap.get(id) || 0) > 0);

    if (teamIds.length === 0) {
      await this.redisService.setLeaderboard([]);
      return [];
    }

    // 5. Fetch team details
    const teams = await this.teamRepository.findByIds(teamIds);

    // 6. Sort descending by wins, limit 20, map to LeaderboardEntry
    const entries: LeaderboardEntry[] = teams
      .map((team) => ({
        rank: 0, // placeholder — assigned after sort
        teamId: team.id,
        teamName: team.name,
        sport: team.sport,
        wins: winMap.get(team.id) || 0,
        points: (winMap.get(team.id) || 0) * 3,
      }))
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 20)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    // 7. Cache and return
    await this.redisService.setLeaderboard(entries);
    return entries;
  }
}
