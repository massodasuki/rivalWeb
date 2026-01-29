import { TeamsService } from './teams.service';
export declare class TeamsController {
    private teamsService;
    constructor(teamsService: TeamsService);
    findAll(): Promise<import("./entities/team.entity").Team[]>;
    findOne(id: number): Promise<import("./entities/team.entity").Team>;
    create(data: {
        name: string;
        sport: string;
        captain_id?: number;
    }): Promise<import("./entities/team.entity").Team>;
    addMember(id: number, body: {
        user_id: number;
        role?: string;
    }): Promise<import("./entities/team-member.entity").TeamMember>;
    removeMember(id: number, userId: number): Promise<void>;
    update(id: number, data: Partial<{
        name: string;
        sport: string;
        captain_id: number;
    }>): Promise<import("./entities/team.entity").Team>;
    remove(id: number): Promise<void>;
}
