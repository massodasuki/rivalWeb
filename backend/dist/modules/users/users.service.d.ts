import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { MatchParticipant } from '../matches/entities/match-participant.entity';
import { MatchStat } from '../matches/entities/match-stat.entity';
export declare class UsersService {
    private usersRepository;
    private matchParticipantsRepository;
    private matchStatsRepository;
    constructor(usersRepository: Repository<User>, matchParticipantsRepository: Repository<MatchParticipant>, matchStatsRepository: Repository<MatchStat>);
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    getStats(id: number): Promise<{
        matches: number;
        wins: number;
        losses: number;
        goals: number;
        assists: number;
        rating: number;
    }>;
    update(id: number, updateData: Partial<User>): Promise<User>;
    remove(id: number): Promise<void>;
    updateNotifications(id: number, data: Record<string, boolean>): Promise<{
        status: string;
    }>;
    updatePrivacy(id: number, data: Record<string, boolean>): Promise<{
        status: string;
    }>;
    updatePassword(id: number, data: {
        current_password?: string;
        new_password: string;
    }): Promise<{
        status: string;
    }>;
}
