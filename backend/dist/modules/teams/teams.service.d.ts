import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';
import { TeamInvitation } from './entities/team-invitation.entity';
import { UsersService } from '../users/users.service';
export declare class TeamsService {
    private teamsRepository;
    private teamMembersRepository;
    private teamInvitationsRepository;
    private usersService;
    constructor(teamsRepository: Repository<Team>, teamMembersRepository: Repository<TeamMember>, teamInvitationsRepository: Repository<TeamInvitation>, usersService: UsersService);
    findAll(): Promise<Team[]>;
    findOne(id: number): Promise<Team>;
    create(data: Partial<Team>): Promise<Team>;
    addMember(teamId: number, userId: number, role?: string): Promise<TeamMember>;
    removeMember(teamId: number, userId: number): Promise<void>;
    update(id: number, updateData: Partial<Team>): Promise<Team>;
    remove(id: number): Promise<void>;
    inviteByEmail(teamId: number, email: string, inviterId: number): Promise<TeamInvitation>;
    acceptInvite(inviteId: number, userId: number): Promise<TeamMember>;
    declineInvite(inviteId: number, userId: number): Promise<{
        status: string;
    }>;
    getTeamInvitations(teamId: number): Promise<TeamInvitation[]>;
    getUserInvitations(email: string): Promise<TeamInvitation[]>;
    cancelInvitation(inviteId: number, userId: number): Promise<{
        status: string;
    }>;
    requestJoin(teamId: number, userId: number, message?: string): Promise<{
        status: string;
        message?: string;
    }>;
    getTeamMembers(teamId: number): Promise<TeamMember[]>;
}
