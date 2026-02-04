import { User } from '../../auth/entities/user.entity';
import { TeamMember } from './team-member.entity';
import { TeamInvitation } from './team-invitation.entity';
export declare class Team {
    id: number;
    name: string;
    sport: string;
    captain_id: number;
    created_at: Date;
    updated_at: Date;
    captain: User;
    members: TeamMember[];
    invitations: TeamInvitation[];
}
