import { Team } from './team.entity';
import { User } from '../../auth/entities/user.entity';
export declare class TeamMember {
    id: number;
    team_id: number;
    user_id: number;
    role: string;
    joined_at: Date;
    team: Team;
    user: User;
}
