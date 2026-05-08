import { Match } from './match.entity';
import { User } from '../../users/entities/user.entity';
export declare class MatchParticipant {
    id: number;
    match_id: number;
    user_id: number;
    role: string;
    joined_at: Date;
    match: Match;
    user: User;
}
