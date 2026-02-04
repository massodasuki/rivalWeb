import { TeamsService } from './teams.service';
import { Request } from 'express';
export declare class TeamsController {
    private teamsService;
    constructor(teamsService: TeamsService);
    findAll(): Promise<import("./entities/team.entity").Team[]>;
    findOne(id: number): Promise<import("./entities/team.entity").Team>;
    getMembers(id: number): Promise<import("./entities/team-member.entity").TeamMember[]>;
    getTeamInvitations(id: number): Promise<import("./entities/team-invitation.entity").TeamInvitation[]>;
    getUserInvitations(req: Request): Promise<import("./entities/team-invitation.entity").TeamInvitation[]>;
    create(data: {
        name: string;
        sport: string;
        captain_id?: number;
    }): Promise<import("./entities/team.entity").Team>;
    addMember(id: number, body: {
        user_id: number;
        role?: string;
    }): Promise<import("./entities/team-member.entity").TeamMember>;
    inviteByEmail(id: number, body: {
        email: string;
    }, req: Request): Promise<import("./entities/team-invitation.entity").TeamInvitation>;
    acceptInvite(inviteId: number, req: Request): Promise<import("./entities/team-member.entity").TeamMember>;
    declineInvite(inviteId: number, req: Request): Promise<{
        status: string;
    }>;
    cancelInvitation(inviteId: number, req: Request): Promise<{
        status: string;
    }>;
    requestJoin(id: number, body: {
        user_id: number;
        message?: string;
    }): Promise<{
        status: string;
        message?: string;
    }>;
    removeMember(id: number, userId: number): Promise<void>;
    update(id: number, data: Partial<{
        name: string;
        sport: string;
        captain_id: number;
    }>): Promise<import("./entities/team.entity").Team>;
    remove(id: number): Promise<void>;
}
