import { User } from '../../auth/entities/user.entity';
export declare class MatchStat {
    id: number;
    match_id: number;
    user_id: number;
    goals: number;
    assists: number;
    rating: number;
    match: any;
    user: User;
}
