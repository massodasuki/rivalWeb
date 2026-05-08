import { Match } from './match.entity';
import { User } from '../../users/entities/user.entity';
export declare class MatchStat {
    id: number;
    match_id: number;
    user_id: number;
    goals: number;
    assists: number;
    rating: number;
    match: Match;
    user: User;
}
