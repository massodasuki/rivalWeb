import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { MatchParticipant } from './entities/match-participant.entity';
import { MatchStat } from './entities/match-stat.entity';
export declare class MatchesService {
    private matchesRepository;
    private participantsRepository;
    private statsRepository;
    constructor(matchesRepository: Repository<Match>, participantsRepository: Repository<MatchParticipant>, statsRepository: Repository<MatchStat>);
    findAll(): Promise<Match[]>;
    findOne(id: number): Promise<Match>;
    create(data: Partial<Match>): Promise<Match>;
    addParticipant(matchId: number, userId: number, role?: string): Promise<MatchParticipant>;
    updateStats(matchId: number, userId: number, stats: Partial<MatchStat>): Promise<MatchStat>;
    updateStatus(id: number, status: string): Promise<Match>;
    remove(id: number): Promise<void>;
}
