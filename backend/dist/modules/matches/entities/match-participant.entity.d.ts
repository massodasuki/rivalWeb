import { User } from '../../auth/entities/user.entity';
export declare class MatchParticipant {
    id: number;
    match_id: number;
    user_id: number;
    role: string;
    joined_at: Date;
    match: any;
    user: User;
}
