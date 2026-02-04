import { Team } from './team.entity';
import { User } from '../../auth/entities/user.entity';
export declare class TeamInvitation {
    id: number;
    team_id: number;
    invited_email: string;
    inviter_id: number;
    status: string;
    created_at: Date;
    team: Team;
    inviter: User;
}
