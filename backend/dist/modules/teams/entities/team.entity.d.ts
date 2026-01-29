import { User } from '../../auth/entities/user.entity';
import { TeamMember } from './team-member.entity';
export declare class Team {
    id: number;
    name: string;
    sport: string;
    captain_id: number;
    created_at: Date;
    captain: User;
    members: TeamMember[];
}
